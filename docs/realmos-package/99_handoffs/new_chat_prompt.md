Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/self_handoff_run_state_audit_v0_27.md

Optional durable context: `GET /api/run-state/handoff/latest` and `GET /api/run-state/next-chat-prompt/latest`

---

## Resume context (2026-06-12)

Continue from **Initiative 0.27 complete**.

**0.27 delivered:** Durable run-state / self-handoff records in operational persistence. No arbitrary file writes. No automatic shell execution.

**Roadmap gate:** No side projects. GUING blocked. Next: **0.28 Dogfood RealmOS Managing One Real RealmOS Task**.

**Do not auto-start:** 0.28, GUING, side projects, UI polish, voice, autonomous execution.

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
