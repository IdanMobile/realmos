# Local Executor Bridge — Initiative 0.24

RealmOS moves toward **self-management** by creating work packets and dispatching them to a **local executor interface** — without unsafe autonomous shell execution.

## What the executor bridge is

A safe, file-based handoff layer between RealmOS orchestration and a future **Cursor CLI / local agent** consumer.

RealmOS:

1. Validates a dispatch packet (repository boundaries, paths, verification commands)
2. Persists dispatch state (Postgres or memory)
3. Writes queue artifacts under `.realmos/executor-queue/` (gitignored)
4. Tracks status transitions

It does **not** run arbitrary shell commands in this initiative.

## What it does now

| Capability | Status |
|------------|--------|
| Contract + validation | Yes |
| API CRUD + dispatch + result | Yes |
| File queue artifacts (`packet.json`, `prompt.md`, `verification.json`) | Yes |
| Human approval gate before dispatch | Yes (default) |
| Health + dashboard visibility | Yes |
| Operational persistence | Yes |

## What it intentionally does NOT do yet

- Run Cursor CLI automatically
- Execute verification commands
- Monitor live agent output
- Auto-merge code or deploy
- Start GUING or side projects

## Queue location

Default:

```text
.realmos/executor-queue/<dispatch-id>/
  packet.json
  prompt.md
  verification.json
```

Override with `REALMOS_EXECUTOR_QUEUE_DIR` in local `.env` (gitignored).

Disable bridge with `REALMOS_EXECUTOR_BRIDGE_ENABLED=false`.

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/executor/status` | Bridge summary |
| GET | `/api/executor/dispatches` | List dispatches |
| GET | `/api/executor/dispatches/:id` | Read one |
| POST | `/api/executor/dispatches` | Create queued dispatch |
| POST | `/api/executor/dispatches/from-packet` | Build from cursor work packet |
| POST | `/api/executor/dispatches/:id/approve` | Record operator approval |
| POST | `/api/executor/dispatches/:id/dispatch` | Write queue artifacts (dry-run) |
| POST | `/api/executor/dispatches/:id/result` | Record result manually / via adapter |

## Safety rules

- **GUING / side-project realms blocked** (e.g. `realm_guing`)
- **allowedPaths** and **forbiddenPaths** required
- **verificationCommands** required
- **requiresApproval** defaults to `true`
- **No secrets** in prompts (pattern check)
- **No shell execution** by default (`dry_run` mode)
- **No production deployment** from bridge

## Future Cursor CLI plug-in

A local consumer (Cursor CLI, watcher script, or agent) should:

1. Poll or watch `.realmos/executor-queue/`
2. Read `prompt.md` + boundary metadata
3. Execute work in IDE/CLI with operator oversight
4. POST result to `/api/executor/dispatches/:id/result`

RealmOS remains the orchestrator; the executor remains a separate process.

## Typical flow

```bash
# 1. Create dispatch
curl -X POST http://localhost:4100/api/executor/dispatches -H 'content-type: application/json' -d '...'

# 2. Approve (human gate)
curl -X POST http://localhost:4100/api/executor/dispatches/<id>/approve

# 3. Dispatch to file queue
curl -X POST http://localhost:4100/api/executor/dispatches/<id>/dispatch -d '{"approved":true}'

# 4. Later — record result
curl -X POST http://localhost:4100/api/executor/dispatches/<id>/result -d '{"status":"completed","resultSummary":"..."}'
```

## Next step

**Initiative 0.25 — Work Packet Lifecycle** — end-to-end lifecycle from work item → packet → dispatch → monitor → verify → handoff.

## Related docs

- `CURSOR_SSOT.md` — self-management milestone gate
- `docs/realmos-package/99_audits/local_executor_bridge_audit_v0_24.md`
