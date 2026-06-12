# RealmOS — Project State

Version: 0.21.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.21 — Postgres CI Smoke (complete)
```

## Current Task

```text
Directory switch handoff prepared — resume from latest_cursor_handoff.md in GitHub clone
```

## Handoff

Before switching workspace: commit/push 0.19–0.21 work to GitHub. Copy `.env` manually (not in git).

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`

## Current Status

Strict verification bar is **green**. GitHub Actions CI (`.github/workflows/ci.yml`) runs `pnpm test`, `typecheck`, `build`, and `pnpm test:postgres` against a Postgres 16 service container.

Local live Postgres smoke verified on operator machine (Initiative 0.20).

## Last Completed

```text
Initiative 0.21 — GitHub Actions CI workflow with Postgres service + test:postgres gate
```

## Verification (strict)

```bash
pnpm test        # PASS (Postgres smoke excluded locally)
pnpm typecheck   # PASS
pnpm build       # PASS
pnpm check:clean-start  # PASS
pnpm test:postgres     # optional local — PASS when realmos-postgres running
```

## CI

```yaml
# .github/workflows/ci.yml
# DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos
# pnpm test → pnpm typecheck → pnpm build → pnpm test:postgres
```

## Known Limits (unchanged product scope)

- Firebase/GitHub/Ollama are config placeholders — not cloud-wired.
- Lint scripts are stubs.
- Jarvis chat UI panel not implemented.

## Docs

- CI smoke audit: `docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md`
- Postgres smoke audit: `docs/realmos-package/99_audits/postgres_smoke_audit_v0_20.md`
- Verification: `VERIFICATION_COMMANDS.md`
