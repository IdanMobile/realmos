# RealmOS — Verification Commands v0.24

Initiative 0.24 adds local executor bridge (dry-run file queue). Initiative 0.23 adds Firebase baseline wiring.

## Full verification (recommended)

```bash
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
corepack enable
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm lint
```

`pnpm lint` runs per-package echo stubs today — not ESLint. Treat **test + typecheck + build** as the strict bar.

## Quick clean start

```bash
pnpm check:clean-start
```

Runs `pnpm typecheck` + `pnpm test:contracts` (contracts package tests only).

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

On every push, pull request, and manual dispatch, CI runs:

1. `pnpm install --frozen-lockfile`
2. `pnpm test` (Postgres smoke **excluded**)
3. `pnpm typecheck`
4. `pnpm build`
5. `pnpm test:postgres` (against a Postgres 16 **service container**)

CI sets:

```bash
DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos
```

No Firebase, Ollama, secrets, or external accounts required.

### Local vs CI Postgres smoke

| | Local `pnpm test:postgres` | CI `pnpm test:postgres` |
|--|--|--|
| **When** | Operator runs explicitly | Every CI job |
| **Postgres** | Docker `realmos-postgres` or your own | GitHub Actions service container |
| **`DATABASE_URL`** | From env or repo `.env` | Set in workflow `env` |
| **Default `pnpm test`** | Excludes smoke | Excludes smoke (unchanged) |
| **If Postgres unavailable** | Skip (no URL) or fail (URL set, DB down) | Fail the job |

## Live Postgres smoke (optional, local)

**Not part of default `pnpm test`.** Run explicitly when Postgres is available.

### Required env

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string, e.g. `postgres://realmos:realmos@localhost:5432/realmos` |

The smoke loader reads `DATABASE_URL` from the environment or repo root `.env`.

### Start Postgres locally

Example with Docker:

```bash
docker run --name realmos-postgres -e POSTGRES_USER=realmos -e POSTGRES_PASSWORD=realmos \
  -e POSTGRES_DB=realmos -p 5432:5432 -d postgres:16
```

Ensure `.env` (or export) has:

```bash
DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos
```

### Run smoke

```bash
pnpm test:postgres
# or
pnpm --filter @realmos/api test:postgres
```

### Expected outcomes

**PASS** (Postgres reachable):

```text
✓ operational persistence (live Postgres smoke) > registers migration 006 ...
✓ operational persistence (live Postgres smoke) > connects, applies migrations ...
✓ operational persistence (live Postgres smoke) > persists work-loop, fleet, realm ...
Test Files  1 passed (1)
Tests  3 passed (3)
```

**SKIP** (`DATABASE_URL` missing):

```text
↓ operational persistence (live Postgres smoke) > skipped — DATABASE_URL is not set ...
Tests  1 skipped (1)
```

**FAIL** (`DATABASE_URL` set but Postgres down):

```text
Postgres smoke could not connect using DATABASE_URL: ...
```

### Switch from memory demo to Postgres mode

In repo root `.env`:

```bash
DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos
REALMOS_USE_MEMORY_DB=false   # or remove / comment out the line
```

Restart API:

```bash
pnpm --filter @realmos/api dev
```

Operational state (work loop, fleet, realm, platform infra) persists across API restarts.

Default demo remains memory mode when `REALMOS_USE_MEMORY_DB=true`.

No Firebase login, Ollama, secrets, or external accounts required for CI or default local verification.

## Firebase baseline (optional)

Setup guide: `docs/realmos-package/06_operations/firebase_baseline_setup_v0_23.md`

Without `FIREBASE_PROJECT_ID`, health reports `checks.firebase.status: not_configured`. MVP demo and CI pass unchanged.

Optional emulator env (local `.env`, gitignored):

```bash
FIREBASE_PROJECT_ID=demo-realmos
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

```bash
curl http://localhost:4100/api/health | jq '.checks.firebase'
```

Requires Firebase CLI + `firebase emulators:start` only for live emulator experiments — not for CI.

## Local executor bridge (dry-run)

Setup: `docs/realmos-package/06_operations/local_executor_bridge_v0_24.md`

```bash
curl http://localhost:4100/api/executor/status
curl http://localhost:4100/api/health | jq '.checks.executor'
```

Queue artifacts (gitignored): `.realmos/executor-queue/<dispatch-id>/`

No shell execution by default. Approval required before dispatch.

## Local Ollama (optional, machine-level)

Ollama is **not** installed by the repo. Models live on the operator machine.

Setup guide: `docs/realmos-package/06_operations/ollama_local_node_setup_v0_22.md`

```bash
ollama --version
curl http://localhost:11434
ollama list
ollama pull llama3.2:3b   # if missing
```

`.env` (gitignored):

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2:3b
```

Health check:

```bash
curl http://localhost:4100/api/health | jq '.checks.ollama'
```

Expected when live: `status: ok`, `fallbackActive: false`, `defaultModelAvailable: true`.

CI does **not** require Ollama — tests mock probe/invoke paths.

## MVP demo (Gate H)

Terminal 1 — API (uses root `.env` via `tsx --env-file`):

```bash
pnpm --filter @realmos/api dev
```

Terminal 2 — demo script:

```bash
pnpm demo:mvp
```

Requires API on `http://localhost:4100`. Ollama optional — live when server + `llama3.2:3b` installed; otherwise stub fallback.

## Web dev

```bash
pnpm --filter @realmos/web dev
```

Open http://localhost:3000 — live API when reachable, else mock dashboard fallback.

## API smoke

```bash
curl http://localhost:4100/api/health
curl http://localhost:4100/api/dashboard
```

## Environment

Copy `.env.example` → `.env`. Default `REALMOS_USE_MEMORY_DB=true` avoids Postgres for local dev.

## Package spot checks

```bash
pnpm --filter @realmos/contracts test
pnpm --filter @realmos/api test
pnpm --filter @realmos/api test:postgres   # optional, requires Postgres
pnpm --filter @realmos/web test
pnpm --filter @realmos/realm-scope test
pnpm --filter @realmos/platform-infra test
```

## Audits

- Local executor bridge: `docs/realmos-package/99_audits/local_executor_bridge_audit_v0_24.md`
- Firebase baseline: `docs/realmos-package/99_audits/firebase_baseline_audit_v0_23.md`
- Ollama local node: `docs/realmos-package/99_audits/ollama_local_node_audit_v0_22.md`
- Postgres CI smoke: `docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md`
- Postgres smoke: `docs/realmos-package/99_audits/postgres_smoke_audit_v0_20.md`
- Persistence: `docs/realmos-package/99_audits/durable_persistence_audit_v0_19.md`
- Stabilization: `docs/realmos-package/99_audits/mvp_stabilization_audit_v0_18.md`
