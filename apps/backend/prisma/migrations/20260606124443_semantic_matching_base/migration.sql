-- CreateTable
CREATE TABLE "potential_match_cache" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "candidateId" TEXT NOT NULL,
    "insight" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "potential_match_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "potential_match_cache_jobId_idx" ON "potential_match_cache"("jobId");

-- CreateIndex
CREATE INDEX "potential_match_cache_candidateId_idx" ON "potential_match_cache"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "potential_match_cache_jobId_candidateId_key" ON "potential_match_cache"("jobId", "candidateId");

-- Create HNSW indexes for 768-dimensional vector search
CREATE INDEX IF NOT EXISTS "resume_embedding_idx" ON "resume" USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS "job_posting_embedding_idx" ON "JobPosting" USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS "candidate_description_embedding_idx" ON "CandidateDescription" USING hnsw (embedding vector_cosine_ops);
