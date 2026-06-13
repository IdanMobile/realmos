-- Verification evidence records (Initiative 0.33)

CREATE TABLE IF NOT EXISTS operational_verification_evidence (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);
