-- AlterTable
ALTER TABLE "pre_shortlist_question" ADD COLUMN "expectedAnswer" TEXT;

-- AlterTable
ALTER TABLE "pre_shortlist_answer" DROP COLUMN "llmScore";
ALTER TABLE "pre_shortlist_answer" DROP COLUMN "llmStatus";

-- DropEnum
DROP TYPE "LlmEvaluationStatus";
