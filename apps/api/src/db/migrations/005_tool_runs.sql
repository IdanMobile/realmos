CREATE TABLE IF NOT EXISTS tool_run_requests (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS tool_run_results (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);
