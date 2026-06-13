Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/jarvis_chat_readiness_audit_v0_31.md

---

## Resume context (2026-06-13)

Continue from **Initiative 0.31 complete**.

**0.31 delivered:** Jarvis operator chat UI + `/api/jarvis/chat?mode=operator` with Ollama routing metadata and safety blocks.

**Recommended next:** **0.32 — Necromancer Verification / Operator UI Hardening** — await operator approval.

**Do not auto-start:** GUING, side projects, voice, shell, Cursor CLI, autonomous execution.

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
