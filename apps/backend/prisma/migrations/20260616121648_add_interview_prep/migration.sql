-- CreateEnum
CREATE TYPE "InterviewPrepStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "interview_preparation" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "status" "InterviewPrepStatus" NOT NULL DEFAULT 'PENDING',
    "questions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_preparation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_preparation_candidateId_jobId_key" ON "interview_preparation"("candidateId", "jobId");

-- AddForeignKey
ALTER TABLE "interview_preparation" ADD CONSTRAINT "interview_preparation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_preparation" ADD CONSTRAINT "interview_preparation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
