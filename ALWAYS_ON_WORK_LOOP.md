# RealmOS Always-On Work Loop v1

## Decision

RealmOS should continue working whenever safe work is available.

The user should not need to say "start" for every task.

The system pauses only when:

- a critical approval is required
- the action can only be done by the user
- a governance rule blocks the action
- context is missing and cannot be inferred safely
- the current phase requires a STOP CHECK review
- the risk/cost/permission level exceeds the configured autonomy level

## Core Principle

```text
Always work on safe, approved, next-best work.
Stop only for human-only or high-risk decisions.
```

## Bootstrap Reality

At first, Cursor is still the executor.

Jarvis/RealmOS manages the work loop:

```text
RealmOS picks next safe task
        ↓
RealmOS generates Cursor Work Packet
        ↓
User/automation gives packet to Cursor
        ↓
Cursor executes
        ↓
Cursor returns completion report
        ↓
RealmOS imports result
        ↓
RealmOS updates tasks/runs/decisions/errors
        ↓
RealmOS selects next safe task
```

Later, when tool execution is safe and governed, some steps can become automated.

## Autonomy Levels

```ts
type AutonomyLevel =
  | "manual_only"
  | "auto_plan"
  | "auto_prepare"
  | "auto_execute_safe"
  | "auto_execute_with_review"
  | "fully_autonomous_guarded";
```

### manual_only

System only suggests work.

### auto_plan

System can choose next task and create plans.

### auto_prepare

System can generate implementation packets, specs, checklists, and prompts.

### auto_execute_safe

System can execute low-risk deterministic actions that are already approved.

### auto_execute_with_review

System can execute broader work but requires review before merge/deploy/destructive actions.

### fully_autonomous_guarded

Future mode only. Requires mature governance, sandboxing, logging, approval gates, cost limits, and rollback.

## Recommended Starting Mode

Start with:

```text
auto_prepare
```

This means Jarvis can:

- select next safe task
- generate Cursor Work Packet
- generate specs/tasks/checklists
- update internal project state after report import
- prepare next recommended work
- surface blockers/approvals

But Jarvis cannot:

- run arbitrary terminal commands
- delete files
- spend money
- deploy
- message external people
- connect sensitive accounts
- modify production systems
- bypass STOP CHECK gates

## Work Queue

Every task should have:

```ts
type WorkItem = {
  id: string;
  title: string;
  businessId: string;
  phaseId?: string;
  taskId?: string;
  status:
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
  priority: "low" | "normal" | "high" | "critical";
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredApproval?: boolean;
  blockedBy?: string[];
  dependencies?: string[];
  stopCheckRequired?: boolean;
  assignedAgentId?: string;
  executionMode: "human" | "cursor" | "internal_agent" | "deterministic_worker";
  createdAt: string;
  updatedAt: string;
};
```

## Next-Best-Work Selection

Jarvis should continuously select work using this priority order:

1. critical system errors that do not require user approval
2. unblock active phase
3. finish in-progress safe tasks
4. run verification/checks for completed work
5. prepare next Cursor Work Packet
6. update docs/specs/tasks after completed work
7. generate reports/summaries
8. optimize repeated failures
9. prepare next phase
10. ask user only when required

## Human-Only Gate

Work pauses and asks the user only when one of these is true:

- spending money
- subscription/API key required
- external message/contact
- destructive file/data operation
- production deployment
- permission escalation
- sensitive account connection
- legal/financial/medical decision
- unclear product decision with high impact
- critical architecture fork
- STOP CHECK says user review required

## Always-On Worker

The Always-On Worker is not "one agent doing everything."

It is a scheduler/orchestrator that:

- scans work queue
- checks dependencies
- checks governance
- asks Jarvis to select next work
- creates/updates runs
- creates Cursor Work Packets
- waits for completion reports
- imports results
- updates tasks and phase state
- escalates only when needed

## State Machine

```text
candidate
  ↓
ready
  ↓
running
  ↓
waiting_for_report
  ↓
done

blocked → ready
waiting_for_approval → ready
waiting_for_user → ready
failed → ready / cancelled
```

## Cursor Work Packet Lifecycle

```text
draft
  ↓
ready_for_cursor
  ↓
sent_to_cursor
  ↓
running_in_cursor
  ↓
report_received
  ↓
verified
  ↓
accepted / needs_fix
```

## User Experience

The user should see:

```text
Jarvis is working on:
- P1.18 Communication Ledger contracts
- Generating next Cursor Work Packet
- Waiting for report from Cursor on API contracts

Needs your attention:
- 1 critical approval
- 1 STOP CHECK review
```

## Dashboard Requirements

Add a RealmOS Build Console with:

- current phase
- current work item
- next recommended work
- active Cursor Work Packet
- waiting for report
- blocked items
- approval-required items
- STOP CHECK items
- completed today
- progress by phase
- "Continue Safe Work" toggle
- autonomy level selector
- activity timeline

## Rule

The system does not ask the user to start safe work.

It only asks the user for approvals, critical decisions, missing human-only context, or STOP CHECK reviews.
