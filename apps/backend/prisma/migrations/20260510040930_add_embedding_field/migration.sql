-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "CandidateDescription" ADD COLUMN     "embedding" vector(768);

-- AlterTable
ALTER TABLE "CandidateSkill" ADD COLUMN     "embedding" vector(768);

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "embedding" vector(768);

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "embedding" vector(768);

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "embedding" vector(768);

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "embedding" vector(768);
