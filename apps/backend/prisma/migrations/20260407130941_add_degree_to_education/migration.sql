/*
  Warnings:

  - The `degree` column on the `Education` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD', 'OTHER');

-- AlterTable
ALTER TABLE "Education" DROP COLUMN "degree",
ADD COLUMN     "degree" "Degree";
