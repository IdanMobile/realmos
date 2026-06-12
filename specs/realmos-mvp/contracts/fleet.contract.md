# Parallel Agent Fleet Contract

```ts
type FleetLane =
  | "planning"
  | "backend"
  | "frontend"
  | "design"
  | "qa"
  | "security"
  | "docs"
  | "research"
  | "governance"
  | "optimization"
  | "operations";

type CoordinationMode =
  | "serial"
  | "parallel"
  | "map_reduce"
  | "review_chain"
  | "council"
  | "handoff"
  | "race_with_review";

type FleetRunStatus =
  | "queued"
  | "ready"
  | "running"
  | "waiting_for_report"
  | "blocked"
  | "waiting_for_approval"
  | "succeeded"
  | "failed"
  | "cancelled";
```

## Rule

RealmOS supports multiple agents, workflows, and runs in parallel, but only under fleet control.

Parallelism must respect:

- dependencies
- conflicts
- approvals
- cost limits
- token limits
- risk limits
- STOP CHECK gates
- supervisor control
