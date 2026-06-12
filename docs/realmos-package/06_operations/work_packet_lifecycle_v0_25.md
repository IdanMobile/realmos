# Work Packet Lifecycle — Initiative 0.25

RealmOS **self-management** milestone: end-to-end orchestration from work item intent through dispatch, manual result recording, verification, and handoff state — built on the 0.24 dry-run executor bridge.

## What the lifecycle is

A persisted state machine that tracks a **work packet** from draft through completion. It coordinates with the executor bridge to write queue artifacts but does **not** run shell commands or invoke Cursor CLI.

## State machine

```text
draft
  → ready_for_approval   (validate readiness)
  → approved             (human approval)
  → awaiting_result      (dispatch via 0.24 bridge — writes queue files)
  → verification_pending (operator records executor result)
  → verified             (operator attaches verification record)
  → completed            (close)

Side paths:
  in_progress            (result status: running)
  failed / blocked       (result or verification failure)
  cancelled              (operator close from most non-terminal states)
```

## What it does now

| Capability | Status |
|------------|--------|
| Lifecycle contract + validation | Yes |
| State transitions + audit events | Yes |
| API CRUD + lifecycle actions | Yes |
| Dispatch via 0.24 executor bridge | Yes |
| Manual result + verification records | Yes |
| Handoff required/updated tracking | Yes |
| Health + dashboard visibility | Yes |
| Operational persistence (memory + Postgres) | Yes |

## What it intentionally does NOT do yet

- Run verification commands automatically
- Invoke Cursor CLI
- Auto-approve dispatches
- Edit arbitrary docs on handoff
- Start GUING or side projects
- Production deployment

## Dry-run / manual-result model

1. Operator or agent creates a lifecycle packet (draft).
2. Operator marks ready (validates boundaries, artifacts, verification commands).
3. Operator approves.
4. Dispatch writes `.realmos/executor-queue/` artifacts via executor bridge.
5. **Human/operator** runs Cursor CLI or local agent manually (outside RealmOS).
6. Operator records result via API (`/result`).
7. Operator attaches verification record (`/verification`) — reported pass/fail, not auto-run.
8. Operator closes as completed when verified.

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/lifecycle/status` | Summary counts by status |
| GET | `/api/lifecycle/packets` | List lifecycle packets |
| GET | `/api/lifecycle/packets/:id` | Read one |
| POST | `/api/lifecycle/packets` | Create draft |
| POST | `/api/lifecycle/packets/:id/ready` | Mark ready for approval |
| POST | `/api/lifecycle/packets/:id/approve` | Approve (human) |
| POST | `/api/lifecycle/packets/:id/dispatch` | Dispatch via executor bridge |
| POST | `/api/lifecycle/packets/:id/result` | Record executor result |
| POST | `/api/lifecycle/packets/:id/verification` | Attach verification record |
| POST | `/api/lifecycle/packets/:id/close` | Close packet |

## Safety constraints

- GUING / side-project realms blocked
- Repository boundary required (`realmId`, `repositoryId`)
- `allowedPaths` / `forbiddenPaths` required
- `verificationCommands` required (production deploy commands rejected)
- Approval required before dispatch
- Secret-pattern rejection in instructions and results
- `shellExecution: false` in queue artifacts (inherited from 0.24)
- No automatic Cursor CLI invocation

## Persistence

- **Memory mode:** demo and tests
- **Postgres mode:** `operational_work_packet_lifecycle` (migration `008_work_packet_lifecycle.sql`)

## Health / dashboard

`GET /api/health` includes `checks.lifecycle`:

- total count, approval needed, dispatched, awaiting result, verification pending
- latest packet id + status

Command Center System Status panel shows lifecycle summary when API is live.

## How this prepares for local executor later

The lifecycle records **what** was dispatched, **when**, and **what result/verification** the operator reported. Initiative 0.26 can add Command Center task approval UI and run monitoring without changing the core state machine.

## Recommended next initiative

**0.26 — Command Center Task Approval + Run Monitor**

Still blocked: GUING, side projects, autonomous execution, shell execution, production deployment.
