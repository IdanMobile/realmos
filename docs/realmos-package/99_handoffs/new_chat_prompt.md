Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/cursor_exit_readiness_audit_v0_36.md

---

## Resume context (2026-06-13)

Continue from **Initiative 0.36 complete**.

**0.36 delivered:** Cursor IDE exit readiness audit — exit status **FAIL**; hard blockers documented; roadmap 0.37+.

**Recommended next:** **0.37 — Work Packet Creation / Approval UI Completion** — await operator approval.

**Do not auto-start:** GUING, side projects, voice, shell, Cursor CLI, autonomous execution.

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start && pnpm test:e2e
```
