-- Add the new column. Both schema.prisma and this migration use
-- the same default (false) to avoid Prisma drift detection.
ALTER TABLE "JobPosting"
  ADD COLUMN "preShortlistEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: every existing row lands as disabled. Employers must
-- explicitly re-enable pre-shortlist when they next edit a job.
UPDATE "JobPosting" SET "preShortlistEnabled" = false;
