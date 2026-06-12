# Dogfood RealmOS Task — Initiative 0.28

RealmOS managed one real RealmOS-only task end-to-end through its own lifecycle, dry-run executor, run monitor, and durable run-state systems.

## Dogfood task

**Add permanent Testing & Quality Gate governance rule** — docs/governance only, no production code changes required.

## Flow executed

1. Create work packet (`POST /api/lifecycle/packets`)
2. `ready_for_approval` → `approved` → dry-run `dispatch` (queue artifacts only)
3. Manual governance doc updates (allowed paths only)
4. Record result → attach verification → close packet
5. Create/sync run-state → handoff updated

## Script

```bash
pnpm --filter @realmos/api dev   # current code on :4100 or :4101
REALMOS_API_BASE_URL=http://localhost:4101 node scripts/dogfood-v0-28.mjs dispatch
# apply governance docs manually
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start && pnpm demo:mvp && pnpm test:postgres
REALMOS_API_BASE_URL=http://localhost:4101 DOGFOOD_VERIFICATION_SUMMARY="..." node scripts/dogfood-v0-28.mjs complete
```

State file (gitignored): `.realmos/dogfood-v0-28-state.json`

## Example dogfood IDs (2026-06-12 run)

| Field | Value |
|-------|--------|
| Packet | `wpl_mqbhyes0_5xy658` |
| Dispatch | `exec_mqbhyes5_yg0a7f` |
| Run state | `run_state_mqbhyes8_gdpibs` |
| Queue path | `.realmos/executor-queue/exec_mqbhyes5_yg0a7f` |

## Safety

- No shell execution
- No Cursor CLI
- No side projects
- Queue artifacts in `.realmos/` only

## Recommended next

**0.29 — RealmOS Base System Verification Plan**
