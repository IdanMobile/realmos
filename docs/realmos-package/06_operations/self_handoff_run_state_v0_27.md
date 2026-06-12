# Self-Handoff / Durable Run State — Initiative 0.27

RealmOS records **what happened** during work packet lifecycle activity in durable operational state — reducing dependency on Cursor chat history for continuity.

## What is stored

| Field area | Content |
|------------|---------|
| Identity | `runStateId`, `sourcePacketId`, `sourceDispatchId`, realm/repo |
| Progress | lifecycle status, result status, verification status |
| Work record | commands expected/reported, artifacts, changed files summary |
| Safety | safety summary (dry-run, no shell, no CLI) |
| Handoff | `handoffTextSummary`, `newChatPromptText` |
| Governance | known risks, blocked reasons, next recommended initiative |
| Flags | `handoffRequired`, `handoffUpdated`, audit events |

## What is NOT automated

- No arbitrary repository file writes (handoff content stored in DB/memory first)
- No shell command execution
- No Cursor CLI invocation
- No auto-sync unless run state exists for packet (lifecycle result/verification/close sync existing records)

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/run-state/status` | Summary counts |
| GET | `/api/run-state/records` | List run states |
| GET | `/api/run-state/records/:id` | Read one |
| POST | `/api/run-state/records/from-packet/:packetId` | Create from packet |
| POST | `/api/run-state/records/:id/sync-from-packet` | Sync from packet |
| POST | `/api/run-state/records/:id/sync-from-result` | Sync after result |
| POST | `/api/run-state/records/:id/sync-from-verification` | Sync after verification |
| POST | `/api/run-state/records/:id/handoff-required` | Mark handoff required |
| POST | `/api/run-state/records/:id/handoff-updated` | Mark handoff updated |
| GET | `/api/run-state/handoff/latest` | Latest handoff summary object |
| GET | `/api/run-state/next-chat-prompt/latest` | Latest next-chat prompt object |

## Command Center

`RunStateHandoffPanel` shows latest summary, risks, blocked reasons, next initiative, and supports creating run state from selected lifecycle packet.

## Persistence

- **Memory mode:** demo/tests
- **Postgres mode:** `operational_run_state_handoff` (migration `009_run_state_handoff.sql`)

## Safety

- GUING/side-project next initiatives blocked
- Secret-pattern rejection in handoff/prompt text
- Default next initiative after success: **0.28 — Dogfood RealmOS Managing One Real RealmOS Task**

## Recommended next initiative

**0.28 — Dogfood RealmOS Managing One Real RealmOS Task** (RealmOS-only).

**Hard rule:** No side projects until RealmOS base system is complete. Blocked: GUING, prior side projects, product bootstrap, external project work, any non-RealmOS work, autonomous execution.
