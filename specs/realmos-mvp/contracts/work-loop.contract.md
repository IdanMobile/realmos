# Always-On Work Loop Contract

```ts
type AutonomyLevel =
  | "manual_only"
  | "auto_plan"
  | "auto_prepare"
  | "auto_execute_safe"
  | "auto_execute_with_review"
  | "fully_autonomous_guarded";

type WorkItemStatus =
  | "candidate"
  | "ready"
  | "running"
  | "waiting_for_report"
  | "blocked"
  | "waiting_for_user"
  | "waiting_for_approval"
  | "done"
  | "failed"
  | "cancelled";

type ExecutionMode =
  | "human"
  | "cursor"
  | "internal_agent"
  | "deterministic_worker";

type WorkItem = {
  id: string;
  title: string;
  businessId: string;
  phaseId?: string;
  taskId?: string;
  status: WorkItemStatus;
  priority: "low" | "normal" | "high" | "critical";
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredApproval?: boolean;
  blockedBy?: string[];
  dependencies?: string[];
  stopCheckRequired?: boolean;
  assignedAgentId?: string;
  executionMode: ExecutionMode;
  createdAt: string;
  updatedAt: string;
};
```

## Rules

The system should continue safe work without requiring the user to manually start each task.

The system must pause for:

- critical approvals
- user-only actions
- high-risk work
- destructive actions
- spending/subscriptions
- external communications
- STOP CHECK reviews
- missing context that cannot be inferred safely
