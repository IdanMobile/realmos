export type AuditEventType =
  | "run_started"
  | "run_completed"
  | "run_failed"
  | "business_created"
  | "agent_created"
  | "task_created"
  | "memory_written"
  | "approval_requested"
  | "approval_approved"
  | "approval_rejected"
  | "tool_requested"
  | "tool_executed"
  | "tool_blocked"
  | "model_called"
  | "cost_recorded"
  | "artifact_created"
  | "risk_detected"
  | "policy_blocked";

export type AuditEvent = {
  id: string;
  actorType: "user" | "agent" | "system";
  actorId?: string;
  businessId?: string;
  taskId?: string;
  eventType: AuditEventType;
  summary: string;
  payload: unknown;
  createdAt: string;
};
