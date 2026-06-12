# Task Contract

```ts
type Task = {
  id: string;
  businessId?: string;
  title: string;
  goal: string;
  assignedAgentId?: string;
  status: "todo" | "running" | "blocked" | "review" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  dependencies: string[];
  artifacts: ArtifactRef[];
  auditEventIds: string[];
  createdAt: string;
  updatedAt: string;
};
```
