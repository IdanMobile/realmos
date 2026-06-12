import type { CostSummary } from "./cost";

export type RunKind =
  | "jarvis_chat"
  | "business_creation"
  | "agent_creation"
  | "speckit_generation"
  | "tool_action"
  | "memory_update"
  | "council_debate"
  | "governance_check";

export type Run = {
  id: string;
  businessId?: string;
  taskId?: string;
  requestedBy: {
    actorType: "user" | "agent" | "system";
    actorId?: string;
  };
  kind: RunKind;
  status: "queued" | "running" | "waiting_approval" | "completed" | "failed" | "cancelled";
  startedAt: string;
  completedAt?: string;
  cost?: CostSummary;
  eventIds: string[];
  outputArtifactIds: string[];
};
