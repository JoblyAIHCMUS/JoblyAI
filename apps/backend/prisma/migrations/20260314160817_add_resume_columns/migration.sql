/*
  Warnings:

  - You are about to drop the `Resume` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fileName` to the `resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_candidateId_fkey";

-- AlterTable
ALTER TABLE "resume" ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL;

-- DropTable
DROP TABLE "Resume";
