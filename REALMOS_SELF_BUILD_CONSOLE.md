# RealmOS Self-Build Console v1

## Purpose

The Self-Build Console lets RealmOS manage the creation of RealmOS.

Cursor remains the first executor, but RealmOS owns the work plan, progress tracking, governance, and next-step selection.

## Main Screen

```text
RealmOS Self-Build Console

Current Phase:
Phase 1 — Core Contracts

Current Work:
P1.18 Communication Ledger contracts

Status:
Waiting for Cursor completion report

Next Safe Work:
Generate UI implementation packet for Build Console

Needs User:
1 approval
1 STOP CHECK

Progress:
Phase 1: 72%
MVP: 18%
```

## Core Panels

### Current Phase

Shows:

- phase name
- phase goal
- phase progress
- current gates
- open blockers

### Active Work

Shows:

- current work item
- assigned agent
- execution mode
- risk level
- status
- expected output

### Cursor Work Packets

Shows:

- draft packets
- ready packets
- sent packets
- waiting reports
- imported reports

### Needs User

Only critical items:

- approvals
- STOP CHECK reviews
- human-only context
- critical architecture choices

### Continuous Work

Shows:

- autonomy level
- whether safe work is enabled
- current safe-work policy
- next-best-work queue

### Activity Timeline

Shows:

- work selected
- packet generated
- report imported
- tests passed
- blocker detected
- approval requested
- phase advanced

## MVP Behavior

In the first version:

- Jarvis creates work packets
- user manually copies work packet into Cursor
- user pastes Cursor report back into RealmOS
- RealmOS updates project progress
- RealmOS suggests or prepares next safe packet automatically

## Later Behavior

Later:

- Cursor integration can be automated
- local workers can execute deterministic tasks
- tests can run automatically
- report import can read git/test artifacts
- Jarvis can run safe work inside sandboxed environments
