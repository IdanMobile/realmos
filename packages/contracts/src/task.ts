export type TaskStatus = "todo" | "running" | "blocked" | "review" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type ArtifactRef = {
  id: string;
  kind: string;
  title: string;
  path?: string;
};

export type Task = {
  id: string;
  businessId?: string;
  title: string;
  goal: string;
  assignedAgentId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  requiresApproval: boolean;
  dependencies: string[];
  artifacts: ArtifactRef[];
  auditEventIds: string[];
  createdAt: string;
  updatedAt: string;
};
