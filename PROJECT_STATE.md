# RealmOS — Project State

Version: 0.23.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.23 — Firebase Baseline Wiring (complete)
```

## Current Task

```text
Await operator-scoped next initiative — must stay RealmOS infrastructure until self-management milestone
```

## Roadmap gate (locked)

RealmOS cannot fully manage work itself yet (work packets → executor → monitor → verify → persist runs → handoff → human approval only when required).

**No side projects until that milestone is complete.**

- **GUING bootstrap:** explicitly blocked
- **Firebase baseline (0.23):** platform wiring only — does not unlock product work
- **Recommended next:** Initiative **0.24 — Local Executor / Cursor CLI Bridge**

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`

## Current Status

Strict verification bar is **green**. Firebase baseline wired: env-driven config, graceful `not_configured` when unset, health + dashboard status, emulator-first docs. Postgres and Ollama paths unchanged. No production Firebase deploy.

GitHub Actions CI remains green (no Firebase login or emulators required in CI).

## Last Completed

```text
Initiative 0.23 — Firebase baseline wiring (config, health, safe init hooks, tests, operator docs)
```

## Verification (strict)

```bash
pnpm test        # PASS (Firebase mocked / not_configured in CI)
pnpm typecheck   # PASS
pnpm build       # PASS
pnpm check:clean-start  # PASS
pnpm demo:mvp    # PASS with API on :4100
pnpm test:postgres     # optional — when realmos-postgres running
```

## Local Ollama (operator machine)

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2:3b
ollama pull llama3.2:3b   # machine-level, not in repo
```

Setup: `docs/realmos-package/06_operations/ollama_local_node_setup_v0_22.md`

## Firebase baseline (optional)

```bash
# Optional — health shows not_configured when unset
# FIREBASE_PROJECT_ID=your-project-id
```

Setup: `docs/realmos-package/06_operations/firebase_baseline_setup_v0_23.md`

## Known Limits (unchanged product scope)

- Firebase not deployed; no Firestore persistence from API yet.
- Lint scripts are stubs.
- Jarvis chat UI panel not implemented.
- Ollama not used for coding agents (online models / Cursor CLI).

## Docs

- Firebase audit: `docs/realmos-package/99_audits/firebase_baseline_audit_v0_23.md`
- Ollama audit: `docs/realmos-package/99_audits/ollama_local_node_audit_v0_22.md`
- CI smoke audit: `docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md`
- Verification: `VERIFICATION_COMMANDS.md`
