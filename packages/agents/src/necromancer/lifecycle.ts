import type { Agent, AgentStatus } from "@realmos/contracts";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAssignTaskToAgent(agent: Agent): boolean {
  return agent.status === "active" || agent.status === "testing";
}

export function pauseAgent(agent: Agent): Agent {
  if (agent.status === "retired") {
    throw new Error(`Agent ${agent.id} is retired and cannot be paused.`);
  }

  return { ...agent, status: "paused", updatedAt: nowIso() };
}

export function retireAgent(agent: Agent): Agent {
  return { ...agent, status: "retired", updatedAt: nowIso() };
}

export function activateAgent(agent: Agent): Agent {
  if (agent.status === "retired") {
    throw new Error(`Agent ${agent.id} is retired and cannot be activated.`);
  }

  return { ...agent, status: "active", updatedAt: nowIso() };
}

export function markAgentTesting(agent: Agent): Agent {
  if (agent.status === "retired") {
    throw new Error(`Agent ${agent.id} is retired and cannot enter testing.`);
  }

  return { ...agent, status: "testing", updatedAt: nowIso() };
}

export function isValidLifecycleTransition(from: AgentStatus, to: AgentStatus): boolean {
  if (from === to) return true;
  if (from === "retired") return false;
  if (to === "retired") return true;
  if (from === "draft" && (to === "testing" || to === "active" || to === "paused")) return true;
  if (from === "testing" && (to === "active" || to === "paused" || to === "draft")) return true;
  if (from === "active" && (to === "paused" || to === "testing")) return true;
  if (from === "paused" && (to === "active" || to === "testing" || to === "draft")) return true;
  return false;
}
