/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Employer" DROP CONSTRAINT "Employer_companyId_fkey";

-- DropIndex
DROP INDEX "Employer_companyId_employerId_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "adminId" INTEGER;

-- AlterTable
ALTER TABLE "Employer" ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "CandidateDescription" (
    "id" SERIAL NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateSkill" (
    "id" SERIAL NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "years" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateContact" (
    "id" SERIAL NOT NULL,
    "candidateId" TEXT NOT NULL,
    "type" TEXT,
    "value" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateSocial" (
    "id" SERIAL NOT NULL,
    "candidateId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateSocial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateDescription_candidateId_key" ON "CandidateDescription"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateDescription_candidateId_idx" ON "CandidateDescription"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateSkill_candidateId_idx" ON "CandidateSkill"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateContact_candidateId_idx" ON "CandidateContact"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateSocial_candidateId_idx" ON "CandidateSocial"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_adminId_key" ON "Company"("adminId");

-- AddForeignKey
ALTER TABLE "CandidateDescription" ADD CONSTRAINT "CandidateDescription_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateContact" ADD CONSTRAINT "CandidateContact_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSocial" ADD CONSTRAINT "CandidateSocial_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employer" ADD CONSTRAINT "Employer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
