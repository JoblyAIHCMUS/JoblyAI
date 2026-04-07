/*
  Warnings:

  - The `type` column on the `CandidateContact` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `title` on the `CandidateSkill` table. All the data in the column will be lost.
  - The `level` column on the `CandidateSkill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[candidateId,skillId]` on the table `CandidateSkill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `skillId` to the `CandidateSkill` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `platform` on the `CandidateSocial` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CandidateExperienceType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'ONSITE', 'REMOTE', 'HYBRID', 'OTHER');

-- CreateEnum
CREATE TYPE "CandidateSkillLevel" AS ENUM ('NOVICE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MASTER');

-- CreateEnum
CREATE TYPE "CandidateContactType" AS ENUM ('PHONE', 'EMAIL', 'FAX', 'WEBSITE', 'LINKEDIN', 'GITHUB', 'OTHER');

-- CreateEnum
CREATE TYPE "CandidateSocialPlatform" AS ENUM ('LINKEDIN', 'GITHUB', 'FACEBOOK', 'TWITTER', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'DRIBBBLE', 'BEHANCE', 'OTHER');

-- AlterTable
ALTER TABLE "CandidateContact" DROP COLUMN "type",
ADD COLUMN     "type" "CandidateContactType";

-- AlterTable
ALTER TABLE "CandidateSkill" DROP COLUMN "title",
ADD COLUMN     "skillId" INTEGER NOT NULL,
DROP COLUMN "level",
ADD COLUMN     "level" "CandidateSkillLevel";

-- AlterTable
ALTER TABLE "CandidateSocial" DROP COLUMN "platform",
ADD COLUMN     "platform" "CandidateSocialPlatform" NOT NULL;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "type",
ADD COLUMN     "type" "CandidateExperienceType";

-- CreateIndex
CREATE INDEX "CandidateSkill_skillId_idx" ON "CandidateSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkill_candidateId_skillId_key" ON "CandidateSkill"("candidateId", "skillId");

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
