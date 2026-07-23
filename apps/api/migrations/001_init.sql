CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS contributors (
  address     TEXT PRIMARY KEY CHECK (address ~ '^0x[a-fA-F0-9]{40}$'),
  handle      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entries (
  id            BIGSERIAL PRIMARY KEY,
  contributor   TEXT NOT NULL REFERENCES contributors(address),
  topic         TEXT NOT NULL,
  body          TEXT NOT NULL CHECK (length(body) BETWEEN 80 AND 2000),
  region        TEXT,
  embedding     VECTOR(768) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','pending','rejected')),
  distinct_payers INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS queries (
  id           BIGSERIAL PRIMARY KEY,
  query_hash   TEXT NOT NULL,
  payer        TEXT,
  paid_micros  BIGINT NOT NULL,
  entry_ids    BIGINT[] NOT NULL,
  scores       DOUBLE PRECISION[] NOT NULL,
  charged      BOOLEAN NOT NULL,
  answer       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accruals (
  id          BIGSERIAL PRIMARY KEY,
  contributor TEXT NOT NULL REFERENCES contributors(address),
  entry_id    BIGINT NOT NULL REFERENCES entries(id),
  query_id    BIGINT NOT NULL REFERENCES queries(id),
  micros      BIGINT NOT NULL CHECK (micros > 0),
  settled_tx  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payer_entry_seen (
  payer    TEXT   NOT NULL,
  entry_id BIGINT NOT NULL REFERENCES entries(id),
  PRIMARY KEY (payer, entry_id)
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
