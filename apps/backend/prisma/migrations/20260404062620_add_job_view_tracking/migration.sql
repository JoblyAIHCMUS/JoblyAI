-- CreateTable
CREATE TABLE "job_view" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_view_jobId_viewedAt_idx" ON "job_view"("jobId", "viewedAt");

-- CreateIndex
CREATE INDEX "job_view_viewedAt_idx" ON "job_view"("viewedAt");

-- AddForeignKey
ALTER TABLE "job_view" ADD CONSTRAINT "job_view_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
