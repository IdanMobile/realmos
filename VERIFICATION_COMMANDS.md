# RealmOS — Verification Commands v0.34

Initiative 0.34 adds durable Necromancer persistence. See `docs/realmos-package/06_operations/durable_necromancer_persistence_v0_34.md` for manual smoke.

Initiative 0.33 adds verification evidence capture. See `docs/realmos-package/06_operations/verification_evidence_capture_v0_33.md` for manual smoke.

Initiative 0.32 adds Necromancer operator verification. See `docs/realmos-package/06_operations/necromancer_operator_flow_v0_32.md` for manual smoke.

Initiative 0.31 adds Jarvis operator chat verification. See `docs/realmos-package/06_operations/jarvis_interaction_path_v0_31.md` for manual smoke.

## Testing & Quality Gate (locked)

Before marking any initiative **PASS**:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp          # when MVP paths touched
pnpm test:postgres     # when persistence/Postgres paths touched
```

No PASS without relevant tests or an explicit documented test gap in the initiative audit.

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

## Work packet lifecycle (Initiative 0.25)

Setup: `docs/realmos-package/06_operations/work_packet_lifecycle_v0_25.md`

```bash
curl http://localhost:4100/api/lifecycle/status
curl http://localhost:4100/api/lifecycle/packets
curl http://localhost:4100/api/health | jq '.checks.lifecycle'
```

Lifecycle orchestrates draft → approval → dispatch (dry-run queue) → manual result → verification → close. No automatic command execution.

## Verification evidence (Initiative 0.33)

Setup: `docs/realmos-package/06_operations/verification_evidence_capture_v0_33.md`

```bash
pnpm --filter @realmos/api dev
pnpm --filter @realmos/web dev
# Command Center → Runs → Verification Evidence (live API + selected packet)
curl "http://localhost:4100/api/verification/evidence/summary?initiativeId=0.33&workPacketId=<packet-id>"
curl -X POST http://localhost:4100/api/verification/evidence \
  -H 'Content-Type: application/json' \
  -d '{"workPacketId":"<packet-id>","initiativeId":"0.33","gateId":"pnpm_test","commandName":"pnpm test","reportedStatus":"pass","outputText":"Tests passed","environment":"local","operatorId":"operator"}'
```

Operator pastes command output or links CI URL manually. No automatic shell execution.

## Durable Necromancer persistence (Initiative 0.34)

Setup: `docs/realmos-package/06_operations/durable_necromancer_persistence_v0_34.md`

```bash
pnpm --filter @realmos/api dev
pnpm --filter @realmos/web dev
# Command Center → Agents → Necromancer Operator
curl http://localhost:4100/api/necromancer/status
curl http://localhost:4100/api/necromancer/actions
curl -X POST http://localhost:4100/api/necromancer/candidates/<candidate-id>/protect \
  -H 'Content-Type: application/json' \
  -d '{"approved":true,"operatorId":"operator","evidenceId":"<optional-evidence-id>"}'
```

Protect registry and action history persist in Postgres when `DATABASE_URL` is set. Memory mode remains for local demo.

## Command Center task monitor (Initiative 0.26)

Setup: `docs/realmos-package/06_operations/command_center_task_monitor_v0_26.md`

```bash
pnpm --filter @realmos/api dev
pnpm --filter @realmos/web dev
# open http://localhost:3000 — Work Packet Task Approval + Run Monitor panel (live API)
curl http://localhost:4100/api/lifecycle/packets
curl http://localhost:4100/api/executor/status
```

Requires live API for operator actions. Mock dashboard mode shows safety banner but disables actions.

## Dogfood lifecycle (Initiative 0.28)

Setup: `docs/realmos-package/06_operations/dogfood_realmOS_task_v0_28.md`

```bash
REALMOS_API_BASE_URL=http://localhost:4101 node scripts/dogfood-v0-28.mjs dispatch
REALMOS_API_BASE_URL=http://localhost:4101 node scripts/dogfood-v0-28.mjs complete
curl http://localhost:4101/api/lifecycle/packets
curl http://localhost:4101/api/run-state/handoff/latest
```

## Self-handoff / run state (Initiative 0.27)

Setup: `docs/realmos-package/06_operations/self_handoff_run_state_v0_27.md`

```bash
curl http://localhost:4100/api/run-state/status
curl http://localhost:4100/api/run-state/handoff/latest
curl http://localhost:4100/api/run-state/next-chat-prompt/latest
curl http://localhost:4100/api/health | jq '.checks.runState'
```

Run state is stored in operational persistence — no arbitrary repo file writes.

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
pnpm test:e2e              # Playwright browser smoke (mock API; no Ollama/Postgres)
pnpm test:e2e:install      # Install Chromium for E2E (once per machine/CI)
pnpm --filter @realmos/realm-scope test
pnpm --filter @realmos/platform-infra test
```

## Audits

- Browser E2E readiness: `docs/realmos-package/99_audits/browser_e2e_readiness_audit_v0_35.md`
- Browser E2E smoke: `docs/realmos-package/06_operations/browser_e2e_smoke_v0_35.md`
- Durable Necromancer readiness: `docs/realmos-package/99_audits/durable_necromancer_readiness_audit_v0_34.md`
- Durable Necromancer persistence: `docs/realmos-package/06_operations/durable_necromancer_persistence_v0_34.md`
- Verification evidence readiness: `docs/realmos-package/99_audits/verification_evidence_readiness_audit_v0_33.md`
- Verification evidence capture: `docs/realmos-package/06_operations/verification_evidence_capture_v0_33.md`
- Necromancer readiness: `docs/realmos-package/99_audits/necromancer_readiness_audit_v0_32.md`
- Necromancer operator flow: `docs/realmos-package/06_operations/necromancer_operator_flow_v0_32.md`
- Jarvis chat readiness: `docs/realmos-package/99_audits/jarvis_chat_readiness_audit_v0_31.md`
- Jarvis interaction path: `docs/realmos-package/06_operations/jarvis_interaction_path_v0_31.md`
- UI/navigation readiness: `docs/realmos-package/99_audits/ui_navigation_readiness_audit_v0_30.md`
- UI/navigation verification: `docs/realmos-package/06_operations/ui_navigation_verification_v0_30.md`
- Base system readiness: `docs/realmos-package/99_audits/base_system_readiness_audit_v0_29.md`
- Base system verification plan: `docs/realmos-package/06_operations/base_system_verification_plan_v0_29.md`
- Local executor bridge: `docs/realmos-package/99_audits/local_executor_bridge_audit_v0_24.md`
- Work packet lifecycle: `docs/realmos-package/99_audits/work_packet_lifecycle_audit_v0_25.md`
- Command Center task monitor: `docs/realmos-package/99_audits/command_center_task_monitor_audit_v0_26.md`
- Self-handoff run state: `docs/realmos-package/99_audits/self_handoff_run_state_audit_v0_27.md`
- Dogfood RealmOS task: `docs/realmos-package/99_audits/dogfood_realmOS_task_audit_v0_28.md`
- Firebase baseline: `docs/realmos-package/99_audits/firebase_baseline_audit_v0_23.md`
- Ollama local node: `docs/realmos-package/99_audits/ollama_local_node_audit_v0_22.md`
- Postgres CI smoke: `docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md`
- Postgres smoke: `docs/realmos-package/99_audits/postgres_smoke_audit_v0_20.md`
- Persistence: `docs/realmos-package/99_audits/durable_persistence_audit_v0_19.md`
- Stabilization: `docs/realmos-package/99_audits/mvp_stabilization_audit_v0_18.md`
