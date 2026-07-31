-- Enable trigram matching for typo-tolerant skill search.
-- pg_trgm is a standard PostgreSQL contrib module; pgvector/pgvector:pg17
-- image ships it (already used elsewhere in the project via 'vector' extension).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Functional GIN trigram index on lower("name") so:
--  1) matches are case-insensitive (e.g. "java" -> "JavaScript"),
--  2) the GIN index is used by the `%>` and `<%` operators and by
--     `word_similarity()` (when paired with the `LIMIT`-using plan).
-- The existing unique btree on "name" stays in place and is unaffected.
CREATE INDEX "Skill_name_lower_trgm_idx"
  ON "Skill" USING GIN (lower("name") gin_trgm_ops);
