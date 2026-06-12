# RealmOS — Project State

Version: 0.25.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.25 — Work Packet Lifecycle (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.26 — Command Center Task Approval + Run Monitor
```

## Roadmap gate (locked)

**No side projects until RealmOS self-management milestone is complete.**

- **GUING bootstrap:** blocked
- **Recommended next:** **0.26 — Command Center Task Approval + Run Monitor**

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`

## Current Status

Strict verification bar is **green**. Work packet lifecycle: draft → approval → dispatch (dry-run queue) → manual result → verification record → close. **No automatic shell execution or Cursor CLI invocation.**

## Last Completed

```text
Initiative 0.25 — Work packet lifecycle (contract, service, API, persistence, tests, docs)
```

## Verification (strict)

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp
pnpm test:postgres     # optional
```

## Docs

- Lifecycle: `docs/realmos-package/06_operations/work_packet_lifecycle_v0_25.md`
- Audit: `docs/realmos-package/99_audits/work_packet_lifecycle_audit_v0_25.md`
- Executor bridge: `docs/realmos-package/06_operations/local_executor_bridge_v0_24.md`
- Verification: `VERIFICATION_COMMANDS.md`
