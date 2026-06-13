Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/work_packet_creation_ui_readiness_audit_v0_37.md

---

## Resume context (2026-06-13)

Continue from **Initiative 0.37 complete**.

**0.37 delivered:** Work packet create→approve→dispatch UI in Command Center; E2E mock flow; H1 hard blocker addressed.

**Recommended next:** **0.38 — Live Full-Stack Operator Smoke** — await operator approval.

**Do not auto-start:** GUING, side projects, voice, shell, Cursor CLI, autonomous execution.

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm test:e2e
```
