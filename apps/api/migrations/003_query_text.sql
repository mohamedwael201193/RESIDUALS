-- Persist plaintext query for public ledger display (hash alone is not enough).
ALTER TABLE queries
  ADD COLUMN IF NOT EXISTS query_text TEXT;
