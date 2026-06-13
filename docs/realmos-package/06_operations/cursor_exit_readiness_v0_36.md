# Cursor IDE Exit Readiness — Initiative 0.36

Version: 0.36.0  
Prepared: 2026-06-13

## Purpose

Define what **Cursor IDE exit readiness** means for RealmOS and document the exact remaining base-system gaps before the operator can use RealmOS/Jarvis as the **primary control surface** instead of Cursor IDE.

This initiative is **audit and planning only** — no new large features.

---

## 1. Definition — “Cursor IDE exit readiness”

The operator can **mostly leave Cursor IDE** for day-to-day RealmOS control when all of the following are true:

| # | Criterion | Meaning |
|---|-----------|---------|
| 1 | **Orient** | View system status, health, governance, and Live/Mock data mode honestly |
| 2 | **Ask** | Ask Jarvis text questions safely (no auto-execution) |
| 3 | **Originate work** | Create work packets from the Command Center UI (not only curl/scripts) |
| 4 | **Approve & track** | Approve, dispatch (dry-run), record results, and close packets from UI |
| 5 | **Verify** | Attach verification evidence (output paste + CI metadata) and see gate status |
| 6 | **Hand off** | See run-state / next initiative / handoff summary after work |
| 7 | **Recover stale work** | Use Necromancer with approval gating and durable history |
| 8 | **Navigate** | Reach core operator sections without confusion; placeholders honest |
| 9 | **Recover after restart** | Postgres-backed state survives API restart; startup path documented |
| 10 | **Trust CI** | CI/evidence visibility sufficient to trust green bar without opening Cursor |
| 11 | **Stay in lane** | GUING/side projects clearly blocked; no accidental scope leakage |
| 12 | **Accept editing boundary** | RealmOS does **not** replace Cursor for code editing — that remains intentional |

**Exit does NOT require:** voice, shell auto-execution, Cursor CLI auto-invoke, autonomous cleanup, delete endpoints, or in-browser code editing.

---

## 2. Current verdict (post-0.35)

| Field | Value |
|-------|-------|
| **Cursor IDE exit readiness** | **FAIL** |
| **Overall base system** | **PARTIAL** |
| **Primary blocker class** | Operator cannot **originate** work from UI; live full-stack operator proof still manual |

---

## 3. Readiness matrix (summary)

See full matrix: `docs/realmos-package/99_audits/cursor_exit_readiness_audit_v0_36.md`

| Capability | Status | Notes |
|------------|--------|-------|
| System status / health | **PASS** | System Status + governance banner |
| Jarvis chat | **PASS** | Live API + Ollama; mock degrades honestly |
| Work packet create (UI) | **FAIL** | API client exists; **no CC form** |
| Work packet approve/track (UI) | **PARTIAL** | Approve/dispatch/result/verify/close in monitor panel |
| Executor / dry-run dispatch | **PARTIAL** | Real queue; consumer not implemented by design |
| Run monitor | **PARTIAL** | Visible in Runs; queue artifact path shown |
| Run-state / handoff | **PARTIAL** | UI + API; repo markdown handoff still manual |
| Verification evidence | **PASS** | Durable; paste + CI attach; no shell button |
| Necromancer | **PASS** | Approval-gated; Postgres durable (0.34) |
| Browser E2E | **PARTIAL** | CI mock-API smoke (0.35); no live full-stack E2E |
| Postgres durability | **PASS** | Migrations + `test:postgres` in CI |
| Firebase baseline | **PASS** | Wiring; not production-deployed |
| Ollama local model | **PASS** | Health + invoke; optional for CI E2E |
| CI integration | **PASS** | test, typecheck, build, e2e, postgres |
| UI reference / visual regression | **FAIL** | Reference PNGs missing; no diff tooling |
| Manual live operator smoke | **PARTIAL** | Documented; not automated checklist in CI |
| Safety / governance | **PASS** | Banner, dry_run, terminal off, blocks enforced |
| Side-project blocking | **PASS** | GUING blocked in SSOT + UI |
| Secrets / local file safety | **PASS** | Redaction, gitignore, no auto shell |
| Recovery / startup docs | **PARTIAL** | `scripts/dev.sh`, VERIFICATION_COMMANDS; no CC recovery panel |

---

## 4. Gap classification

### Hard blockers (before Cursor exit)

1. **Work packet creation UI** — operator must use POST/script today
2. **Live full-stack operator smoke** — prove CC + real API + Postgres paths together (manual checklist minimum)
3. **End-to-end operator day documented** — single runbook: start stack → create packet → approve → dispatch → evidence → handoff

### Acceptable after exit (with docs)

- Visual regression vs locked PNGs (assets missing)
- CI status auto-ingest into dashboard (manual CI URL attach works)
- Cross-browser Playwright matrix
- Executor consumer (dry-run remains until explicitly approved)

### Future enhancements

- Automatic command output capture (governance-approved)
- In-app reference screenshot compare
- Firebase production hosting
- Voice / mic Jarvis

### Intentionally blocked by governance

- Shell execution, Cursor CLI auto-invoke, autonomous cleanup, delete endpoints
- GUING and all side projects until base verified from inside RealmOS
- RealmOS as code editor (Cursor remains for editing)

---

## 5. Recommended roadmap (0.37+)

| Initiative | Objective | Verification gates |
|------------|-----------|-------------------|
| **0.37 — Work Packet Creation / Approval UI Completion** | Add CC form to create draft packets; polish approve→dispatch operator path | unit + E2E create flow; `pnpm test:e2e` |
| **0.38 — Live Full-Stack Operator Smoke** | Document + automate live API Playwright job (Postgres service in CI) | new `test:e2e:live` or CI job; manual checklist |
| **0.39 — Cursor Exit Blocker Fixes Batch 1** | Recovery runbook in CC, CI link visibility, navigation hardening | docs + smoke; optional UI panel |
| **0.40 — Operator Day Proof** | Operator completes full day in RealmOS only (audit sign-off) | evidence attach + handoff record |
| **Milestone** | Cursor IDE exit readiness **PASS** | All hard blockers cleared |

**Do not start 0.37 until operator explicitly approves.**

---

## 6. Verification (0.36)

Audit initiative — full suite run before close:

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start && pnpm demo:mvp && pnpm test:e2e && pnpm test:postgres
```
