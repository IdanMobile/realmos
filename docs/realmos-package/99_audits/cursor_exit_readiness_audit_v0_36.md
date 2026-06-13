# Cursor IDE Exit Readiness Audit — v0.36

| Field | Value |
|-------|-------|
| Initiative | **0.36 — Cursor IDE Exit Readiness Audit / Remaining Base-System Gaps** |
| Version | `0.36.0` |
| Date | 2026-06-13 |
| Verdict | **PASS** (audit complete) |
| **Cursor IDE exit readiness** | **FAIL** |
| Recommended next | **0.37 — Work Packet Creation / Approval UI Completion** |

---

## Executive summary

RealmOS base-system backend and core operator panels are **substantially built** (0.29–0.35). Browser E2E smoke runs in CI with a mock API. Jarvis chat, Necromancer, verification evidence, and lifecycle APIs are **real and tested**.

**Cursor IDE exit remains FAIL** because the operator still cannot **originate work from the Command Center UI**, live full-stack operator proof is manual, and navigation/reference verification is incomplete. Cursor remains required for code editing (intentional) and for starting work via API/scripts (unintentional gap).

---

## 1. Cursor IDE exit checklist (operator day)

| Question | Status | Evidence |
|----------|--------|----------|
| Can operator view system status? | **PASS** | `SystemStatusPanel`, `/api/health`, governance banner |
| Can operator ask Jarvis questions? | **PASS** | `JarvisChatPanel`, `/api/jarvis/chat` operator mode, 0.31 audit |
| Can operator create work packets from UI? | **FAIL** | `createLifecyclePacket` API client only; panel says POST |
| Can operator approve/track work packets from UI? | **PARTIAL** | `WorkPacketTaskMonitorPanel`: ready/approve/dispatch/result/verify/close |
| Can operator dispatch work safely? | **PARTIAL** | Dry-run queue only; approval required; no auto consumer |
| Can operator attach/verify evidence? | **PASS** | `VerificationEvidencePanel` 0.33; lifecycle verify in monitor |
| Can operator see run-state/handoff? | **PARTIAL** | `RunStateHandoffPanel`; create from packet; repo markdown manual |
| Can operator manage stale work via Necromancer? | **PASS** | 0.32–0.34; durable Postgres; E2E smoke 0.35 |
| Can operator understand blocked/not implemented? | **PARTIAL** | Decisions placeholder, disabled search, safety banner; many overview panels |
| Can operator navigate without confusion? | **PARTIAL** | `?section=` nav 0.30; single route; no reference compare |
| Can operator recover after restart? | **PARTIAL** | Postgres durable when configured; memory ephemeral; `scripts/dev.sh` |
| Can operator rely on CI/evidence visibility? | **PARTIAL** | CI green in GitHub; paste CI URL in evidence; no CC CI dashboard |
| Can operator avoid GUING/side-project leakage? | **PASS** | SSOT gate, governance banner, Necromancer blocks |
| Can operator use RealmOS without Cursor except code edit? | **FAIL** | No create UI; editing stays in Cursor by design |

**Checklist score:** PASS 6 · PARTIAL 7 · FAIL 2

---

## 2. Full readiness matrix

| Capability | Status | Evidence source | Blocking gaps | Risk | Recommended fix |
|------------|--------|-----------------|---------------|------|-----------------|
| Command Center navigation | **PARTIAL** | 0.30 audit, 0.35 E2E | Single-route `?section=`; reference PNGs missing | Medium confusion | 0.39 nav hardening |
| Jarvis chat | **PASS** | 0.31 audit, E2E smoke | Requires Live API + Ollama for full replies | Low | None (maintain) |
| Work packet lifecycle UI | **PARTIAL** | `WorkPacketTaskMonitorPanel.tsx` | **No create form** | **High — hard blocker** | **0.37** |
| Executor bridge / dry-run | **PARTIAL** | API routes, health check | Consumer not built (by design) | Low until exec approved | Future / governance |
| Run monitor | **PARTIAL** | Monitor panel, executor status | Queue artifact not file-browser | Low | 0.39 optional |
| Run-state / handoff | **PARTIAL** | `RunStateHandoffPanel`, API | Handoff markdown manual | Medium continuity | 0.39 / 0.40 |
| Verification evidence | **PASS** | 0.33 audit, E2E smoke | Manual paste only (by design) | Low | Acceptable |
| Necromancer | **PASS** | 0.32–0.34 audits, E2E | — | Low | Maintain |
| Browser E2E | **PARTIAL** | 0.35 audit, CI #17 | Mock API only in CI | Medium trust | **0.38 live smoke** |
| Postgres durability | **PASS** | `test:postgres`, migrations 010–011 | Operator must run Postgres locally for dev | Low | Docs in 0.39 |
| Firebase baseline | **PASS** | platform-infra tests | Not production | Low | Future |
| Ollama local model | **PASS** | `demo:mvp`, health | Not in CI E2E | Low | Acceptable |
| CI integration | **PASS** | `.github/workflows/ci.yml`, run #17 | — | Low | Maintain |
| UI reference / visual regression | **FAIL** | 0.30 audit | PNGs absent | Low for exit | Future |
| Manual live smoke | **PARTIAL** | VERIFICATION_COMMANDS | No signed operator checklist | Medium | **0.38 / 0.40** |
| Safety / governance | **PASS** | Governance banner, tests, E2E safety | — | Low | Maintain |
| Side-project blocking | **PASS** | CURSOR_SSOT §5, UI copy | — | Low | Maintain |
| Secrets / local file safety | **PASS** | gitignore, evidence redaction | — | Low | Maintain |
| Recovery / startup | **PARTIAL** | `scripts/dev.sh`, VERIFICATION_COMMANDS | No CC “restart guide” | Medium | 0.39 |
| Code editing in RealmOS | **NOT NEEDED YET** | PLATFORM_DECISIONS | Intentionally Cursor | — | — |
| Shell / Cursor CLI exec | **BLOCKED** | Governance | By design | — | — |
| Voice / mic | **BLOCKED** | Scope rules | By design | — | — |
| GUING / side projects | **BLOCKED** | SSOT gate | By design | — | — |

---

## 3. Hard blockers vs acceptable gaps

### Hard blockers (must fix before Cursor exit)

| # | Gap | Why it blocks |
|---|-----|---------------|
| H1 | **No work packet creation UI** | Operator cannot start work from RealmOS alone |
| H2 | **No live full-stack operator proof** | Mock E2E does not prove real API + Postgres + UI together |
| H3 | **No operator-day runbook sign-off** | No documented proof of full control surface in one session |

### Acceptable after exit (documented)

- Visual regression / reference PNG compare (assets missing)
- CI status widget in Command Center (CI URL attach suffices initially)
- Cross-browser E2E
- Executor consumer beyond dry-run
- Automatic command output capture

### Future enhancements

- Firebase production deployment
- In-app file/queue artifact viewer
- Dogfood scripts in CI
- Performance review / Necromancer auto-detection

### Intentionally blocked

- Shell execution, Cursor CLI auto-invoke, autonomous cleanup, delete endpoints
- GUING and side projects
- Voice, autonomous execution without approval
- RealmOS as IDE/code editor

---

## 4. Prioritized roadmap (0.37+)

### 0.37 — Work Packet Creation / Approval UI Completion (recommended next)

**Objective:** Operator can create draft work packets from Runs section and complete approve→dispatch path without curl.

**Scope:** Minimal create form (realm, repo, objective, instructions, paths); wire `createLifecyclePacket`; tests + E2E extension.

**Gates:** `pnpm test`, `pnpm test:e2e`, lifecycle integration tests.

**Out of scope:** Shell, Cursor CLI, auto-dispatch without approval.

---

### 0.38 — Live Full-Stack Operator Smoke

**Objective:** Prove Command Center against real `@realmos/api` + Postgres in CI or documented manual checklist.

**Scope:** Optional `test:e2e:live` job; operator checklist doc; evidence attach in live mode.

**Gates:** CI job or signed manual evidence record.

---

### 0.39 — Cursor Exit Blocker Fixes Batch 1

**Objective:** Recovery runbook surfaced in CC; CI/evidence visibility polish; navigation clarity.

**Scope:** Operator Guide enhancements, startup/recovery panel, minor nav labels.

---

### 0.40 — Operator Day Proof

**Objective:** Operator completes full day using RealmOS as primary control (except code edit in Cursor); audit sign-off.

**Gates:** Verification evidence attached; handoff updated; audit PASS for Cursor exit.

---

## 5. Progress since 0.29 baseline

| Area | 0.29 | 0.36 |
|------|------|------|
| Navigation | FAIL | **PARTIAL** |
| Jarvis chat UI | FAIL | **PASS** |
| Necromancer UI | NOT IMPLEMENTED | **PASS** |
| Verification evidence | PARTIAL | **PASS** |
| Browser E2E | Missing | **PARTIAL** |
| Necromancer durability | In-memory | **PASS** (Postgres) |
| Cursor IDE exit | FAIL | **FAIL** (narrower gap list) |

---

## 6. Safety confirmations (0.36)

- No GUING / side-project work
- No shell execution enabled
- Cursor CLI not invoked
- No autonomous execution added
- No new features beyond docs/state/version bumps

---

## 7. Verification suite (0.36)

Recorded at audit close — see initiative report.

---

## Do not start 0.37 until operator explicitly approves.
