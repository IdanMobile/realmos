# Latest Cursor Handoff — Directory Switch / GitHub Repo Resume

Updated: 2026-06-12  
**Purpose:** Resume in a new workspace (GitHub clone) from the same position as the local `realmos/` directory.

---

## Current position (exact)

| Field | Value |
|-------|--------|
| **Project version** | `0.21.0` (`PROJECT_STATE.md`) |
| **SSOT phases** | 0–12, 6.5–6.8, 2.5–2.6 complete and approved |
| **Post-MVP initiatives complete** | 0.18 Stabilization, 0.19 Durable Persistence, 0.20 Live Postgres Smoke, 0.21 Postgres CI Smoke |
| **Active phase** | None — await operator-scoped next initiative |
| **Strict verification** | **GREEN** (last run 2026-06-12) |
| **Operating mode** | MVP functional; durable Postgres path proven locally + CI workflow added |

---

## What was last completed

### Initiative 0.19 — Durable operational persistence
- Migration `006_operational_state.sql` (21 JSONB operational tables)
- `OperationalPersistenceAdapter` (memory + Postgres backends)
- Work loop, fleet, realm, platform-infra stores persist via adapter
- Memory DB delegates work loop to shared store

### Initiative 0.20 — Live Postgres smoke (local)
- `pnpm test:postgres` (excluded from default `pnpm test`)
- `tests/operational-persistence.postgres.test.ts` (3 tests)
- **Proven locally** on operator machine with Docker `realmos-postgres`

### Initiative 0.21 — Postgres CI smoke
- `.github/workflows/ci.yml` — test, typecheck, build, test:postgres with Postgres 16 service
- Docs updated (`VERIFICATION_COMMANDS.md`, audits)

### Operator local setup (this machine, not in git)
- Docker container: `realmos-postgres` (Postgres 16, `:5432`)
- `.env`: `REALMOS_USE_MEMORY_DB=false`, `DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos`
- API was running durable Postgres mode on `:4100` (may need restart after clone)

---

## Tests passing / failing

| Command | Status (2026-06-12) |
|---------|---------------------|
| `pnpm test` | **PASS** (17/17 packages; Postgres smoke excluded) |
| `pnpm typecheck` | **PASS** |
| `pnpm build` | **PASS** |
| `pnpm check:clean-start` | **PASS** |
| `pnpm demo:mvp` | **PASS** (API on :4100, Ollama optional) |
| `pnpm test:postgres` | **PASS** (when `realmos-postgres` running) |
| GitHub Actions CI | **Added, not yet confirmed green on remote** — first push will trigger |

---

## Commands last run

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm test:postgres   # PASS (3/3)

# Operator machine (earlier same day)
docker run --name realmos-postgres ... postgres:16
pnpm test:postgres   # PASS
REALMOS_USE_MEMORY_DB=false pnpm --filter @realmos/api dev   # database: ok
```

---

## Important decisions (do not revert without operator approval)

1. **Default local demo** remains memory-capable (`REALMOS_USE_MEMORY_DB=true` in `.env.example`); operator machine uses `false` for durable dev.
2. **Postgres smoke** is opt-in locally, mandatory in CI.
3. **Fleet `executionEnabled`** stays hardcoded `false`.
4. **No Firebase / Ollama / GUING / UI polish** unless explicitly scoped.
5. **Platform decisions** unchanged (Firebase baseline selected, not wired).

---

## Key files (persistence + CI)

```
.github/workflows/ci.yml
apps/api/src/db/migrations/006_operational_state.sql
apps/api/src/db/postgres.ts                    # MIGRATION_FILES export, migrations/ path
apps/api/src/lib/persistence/                  # adapter + store factories
apps/api/src/lib/persistence/configure-operational-stores.ts
apps/api/tests/operational-persistence.test.ts
apps/api/tests/operational-persistence.postgres.test.ts
apps/api/tests/helpers/postgres-smoke-env.ts
apps/api/vitest.config.ts                      # excludes *.postgres.test.ts
apps/api/vitest.postgres.config.ts
package.json                                   # test:postgres script
apps/api/package.json                            # test:postgres script
```

---

## Before opening the GitHub clone — operator checklist

1. **Commit and push** all work from this directory to the GitHub remote (includes `.github/workflows/ci.yml`, persistence layer, docs).  
   `.env` is **not** committed — copy it manually or recreate from `.env.example`.

2. **Clone / open** the GitHub repo as workspace root:
   ```text
   realmos/    ← workspace root (not parent folder)
   ```

3. **Local setup after clone:**
   ```bash
   cp .env.example .env   # then edit as needed
   pnpm install
   docker start realmos-postgres   # or create container (see VERIFICATION_COMMANDS.md)
   ```

4. **Optional durable dev** (match operator machine):
   ```bash
   # .env
   DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos
   REALMOS_USE_MEMORY_DB=false
   pnpm --filter @realmos/api dev
   ```

5. **Verify clone matches this handoff:**
   ```bash
   pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
   pnpm test:postgres   # with Postgres running
   ```

6. **Confirm CI on GitHub** after push — Actions tab should run `.github/workflows/ci.yml`.

---

## Exact next task (for new chat)

```text
Await operator-scoped next initiative.
```

Recommended options (operator chooses):

- **Verify GitHub Actions CI** green after push (0.21 follow-up)
- **0.22 Firebase baseline wiring** (scoped, no full deploy)
- **0.22 Local Ollama node integration**

**Do not auto-start:** Firebase full wiring, Ollama unless scoped, GUING bootstrap, UI polish, GitHub Actions changes beyond verifying existing workflow.

---

## Known blockers

| Blocker | Notes |
|---------|--------|
| GitHub CI not yet observed | Workflow exists locally; needs push + Actions run |
| `.env` not in repo | Operator must copy secrets/flags locally |
| Docker Postgres | Local only; CI uses GHA service container |
| Ollama unreachable | Expected; demo uses stub fallback |

---

## Risks

1. **Clone without push** — GitHub repo may lack 0.19–0.21 work if not committed/pushed from this directory.
2. **Stale CURSOR_SSOT active phase** — read `PROJECT_STATE.md` + this handoff over SSOT section 1 if conflict.
3. **Global operational store singleton** — integration tests share module state.
4. **Lint is echo stubs** — strict bar is test + typecheck + build.

---

## Do not auto-start

Firebase wiring, Ollama/local node, GUING bootstrap, UI polish, unrelated features.

---

## Resume instructions (new Cursor chat in GitHub clone)

1. Open workspace at repo root `realmos/`.
2. Paste prompt from `docs/realmos-package/99_handoffs/new_chat_prompt.md`.
3. Read in order: `CURSOR_SSOT.md` → this file → `PROJECT_STATE.md` → `SSOT_TODO_CHECKLIST.md`.
4. Run verification commands to confirm clone parity.
5. Continue only from operator-scoped initiative.

---

## Audits (newest first)

- `docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md`
- `docs/realmos-package/99_audits/postgres_smoke_audit_v0_20.md`
- `docs/realmos-package/99_audits/durable_persistence_audit_v0_19.md`
- `docs/realmos-package/99_audits/mvp_stabilization_audit_v0_18.md`

## Verification reference

`VERIFICATION_COMMANDS.md`
