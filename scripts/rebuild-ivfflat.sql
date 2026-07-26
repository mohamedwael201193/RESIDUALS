-- Run after seeding ≥80 rows for better recall
DROP INDEX IF EXISTS entries_embedding_ivfflat;
CREATE INDEX entries_embedding_ivfflat
  ON entries USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
