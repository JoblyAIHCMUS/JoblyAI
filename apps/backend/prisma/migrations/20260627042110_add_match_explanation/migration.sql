-- AlterTable
ALTER TABLE "application" ADD COLUMN     "matchExplanation" JSONB,
ADD COLUMN     "scoringMode" TEXT DEFAULT 'hybrid';