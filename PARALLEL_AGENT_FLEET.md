# RealmOS Parallel Agent Fleet / Swarm Control v1

## Decision

RealmOS should support parallel work across multiple agents, workflows, and runs.

But the system should not behave like an uncontrolled swarm.

The correct model is a governed fleet:

```text
many agents
many workflows
many runs
shared queue
dependency graph
resource limits
approval gates
conflict detection
supervisor control
audit trail
```

## Principle

```text
Parallel by default where safe.
Serialized where risky, dependent, or conflicting.
```

## Why

RealmOS needs parallelism because building and operating businesses requires many simultaneous work streams:

- backend tasks
- frontend tasks
- QA checks
- design work
- research
- risk review
- docs/spec updates
- artifact generation
- monitoring
- optimization
- support/operations
- project self-build work

But parallelism introduces risks:

- duplicate work
- agents modifying same files
- conflicting architecture decisions
- token/cost spikes
- test failures hidden by noise
- unsafe actions running at the same time
- unclear ownership
- race conditions in project state

So RealmOS needs fleet control.

## Concepts

### Fleet

A group of agents and workers available to execute work.

### Squad

A smaller group assigned to a specific business, phase, or workflow.

### Lane

A controlled work category.

Examples:

- planning
- backend
- frontend
- design
- QA
- security
- docs
- research
- governance
- optimization

### Run

A single execution instance of a workflow or task.

### Workflow

A repeatable process composed of steps.

### Work Item

A task or execution unit selected by the Always-On Work Loop.

### Supervisor

An agent or system role that controls assignment, dependency checks, and escalation.

## Recommended Model

```text
Jarvis / Orchestrator
  ↓
Fleet Controller
  ↓
Lane Managers
  ↓
Agents / Workflows / Deterministic Workers
```

## Fleet Controller Responsibilities

The Fleet Controller:

- scans ready work
- groups work by lane
- checks dependencies
- checks conflicts
- checks approvals
- checks resource limits
- assigns work to agents/workflows
- starts runs
- pauses conflicting work
- merges completion reports
- escalates blockers
- updates project progress
- prevents overload

## Parallelism Rules

### Allowed in parallel

Safe examples:

- one agent writes docs while another runs research
- frontend mockup planning while backend contract design happens
- QA reviewing completed task while Cursor prepares next safe packet
- System Optimizer analyzing old runs while current task continues
- Capability Scout researching tools while PM breaks down tasks

### Not allowed in parallel without control

Risky examples:

- two agents editing same file/package
- two architecture decisions about same module
- migration work while schema contract is still changing
- deployment while tests are failing
- cost-heavy model runs without budget check
- external account integrations without approval
- multiple agents asking the user the same question

## Conflict Detection

Before assigning parallel work, RealmOS must check:

- same files
- same package
- same business object
- same task
- same approval
- same decision area
- same database migration
- same external integration
- same budget pool
- same deployment target

If conflict is detected, work should be:

- serialized
- assigned to same squad
- escalated to supervisor
- or converted into review work

## Capacity Limits

Fleet control should define limits:

```ts
type FleetCapacityPolicy = {
  maxConcurrentRuns: number;
  maxConcurrentRunsPerBusiness: number;
  maxConcurrentRunsPerLane: Record<string, number>;
  maxCostPerHourUsd?: number;
  maxTokensPerHour?: number;
  requireApprovalAboveRisk: "low" | "medium" | "high";
};
```

## Work Assignment

A WorkItem can be assigned to:

- human
- Cursor executor
- internal agent
- deterministic worker
- external workflow
- squad

## Coordination Modes

```ts
type CoordinationMode =
  | "serial"
  | "parallel"
  | "map_reduce"
  | "review_chain"
  | "council"
  | "handoff"
  | "race_with_review";
```

### serial

One step at a time.

### parallel

Independent work items run together.

### map_reduce

Multiple agents analyze separate parts, then one reducer summarizes.

### review_chain

One agent produces, another reviews, another approves.

### council

Multiple agents debate/advise before decision.

### handoff

One agent completes work and passes to another.

### race_with_review

Multiple agents propose solutions, reviewer picks best. Use sparingly due to cost.

## MVP Support

For MVP, do not build a fully autonomous swarm.

Build:

- fleet model
- lanes
- run queue
- capacity policy
- conflict checks
- assignment records
- run status dashboard
- safe parallel work selection
- Cursor work packets per lane
- supervisor escalation

## Bootstrap With Cursor

At first, Cursor is still one physical execution tool.

But RealmOS can still prepare multiple parallel work packets:

```text
Backend packet
Frontend packet
QA packet
Docs packet
Research packet
```

The user can choose to run them in:

- one Cursor workspace sequentially
- multiple Cursor windows
- multiple branches/worktrees
- multiple machines later

RealmOS tracks them as separate runs.

## Future Support

Later, RealmOS can use:

- local workers
- sandboxed agents
- queue workers
- n8n workflows
- Git worktrees
- CI runners
- containerized execution
- cloud agents
- multiple model providers

## UI Requirements

Add Fleet / Swarm Control screen with:

- active runs
- queued runs
- lanes
- squads
- agents
- capacity usage
- cost/tokens
- conflicts
- blockers
- approvals
- run graph
- dependency map
- pause/resume controls
- supervisor notes

## Safety Rule

Parallelism must never bypass governance.

If work requires approval in serial mode, it also requires approval in parallel mode.
