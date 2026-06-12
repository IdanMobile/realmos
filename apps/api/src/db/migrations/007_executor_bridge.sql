-- Local executor bridge dispatches (Initiative 0.24)

CREATE TABLE IF NOT EXISTS operational_executor_dispatches (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);
