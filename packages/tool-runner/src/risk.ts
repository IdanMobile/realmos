import type { Agent, RiskLevel, ToolPermission, ToolRunKind } from "@realmos/contracts";
import { getToolDefinition } from "./registry";
import { isDangerousTerminalCommand, isForbiddenToolForMvp } from "./forbidden";

export type ToolPermissionCheck = {
  allowed: boolean;
  reason?: string;
};

export function agentHasToolPermission(
  agent: Agent | undefined,
  tool: ToolPermission["tool"],
  requiredAccess: ToolPermission["access"]
): ToolPermissionCheck {
  if (!agent) {
    return { allowed: true, reason: "No agent context; user-initiated request." };
  }

  const permission = agent.tools.find((entry) => entry.tool === tool);
  if (!permission || permission.access === "none") {
    return { allowed: false, reason: `Agent lacks ${tool} permission.` };
  }

  const rank = { none: 0, read: 1, write: 2, execute: 3 } as const;
  if (rank[permission.access] < rank[requiredAccess]) {
    return { allowed: false, reason: `Agent ${tool} access is ${permission.access}; need ${requiredAccess}.` };
  }

  return { allowed: true };
}

export function classifyToolRunRisk(input: {
  kind: ToolRunKind;
  tool: ToolPermission["tool"];
  payload: Record<string, unknown>;
}): RiskLevel {
  const definition = getToolDefinition(input.tool);
  if (!definition) return "high";

  if (input.kind === "terminal_command") {
    const command = String(input.payload.command ?? "");
    if (isDangerousTerminalCommand(command)) return "critical";
    return "high";
  }

  return definition.riskLevel;
}

export function requiresToolRunApproval(input: {
  kind: ToolRunKind;
  tool: ToolPermission["tool"];
  riskLevel: RiskLevel;
}): boolean {
  const definition = getToolDefinition(input.tool);
  if (!definition) return true;
  if (isForbiddenToolForMvp(input.tool)) return true;
  if (input.kind === "terminal_command") return true;
  if (definition.requiresApproval) return true;
  return input.riskLevel === "high" || input.riskLevel === "critical";
}

export function isTerminalExecutionEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.REALMOS_TERMINAL_ENABLED === "true" || env.REALMOS_ALLOW_TERMINAL === "true";
}

export function getToolRunnerMode(env: NodeJS.ProcessEnv = process.env): "dry_run" | "mock" {
  return env.REALMOS_TOOL_RUNNER_MODE === "mock" ? "mock" : "dry_run";
}
