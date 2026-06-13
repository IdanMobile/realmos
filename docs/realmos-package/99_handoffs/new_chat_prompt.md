Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/browser_e2e_readiness_audit_v0_35.md

---

## Resume context (2026-06-12)

Continue from **Initiative 0.35 complete**.

**0.35 delivered:** Playwright browser E2E smoke for Command Center core flows; E2E mock API (no Ollama/Postgres in CI); safety assertions; CI integrated.

**Recommended next:** **0.36 — Cursor IDE Exit Readiness Audit / Remaining Base-System Gaps** — await operator approval.

**Do not auto-start:** GUING, side projects, voice, shell, Cursor CLI, autonomous execution.

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start && pnpm test:e2e
```
