-- Work packet lifecycle records (Initiative 0.25)

CREATE TABLE IF NOT EXISTS operational_work_packet_lifecycle (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);
