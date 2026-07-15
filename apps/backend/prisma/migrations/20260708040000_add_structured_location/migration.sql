-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "formattedAddress" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_provider_providerId_key" ON "location"("provider", "providerId");

-- AlterTable (Add new column locationId first, keeping legacy location column)
ALTER TABLE "JobPosting" ADD COLUMN "locationId" TEXT;
ALTER TABLE "Experience" ADD COLUMN "locationId" TEXT;
ALTER TABLE "Company" ADD COLUMN "locationId" TEXT;

-- CreateTable for company locations many-to-many relationship
CREATE TABLE "_CompanyLocations" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanyLocations_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE INDEX "_CompanyLocations_B_index" ON "_CompanyLocations"("B");

-- Data Migration Step: Populate location table from existing strings and update locationIds
-- We use 'manual_' || MD5(location) as a uniform ID scheme to avoid conflicts for identical location strings.

-- For JobPosting
INSERT INTO "location" ("id", "provider", "providerId", "formattedAddress", "lat", "lng", "updatedAt")
SELECT 
  'manual_' || MD5(location),
  'manual',
  location,
  location,
  0.0,
  0.0,
  NOW()
FROM "JobPosting"
WHERE location IS NOT NULL AND TRIM(location) != ''
ON CONFLICT ("provider", "providerId") DO NOTHING;

UPDATE "JobPosting"
SET "locationId" = 'manual_' || MD5(location)
WHERE location IS NOT NULL AND TRIM(location) != '';

-- For Experience
INSERT INTO "location" ("id", "provider", "providerId", "formattedAddress", "lat", "lng", "updatedAt")
SELECT 
  'manual_' || MD5(location),
  'manual',
  location,
  location,
  0.0,
  0.0,
  NOW()
FROM "Experience"
WHERE location IS NOT NULL AND TRIM(location) != ''
ON CONFLICT ("provider", "providerId") DO NOTHING;

UPDATE "Experience"
SET "locationId" = 'manual_' || MD5(location)
WHERE location IS NOT NULL AND TRIM(location) != '';

-- For Company (primary location)
INSERT INTO "location" ("id", "provider", "providerId", "formattedAddress", "lat", "lng", "updatedAt")
SELECT 
  'manual_' || MD5(location),
  'manual',
  location,
  location,
  0.0,
  0.0,
  NOW()
FROM "Company"
WHERE location IS NOT NULL AND TRIM(location) != ''
ON CONFLICT ("provider", "providerId") DO NOTHING;

UPDATE "Company"
SET "locationId" = 'manual_' || MD5(location)
WHERE location IS NOT NULL AND TRIM(location) != '';

-- For Company (locations array)
INSERT INTO "location" ("id", "provider", "providerId", "formattedAddress", "lat", "lng", "updatedAt")
SELECT 
  'manual_' || MD5(loc),
  'manual',
  loc,
  loc,
  0.0,
  0.0,
  NOW()
FROM (
  SELECT DISTINCT unnest(locations) as loc
  FROM "Company"
  WHERE locations IS NOT NULL AND cardinality(locations) > 0
) t
WHERE loc IS NOT NULL AND TRIM(loc) != ''
ON CONFLICT ("provider", "providerId") DO NOTHING;

INSERT INTO "_CompanyLocations" ("A", "B")
SELECT 
  c.id,
  'manual_' || MD5(loc)
FROM (
  SELECT id, unnest(locations) as loc
  FROM "Company"
  WHERE locations IS NOT NULL AND cardinality(locations) > 0
) c
WHERE loc IS NOT NULL AND TRIM(loc) != ''
ON CONFLICT DO NOTHING;

-- Now we can drop the legacy columns safely!
ALTER TABLE "JobPosting" DROP COLUMN "location";
ALTER TABLE "Experience" DROP COLUMN "location";
ALTER TABLE "Company" DROP COLUMN "location";
ALTER TABLE "Company" DROP COLUMN "locations";

-- AddForeignKey constraints
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Company" ADD CONSTRAINT "Company_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_CompanyLocations" ADD CONSTRAINT "_CompanyLocations_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CompanyLocations" ADD CONSTRAINT "_CompanyLocations_B_fkey" FOREIGN KEY ("B") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
