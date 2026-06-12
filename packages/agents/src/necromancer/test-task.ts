import type { Agent, Task } from "@realmos/contracts";

function nowIso(): string {
  return new Date().toISOString();
}

function makeTaskId(agent: Agent): string {
  const slug = `${agent.name}_test`.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 32);
  return `task_${slug}_${Date.now().toString(36)}`;
}

export function createAgentTestTask(agent: Agent, businessId: string): Task {
  const timestamp = nowIso();

  return {
    id: makeTaskId(agent),
    businessId,
    title: `Activation test for ${agent.name}`,
    goal: `Verify ${agent.role} boundaries, output format, and role limits before activation.`,
    assignedAgentId: agent.id,
    status: "todo",
    priority: "medium",
    requiresApproval: false,
    dependencies: [],
    artifacts: [],
    auditEventIds: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
