Read CURSOR_SSOT.md and follow it exactly.

Then read in order:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. SSOT_TODO_CHECKLIST.md
4. docs/realmos-package/99_audits/ollama_local_node_audit_v0_22.md
5. VERIFICATION_COMMANDS.md

---

## Resume context (2026-06-12)

Continue from Initiative **0.22 complete** — do not restart Phase 0 or SSOT bootstrap.

**Completed through Initiative 0.22:**

- SSOT phases 0–12, 6.5–6.8, 2.5–2.6 (approved)
- 0.18–0.21 (stabilization, Postgres, CI — green on GitHub)
- **0.22 Local Ollama Node Integration** — env-driven `llama3.2:3b`, live invoke + stub fallback, health + dashboard

**Current state:** `PROJECT_STATE.md` v0.22.0. Strict verification green. No active initiative — await my scope.

**Local machine notes:**

- Ollama Desktop + CLI; default model `llama3.2:3b` (machine-level pull)
- `.env` gitignored — `OLLAMA_BASE_URL`, `OLLAMA_DEFAULT_MODEL`
- Docker `realmos-postgres` optional for durable API / `pnpm test:postgres`

**Do not auto-start:** Firebase, GUING bootstrap, UI polish, unrelated features.

---

## First actions

1. Confirm workspace root is `realmos/`.
2. Run strict verification + optional Ollama/Postgres checks per handoff.
3. Report PASS/FAIL; ask which next initiative to scope.

```bash
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
