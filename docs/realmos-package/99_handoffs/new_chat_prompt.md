Read CURSOR_SSOT.md and follow it exactly.

Then read in order:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. SSOT_TODO_CHECKLIST.md
4. docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md
5. VERIFICATION_COMMANDS.md

---

## Resume context (2026-06-12)

I switched to this workspace from a local directory. **Continue from the same position** — do not restart Phase 0 or SSOT bootstrap.

**Completed through Initiative 0.21:**

- SSOT phases 0–12, 6.5–6.8, 2.5–2.6 (approved)
- 0.18 Stabilization — strict verification green
- 0.19 Durable operational persistence (Postgres + memory adapter)
- 0.20 Live Postgres smoke (`pnpm test:postgres`, proven locally)
- 0.21 Postgres CI smoke (`.github/workflows/ci.yml`)

**Current state:** `PROJECT_STATE.md` v0.21.0. Strict verification green. No active initiative — await my scope.

**Local machine notes (may differ in this clone):**

- Docker `realmos-postgres` on `:5432` for local smoke
- `.env` is not in git — use `.env.example`; operator had `REALMOS_USE_MEMORY_DB=false` for durable API
- GitHub Actions CI added but confirm green after push

**Do not auto-start:** Firebase, Ollama, GUING bootstrap, UI polish, unrelated features.

---

## First actions in this chat

1. Confirm workspace root is `realmos/` (not parent folder).
2. Run parity check:
   ```bash
   pnpm install
   pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
   ```
3. If Postgres is available locally: `pnpm test:postgres`
4. Report PASS/FAIL vs handoff; ask me which next initiative to scope if verification matches.

Shell PATH if needed:

```bash
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
```
