-- AlterTable
ALTER TABLE "user" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "sizeRange" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "employerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_employerId_key" ON "Employer"("employerId");

-- CreateIndex
CREATE INDEX "Employer_companyId_idx" ON "Employer"("companyId");

-- CreateIndex
CREATE INDEX "Employer_employerId_idx" ON "Employer"("employerId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_companyId_employerId_key" ON "Employer"("companyId", "employerId");

-- AddForeignKey
ALTER TABLE "Employer" ADD CONSTRAINT "Employer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employer" ADD CONSTRAINT "Employer_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
