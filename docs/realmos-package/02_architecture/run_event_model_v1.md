# RealmOS — Run and Event Model v1

## Purpose

Every meaningful operation should be traceable.

A run is one execution session.

Examples:

- Jarvis creates business
- Necromancer creates agents
- Pavel generates SpecKit
- Rick performs research
- terminal command is requested
- approval is resolved

## Run Contract

```ts
type Run = {
  id: string;
  businessId?: string;
  taskId?: string;
  requestedBy: {
    actorType: "user" | "agent" | "system";
    actorId?: string;
  };
  kind:
    | "jarvis_chat"
    | "business_creation"
    | "agent_creation"
    | "speckit_generation"
    | "tool_action"
    | "memory_update"
    | "council_debate"
    | "governance_check";
  status: "queued" | "running" | "waiting_approval" | "completed" | "failed" | "cancelled";
  startedAt: string;
  completedAt?: string;
  cost?: CostSummary;
  eventIds: string[];
  outputArtifactIds: string[];
};
```

## Event Types

```text
run_started
run_completed
run_failed
business_created
agent_created
task_created
memory_written
approval_requested
approval_approved
approval_rejected
tool_requested
tool_executed
tool_blocked
model_called
cost_recorded
artifact_created
risk_detected
policy_blocked
```

## Why This Matters

This is the foundation for:

- audit log
- debugging
- agent performance
- replay
- cost analysis
- security review
- future “black box” / flight recorder behavior
