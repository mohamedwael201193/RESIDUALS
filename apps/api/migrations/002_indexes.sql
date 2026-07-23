CREATE INDEX IF NOT EXISTS entries_embedding_ivfflat
  ON entries USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS accruals_contributor_settled
  ON accruals (contributor, settled_tx);

CREATE INDEX IF NOT EXISTS queries_created_at_desc
  ON queries (created_at DESC);

CREATE INDEX IF NOT EXISTS entries_status_active
  ON entries (status)
  WHERE status = 'active';
