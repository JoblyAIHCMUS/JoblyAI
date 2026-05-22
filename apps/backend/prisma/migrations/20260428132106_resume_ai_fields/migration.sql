-- AlterTable
ALTER TABLE "CandidateContact" ADD COLUMN     "sourceCvIds" INTEGER[];

-- AlterTable
ALTER TABLE "CandidateDescription" ADD COLUMN     "rawDescriptions" JSONB;

-- AlterTable
ALTER TABLE "CandidateSkill" ADD COLUMN     "sourceCvIds" INTEGER[];

-- AlterTable
ALTER TABLE "CandidateSocial" ADD COLUMN     "sourceCvIds" INTEGER[];

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "sourceCvIds" INTEGER[];

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "sourceCvIds" INTEGER[];

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "sourceCvIds" INTEGER[];

-- AlterTable
ALTER TABLE "resume" ADD COLUMN     "aiFeedback" JSONB,
ADD COLUMN     "isSyncedToProfile" BOOLEAN NOT NULL DEFAULT true;
