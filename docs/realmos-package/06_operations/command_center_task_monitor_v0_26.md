# Command Center Task Approval + Run Monitor — Initiative 0.26

Expose the 0.24 executor bridge and 0.25 work packet lifecycle in the RealmOS Command Center so operators can view, approve, dispatch, monitor, and record results from the UI.

## What the Command Center shows

| Area | Content |
|------|---------|
| Summary counts | Total, awaiting approval, awaiting result, verification pending |
| Run monitor | Executor bridge dry-run status, queue root, latest dispatch, artifact path |
| Packet list | All lifecycle packets with status badges |
| Packet detail | Objective, instructions, boundaries, paths, verification commands, audit events |
| Safety banner | Dry-run only, no shell, Cursor CLI not invoked, GUING blocked |

## Operator actions (live API only)

Actions call existing `/api/lifecycle/*` endpoints:

| Action | When available |
|--------|----------------|
| Mark ready | `draft` |
| Approve | `ready_for_approval` |
| Dispatch (dry-run) | `approved` — writes queue artifacts via 0.24 bridge |
| Record result | `dispatched` / `in_progress` / `awaiting_result` — manual operator entry |
| Attach verification | `verification_pending` — reported pass/fail/blocked |
| Close completed/failed/blocked/cancelled | Valid terminal transitions |

## What is still manual

- Running Cursor CLI or local agent (outside RealmOS)
- Running verification commands (operator reports results)
- Creating initial packets (POST `/api/lifecycle/packets` or future UI)

## Queue artifacts

Dispatch writes to `.realmos/executor-queue/<dispatch-id>/` (gitignored). The UI shows `dispatchId` and `queueArtifactPath` when linked.

## Safety

- **Dry-run only** — dispatch writes files, does not execute shell
- **No Cursor CLI invocation**
- **Human approval required** before dispatch
- **GUING/side projects blocked** at API validation layer

## Mock vs live API

When the dashboard falls back to mock seed data (`dataSource=mock`), the panel shows a warning and disables actions. Start API (`pnpm --filter @realmos/api dev`) and web with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4100` for live management.

## Known test gaps

- **No browser E2E** — coverage is unit/component tests + existing API integration tests
- Full click-through against live API in CI is not automated

## Recommended next initiative

**0.27 — Self-Handoff / Durable Run State Updates**

Still blocked: GUING, side projects, autonomous execution, shell execution.
