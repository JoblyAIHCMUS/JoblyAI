-- CreateEnum
CREATE TYPE "LlmEvaluationStatus" AS ENUM ('STRONG_FIT', 'GOOD_FIT', 'NEUTRAL', 'POOR_FIT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'PRE_SHORTLIST_PENDING';
ALTER TYPE "ApplicationStatus" ADD VALUE 'PRE_SHORTLIST_SUBMITTED';

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "preShortlistThreshold" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "pre_shortlist_question" (
    "id" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_shortlist_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_shortlist_answer" (
    "id" TEXT NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "llmComment" TEXT,
    "llmScore" DOUBLE PRECISION,
    "llmStatus" "LlmEvaluationStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_shortlist_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pre_shortlist_question_jobId_order_idx" ON "pre_shortlist_question"("jobId", "order");

-- CreateIndex
CREATE INDEX "pre_shortlist_answer_applicationId_idx" ON "pre_shortlist_answer"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "pre_shortlist_answer_applicationId_questionId_key" ON "pre_shortlist_answer"("applicationId", "questionId");

-- AddForeignKey
ALTER TABLE "pre_shortlist_question" ADD CONSTRAINT "pre_shortlist_question_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_shortlist_answer" ADD CONSTRAINT "pre_shortlist_answer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_shortlist_answer" ADD CONSTRAINT "pre_shortlist_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pre_shortlist_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
