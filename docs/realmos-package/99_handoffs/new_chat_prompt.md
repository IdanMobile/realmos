Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/base_system_readiness_audit_v0_29.md
4. docs/realmos-package/06_operations/base_system_verification_plan_v0_29.md

Optional durable context: `GET /api/run-state/handoff/latest` and `GET /api/run-state/next-chat-prompt/latest`

---

## Resume context (2026-06-12)

Continue from **Initiative 0.29 complete**.

**0.29 delivered:** Base system verification matrix, UI/Jarvis/Necromancer plans, self-management audit, evidence gaps, post-0.29 roadmap. Overall readiness **PARTIAL**; Cursor exit **FAIL**.

**Roadmap gate (hard rule):** No side projects until RealmOS base system is complete. Side-project decisions only from working RealmOS/Jarvis.

**Recommended next (RealmOS-only):** **0.30 — UI / Navigation Verification Against Locked References** — **await operator approval. Do not auto-start.**

**Do not auto-start:** GUING, side projects, UI polish unrelated to locked references, voice, autonomous execution, shell execution, Cursor CLI auto-invoke.

**Testing & Quality Gate:** No PASS without tests or documented test gap (see CURSOR_SSOT.md Section 7.1).

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
