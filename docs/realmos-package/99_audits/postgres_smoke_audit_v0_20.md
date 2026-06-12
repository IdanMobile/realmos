# RealmOS Postgres Smoke Audit — v0.20.0

**Date:** 2026-06-12  
**Initiative:** 0.20 — Live Postgres Smoke for Operational Persistence  
**Prior:** [durable_persistence_audit_v0_19.md](./durable_persistence_audit_v0_19.md)

---

## Verdict

| Check | v0.19 | v0.20 |
|-------|-------|-------|
| `pnpm test` | PASS | **PASS** (Postgres smoke excluded) |
| `pnpm typecheck` | PASS | **PASS** |
| `pnpm build` | PASS | **PASS** |
| `pnpm check:clean-start` | PASS | **PASS** |
| `pnpm demo:mvp` | PASS | **PASS** |
| `pnpm test:postgres` | N/A | **PASS** (local operator verification) |
| **Initiative overall** | — | **PASS** |

---

## What was implemented

### Dedicated Postgres smoke command

```bash
pnpm test:postgres
# equivalent
pnpm --filter @realmos/api test:postgres
```

- Uses `vitest.postgres.config.ts` — only runs `tests/**/*.postgres.test.ts`
- Default `pnpm test` excludes `*.postgres.test.ts` via `vitest.config.ts`

### Smoke test coverage

File: `apps/api/tests/operational-persistence.postgres.test.ts`

| Test | Verifies |
|------|----------|
| Migration registration | `MIGRATION_FILES` includes `006_operational_state.sql` |
| Connect + migrate | Runs all migrations; `to_regclass` checks operational tables |
| Adapter persistence | Work item + cursor packet, parallel plan + conflict, realm + binding, isolation violation; re-instantiated stores read back; `executionEnabled: false`; approval gates intact |

Smoke records use `pg_smoke_v020_*` prefix and are deleted in `afterAll`.

### Env loading

`tests/helpers/postgres-smoke-env.ts` reads `DATABASE_URL` from process env or repo root `.env`.

### Migration path fix

`apps/api/src/db/postgres.ts` — SQL files loaded from `src/db/migrations/` (was incorrectly pointing at `src/db/` when running from TypeScript source).

### Exported migration list

`MIGRATION_FILES` constant exported from `postgres.ts` for smoke assertion and future maintenance.

---

## Live Postgres smoke run (operator machine — 2026-06-12)

| Condition | Result |
|-----------|--------|
| Docker | **Available** (29.5.3, daemon running) |
| Container | **`realmos-postgres`** started (Postgres 16, port 5432) |
| `DATABASE_URL` in `.env` | `postgres://realmos:realmos@localhost:5432/realmos` (already set) |
| `pnpm test:postgres` | **PASS** — 3/3 tests, ~129ms |
| API Postgres mode (`REALMOS_USE_MEMORY_DB=false`, port 4101) | **PASS** — health `database: ok`, work items served from Postgres |

**Durable operational persistence is proven locally** against a real database.

Prior session (before Postgres container): `pnpm test:postgres` **FAIL** — `ECONNREFUSED` (honest, not faked).

### Exact commands run (local verification)

```bash
docker --version
docker info

docker run --name realmos-postgres -e POSTGRES_USER=realmos -e POSTGRES_PASSWORD=realmos \
  -e POSTGRES_DB=realmos -p 5432:5432 -d postgres:16

docker exec realmos-postgres pg_isready -U realmos -d realmos

cd /Users/idan/Documents/realmos_cursor_ready_v1_14/realmos
pnpm test:postgres
# ✓ tests/operational-persistence.postgres.test.ts (3 tests) 129ms

# API spot-check (alternate port — :4100 already in use)
cd apps/api
REALMOS_USE_MEMORY_DB=false API_PORT=4101 pnpm exec tsx --env-file=../../.env src/server.ts
curl http://localhost:4101/api/health        # database: ok
curl http://localhost:4101/api/work-items    # seeded work items from Postgres
```

---

## How to run manually

### 1. Start Postgres

```bash
docker run --name realmos-postgres -e POSTGRES_USER=realmos -e POSTGRES_PASSWORD=realmos \
  -e POSTGRES_DB=realmos -p 5432:5432 -d postgres:16
```

### 2. Configure env

In repo root `.env`:

```bash
DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos
```

### 3. Run smoke

```bash
pnpm test:postgres
```

### Expected PASS output

```text
✓ operational persistence (live Postgres smoke) > registers migration 006 in the migration runner
✓ operational persistence (live Postgres smoke) > connects, applies migrations, and exposes operational tables from migration 006
✓ operational persistence (live Postgres smoke) > persists work-loop, fleet, realm, and platform-infra records through the Postgres adapter
Test Files  1 passed (1)
Tests  3 passed (3)
```

### Switch API to durable Postgres mode

```bash
REALMOS_USE_MEMORY_DB=false
```

Restart `pnpm --filter @realmos/api dev`.

---

## Commands run (exact)

```bash
pnpm test              # PASS
pnpm typecheck         # PASS
pnpm build             # PASS
pnpm check:clean-start # PASS
pnpm demo:mvp          # PASS
pnpm test:postgres     # PASS (local — realmos-postgres container running)
```

---

## Remaining persistence risks

1. **Postgres smoke not in CI** — optional command only; no automated live DB gate yet.
2. **Default demo still ephemeral** — `REALMOS_USE_MEMORY_DB=true` unless operator switches.
3. **Migration list still manual** — exported as `MIGRATION_FILES` but append-only; no auto-discovery.
4. **Shared module-level store singleton** — integration tests may share operational store state.

---

## Recommended next initiative

**0.21 — Postgres CI smoke** (GitHub Actions service container + `pnpm test:postgres` in CI), or operator choice: **Firebase baseline wiring** vs **local Ollama node integration**.

Do not start GUING bootstrap or UI polish without explicit scope.
