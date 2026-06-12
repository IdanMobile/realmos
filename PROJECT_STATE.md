# RealmOS — Project State

Version: 0.22.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.22 — Local Ollama Node Integration (complete)
```

## Current Task

```text
Await operator-scoped next initiative
```

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`

## Current Status

Strict verification bar is **green**. Local Ollama path is wired: env-driven default model (`llama3.2:3b`), live invoke via `/api/generate`, stub fallback when unavailable, expanded health + dashboard status.

GitHub Actions CI remains green (no Ollama required in CI).

## Last Completed

```text
Initiative 0.22 — Local Ollama node integration (config, health, invoke, tests, operator docs)
```

## Verification (strict)

```bash
pnpm test        # PASS (Ollama mocked in CI/local tests)
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

## Known Limits (unchanged product scope)

- Firebase not cloud-wired.
- Lint scripts are stubs.
- Jarvis chat UI panel not implemented.
- Ollama not used for coding agents (online models / Cursor CLI).

## Docs

- Ollama audit: `docs/realmos-package/99_audits/ollama_local_node_audit_v0_22.md`
- CI smoke audit: `docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md`
- Verification: `VERIFICATION_COMMANDS.md`
