# RealmOS Durable Persistence Audit — v0.19.0

**Date:** 2026-06-12  
**Initiative:** 0.19 — Durable Persistence for RealmOS Operational State  
**Prior:** [mvp_stabilization_audit_v0_18.md](./mvp_stabilization_audit_v0_18.md)

---

## Verdict

| Check | v0.18 | v0.19 |
|-------|-------|-------|
| `pnpm test` | PASS | **PASS** |
| `pnpm typecheck` | PASS | **PASS** |
| `pnpm build` | PASS | **PASS** |
| `pnpm check:clean-start` | PASS | **PASS** |
| `pnpm demo:mvp` | PASS | **PASS** |
| **Initiative overall** | — | **PASS** |

---

## What was implemented

### Operational persistence layer

- **Migration:** `apps/api/src/db/migrations/006_operational_state.sql` — 21 JSONB tables for work loop, fleet, realm, and platform-infra records.
- **Adapter pattern:** `OperationalPersistenceAdapter` with memory and Postgres backends.
- **Store factories:** Work loop, fleet, realm, and platform-infra stores read/write through the adapter.
- **Configuration:** `configureOperationalPersistence()` + `seedOperationalStoresIfEmpty()` wired from `createDatabaseFromEnv()` and `buildApp()`.
- **Memory DB unification:** `createMemoryDatabase()` delegates work-loop CRUD to the shared operational store (no duplicate in-memory copy).

### Postgres mode (`DATABASE_URL` set, `REALMOS_USE_MEMORY_DB !== true`)

Operational state survives API restarts via Postgres JSONB tables.

### Memory mode (`REALMOS_USE_MEMORY_DB=true` or no `DATABASE_URL`)

Operational stores use in-memory adapter — ephemeral per process (local demo fallback preserved).

### Safety preserved

- `buildFleetConsole()` still returns `executionEnabled: false`.
- Continuous work policy approval gates unchanged after reload.
- No Firebase/Ollama/GUING wiring; no real tool execution enabled.

---

## What is durable (Postgres mode)

| Domain | Records |
|--------|---------|
| Work loop | continuous work policy, work items, cursor work packets, completion reports, next-best decisions |
| Fleet | fleet, capacity policy, squads, fleet runs, parallel work plans, work conflicts |
| Realm | realms, environments, access policies, repository bindings, repository conflicts |
| Platform infra | platform decision, platform resource refs, project infrastructure plans, prototype approvals, isolation violations |

---

## What remains in-memory / static

| Item | Notes |
|------|-------|
| All operational state | When `REALMOS_USE_MEMORY_DB=true` (default demo) |
| Realm shell routes | Derived from `@realmos/realm-scope` defaults (not persisted) |
| Platform config placeholders | Firebase/GitHub/Ollama/local-node config objects (static from package defaults) |
| Core RealmOS entities | Businesses, agents, tasks, etc. — already Postgres-backed when not in memory DB mode; unchanged scope |

---

## Tests added

`apps/api/tests/operational-persistence.test.ts`:

- Work-loop state survives store re-instantiation on same adapter
- Fleet planning state survives re-instantiation; `executionEnabled` stays false
- Realm and platform-infra records survive re-instantiation
- Fresh memory adapter is ephemeral (fallback behavior)
- Approval gates persist after reload

---

## Commands run (exact)

```bash
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
cd /Users/idan/Documents/realmos_cursor_ready_v1_14/realmos

pnpm test              # Tasks: 17 successful, 17 total
pnpm typecheck         # Tasks: 17 successful, 17 total
pnpm build             # Tasks: 17 successful, 17 total
pnpm check:clean-start # PASS
pnpm demo:mvp          # MVP Demo PASSED
```

---

## Remaining risks

1. **Demo default is still ephemeral** — `REALMOS_USE_MEMORY_DB=true` in `.env.example`; operators must set `DATABASE_URL` and unset memory flag for restart durability.
2. **No integration test against live Postgres** — persistence tests use in-memory adapter (same interface as Postgres backend).
3. **Global operational store singleton** — tests share module-level store; `resetOperationalPersistenceForTests()` exists but is not wired into every integration test.
4. **Migration runner** — hardcoded file list in `postgres.ts` (existing pattern); new migrations must be appended manually.

---

## Recommended next initiative

> **Governance superseded (2026-06-12):** Side projects are blocked until the RealmOS base system is complete. Historical recommendation below — **not active**.

**Historical (0.19 context):** Firebase baseline wiring, local Ollama node integration, or Postgres CI smoke.

**Current recommended next (RealmOS-only):** **0.28 — Dogfood RealmOS Managing One Real RealmOS Task**. See `CURSOR_SSOT.md` Section 5.

Do not start GUING, side projects, or product bootstrap.
