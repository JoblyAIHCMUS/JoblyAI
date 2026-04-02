/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `resume` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "resume" DROP COLUMN "fileUrl",
ADD COLUMN     "fileKey" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "image",
ADD COLUMN     "avatarUrl" TEXT;
