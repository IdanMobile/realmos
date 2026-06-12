-- Durable run-state / self-handoff records (Initiative 0.27)

CREATE TABLE IF NOT EXISTS operational_run_state_handoff (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);
