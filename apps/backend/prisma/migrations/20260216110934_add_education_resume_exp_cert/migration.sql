-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "RequirementImportance" AS ENUM ('REQUIRED', 'PREFERRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');

-- CreateTable
CREATE TABLE "JobCategory"
(
    "id"   SERIAL NOT NULL,
    "name" TEXT   NOT NULL,
    "slug" TEXT   NOT NULL,

    CONSTRAINT "JobCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill"
(
    "id"   SERIAL NOT NULL,
    "name" TEXT   NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting"
(
    "id"          SERIAL           NOT NULL,
    "title"       TEXT             NOT NULL,
    "description" TEXT             NOT NULL,
    "location"    TEXT,
    "salaryMin"   DECIMAL(65, 30),
    "salaryMax"   DECIMAL(65, 30),
    "currency"    TEXT                      DEFAULT 'USD',
    "status"      "JobStatus"      NOT NULL DEFAULT 'DRAFT',
    "remote"      BOOLEAN          NOT NULL DEFAULT false,
    "type"        "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "postedById"  TEXT             NOT NULL,
    "categoryId"  INTEGER          NOT NULL,
    "companyName" TEXT,
    "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequirement"
(
    "id"                 SERIAL                  NOT NULL,
    "jobPostingId"       INTEGER                 NOT NULL,
    "skillId"            INTEGER                 NOT NULL,
    "importance"         "RequirementImportance" NOT NULL DEFAULT 'PREFERRED',
    "minYearsExperience" INTEGER,

    CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education"
(
    "id"           SERIAL       NOT NULL,
    "candidateId"  TEXT         NOT NULL,
    "school"       TEXT         NOT NULL,
    "degree"       TEXT,
    "fieldOfStudy" TEXT,
    "startDate"    TIMESTAMP(3) NOT NULL,
    "endDate"      TIMESTAMP(3),
    "grade"        TEXT,
    "description"  TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience"
(
    "id"          SERIAL       NOT NULL,
    "candidateId" TEXT         NOT NULL,
    "companyName" TEXT         NOT NULL,
    "jobTitle"    TEXT         NOT NULL,
    "location"    TEXT,
    "startDate"   TIMESTAMP(3) NOT NULL,
    "endDate"     TIMESTAMP(3),
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate"
(
    "id"           SERIAL       NOT NULL,
    "candidateId"  TEXT         NOT NULL,
    "name"         TEXT         NOT NULL,
    "issuer"       TEXT         NOT NULL,
    "issueDate"    TIMESTAMP(3) NOT NULL,
    "expiryDate"   TIMESTAMP(3),
    "credentialId" TEXT,
    "url"          TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume"
(
    "id"          SERIAL       NOT NULL,
    "candidateId" TEXT         NOT NULL,
    "fileUrl"     TEXT         NOT NULL,
    "fileName"    TEXT         NOT NULL,
    "fileType"    TEXT         NOT NULL,
    "fileSize"    INTEGER      NOT NULL,
    "isDefault"   BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobCategory_name_key" ON "JobCategory" ("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobCategory_slug_key" ON "JobCategory" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill" ("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobRequirement_jobPostingId_skillId_key" ON "JobRequirement" ("jobPostingId", "skillId");

-- CreateIndex
CREATE INDEX "Education_candidateId_idx" ON "Education" ("candidateId");

-- CreateIndex
CREATE INDEX "Experience_candidateId_idx" ON "Experience" ("candidateId");

-- CreateIndex
CREATE INDEX "Certificate_candidateId_idx" ON "Certificate" ("candidateId");

-- CreateIndex
CREATE INDEX "Resume_candidateId_idx" ON "Resume" ("candidateId");

-- AddForeignKey
ALTER TABLE "JobPosting"
    ADD CONSTRAINT "JobPosting_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting"
    ADD CONSTRAINT "JobPosting_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "JobCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement"
    ADD CONSTRAINT "JobRequirement_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement"
    ADD CONSTRAINT "JobRequirement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education"
    ADD CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience"
    ADD CONSTRAINT "Experience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate"
    ADD CONSTRAINT "Certificate_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume"
    ADD CONSTRAINT "Resume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
