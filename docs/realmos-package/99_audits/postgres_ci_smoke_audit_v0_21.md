# RealmOS Postgres CI Smoke Audit — v0.21.0

**Date:** 2026-06-12  
**Initiative:** 0.21 — Postgres CI Smoke  
**Prior:** [postgres_smoke_audit_v0_20.md](./postgres_smoke_audit_v0_20.md)

---

## Verdict

| Check | v0.20 | v0.21 |
|-------|-------|-------|
| `pnpm test` | PASS | **PASS** |
| `pnpm typecheck` | PASS | **PASS** |
| `pnpm build` | PASS | **PASS** |
| `pnpm check:clean-start` | PASS | **PASS** |
| `pnpm test:postgres` (local) | PASS (operator machine) | **PASS** (when container running) |
| GitHub Actions CI | N/A | **Added** |
| **Initiative overall** | — | **PASS** |

---

## What was implemented

### Workflow file

`.github/workflows/ci.yml`

- **Triggers:** `push`, `pull_request`, `workflow_dispatch`
- **Runner:** `ubuntu-latest`
- **Postgres service:** `postgres:16` with user/db/password `realmos`
- **Health check:** `pg_isready -U realmos -d realmos`

### CI job steps

1. Checkout
2. Setup pnpm 9 + Node.js 22 (pnpm cache)
3. `pnpm install --frozen-lockfile`
4. `pnpm test`
5. `pnpm typecheck`
6. `pnpm build`
7. `pnpm test:postgres`

### Environment

```yaml
env:
  DATABASE_URL: postgres://realmos:realmos@localhost:5432/realmos
```

Matches local Docker smoke credentials for consistency.

### Local developer flow unchanged

- Default `pnpm test` still excludes `tests/**/*.postgres.test.ts` via `apps/api/vitest.config.ts`
- `pnpm test:postgres` remains optional locally
- No secrets or external services required

---

## What CI verifies

| Gate | Purpose |
|------|---------|
| `pnpm test` | Full workspace tests (memory adapter only for operational persistence) |
| `pnpm typecheck` | Type safety across 17 packages |
| `pnpm build` | Compile all packages |
| `pnpm test:postgres` | Migration 006 applies; operational tables exist; work loop, fleet, realm, platform-infra records persist through Postgres adapter; safety gates intact |

---

## Local vs CI Postgres smoke

| Aspect | Local | CI |
|--------|-------|-----|
| Invocation | `pnpm test:postgres` (manual) | Automatic last CI step |
| Postgres source | Docker `realmos-postgres` | GitHub Actions service container |
| `DATABASE_URL` | `.env` or export | Workflow `env` |
| Missing Postgres | Skip or fail | Job fails |
| Part of `pnpm test` | No | No |

---

## Commands run (local verification)

```bash
pnpm test              # PASS
pnpm typecheck         # PASS
pnpm build             # PASS
pnpm check:clean-start # PASS
pnpm test:postgres     # PASS (realmos-postgres container running) or SKIP/FAIL if not
```

Note: CI workflow itself runs on GitHub after push — not executed locally in this session.

---

## Remaining risks

1. **CI not yet observed on GitHub** — workflow added locally; first green run confirms runner + service wiring.
2. **Postgres service port mapping** — uses `localhost:5432`; standard GHA pattern but environment-specific edge cases possible.
3. **Migration list still manual** — `MIGRATION_FILES` append-only in `postgres.ts`.
4. **No CI matrix** — single Ubuntu job; no multi-Node or multi-OS coverage.

---

## Recommended next initiative

Operator choice:

- **Firebase baseline wiring** (scoped, no full cloud deploy)
- **Local Ollama node integration**
- **GUING bootstrap** (only if explicitly scoped)

Do not start UI polish without explicit scope.
