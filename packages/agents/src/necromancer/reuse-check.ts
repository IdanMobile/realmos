import type { Agent } from "@realmos/contracts";

export function findReusableAgent(
  agents: Agent[],
  criteria: { businessId: string; role: string }
): Agent | undefined {
  const normalizedRole = criteria.role.trim().toLowerCase();

  return agents.find(
    (agent) =>
      agent.businessId === criteria.businessId &&
      agent.role.trim().toLowerCase() === normalizedRole &&
      agent.status !== "retired"
  );
}

export type ReuseCheckResult =
  | { outcome: "reuse"; agent: Agent; reason: string }
  | { outcome: "create"; reason: string };

export function checkReuseBeforeCreate(
  agents: Agent[],
  criteria: { businessId: string; role: string }
): ReuseCheckResult {
  const existing = findReusableAgent(agents, criteria);
  if (existing) {
    return {
      outcome: "reuse",
      agent: existing,
      reason: `Existing agent ${existing.name} already covers role ${criteria.role}.`
    };
  }

  return {
    outcome: "create",
    reason: `No active agent found for role ${criteria.role} in business ${criteria.businessId}.`
  };
}
