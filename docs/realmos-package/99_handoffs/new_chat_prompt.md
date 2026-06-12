Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/work_packet_lifecycle_audit_v0_25.md

---

## Resume context (2026-06-12)

Continue from **Initiative 0.25 complete**.

**0.25 delivered:** Work packet lifecycle — draft → approval → dispatch (dry-run queue) → manual result → verification → close. API, persistence, health UI. No automatic shell execution.

**Roadmap gate:** No side projects. GUING blocked. Next: **0.26 Command Center Task Approval + Run Monitor**.

**Do not auto-start:** 0.26, GUING, side projects, UI polish, voice, autonomous execution.

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
