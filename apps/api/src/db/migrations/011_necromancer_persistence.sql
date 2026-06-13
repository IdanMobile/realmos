-- Durable Necromancer protect registry and operator action history (Initiative 0.34)

CREATE TABLE IF NOT EXISTS operational_necromancer_protections (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_necromancer_protections_candidate_id
  ON operational_necromancer_protections ((payload->>'candidateId'));

CREATE INDEX IF NOT EXISTS idx_necromancer_protections_realm_id
  ON operational_necromancer_protections ((payload->>'realmId'));

CREATE INDEX IF NOT EXISTS idx_necromancer_protections_operator_id
  ON operational_necromancer_protections ((payload->>'operatorId'));

CREATE TABLE IF NOT EXISTS operational_necromancer_actions (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_necromancer_actions_candidate_id
  ON operational_necromancer_actions ((payload->>'candidateId'));

CREATE INDEX IF NOT EXISTS idx_necromancer_actions_realm_id
  ON operational_necromancer_actions ((payload->>'realmId'));

CREATE INDEX IF NOT EXISTS idx_necromancer_actions_action_type
  ON operational_necromancer_actions ((payload->>'actionType'));

CREATE INDEX IF NOT EXISTS idx_necromancer_actions_operator_id
  ON operational_necromancer_actions ((payload->>'operatorId'));

CREATE INDEX IF NOT EXISTS idx_necromancer_actions_created_at
  ON operational_necromancer_actions ((payload->>'createdAt'));
