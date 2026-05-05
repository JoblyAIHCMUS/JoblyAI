-- CreateExtension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- AddColumn
ALTER TABLE "Company"
ADD COLUMN "slug" TEXT;

-- Backfill existing rows with unique slugs derived from company names
WITH normalized AS (
  SELECT
    id,
    CASE
      WHEN trim(regexp_replace(regexp_replace(lower(unaccent(name)), '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) = ''
        THEN 'company'
      ELSE trim(regexp_replace(regexp_replace(lower(unaccent(name)), '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
    END AS base_slug
  FROM "Company"
),
ranked AS (
  SELECT
    id,
    base_slug,
    row_number() OVER (PARTITION BY base_slug ORDER BY id) AS rn
  FROM normalized
)
UPDATE "Company" company
SET slug = CASE
  WHEN ranked.rn = 1 THEN ranked.base_slug
  ELSE ranked.base_slug || '-' || ranked.rn
END
FROM ranked
WHERE company.id = ranked.id;

-- Make slug required and unique
ALTER TABLE "Company"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");