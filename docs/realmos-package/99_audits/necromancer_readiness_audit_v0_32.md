# Necromancer Readiness Audit — Initiative 0.32

Date: 2026-06-13  
Scope: Necromancer operator verification and Command Center UI hardening

## Verdict

| Overall | **PARTIAL** — Necromancer operator path improved; Cursor exit still FAIL |
| Initiative 0.32 | **PASS** |
| Recommended next | **0.33 — Verification Evidence Capture** |

---

## Inventory (0.32)

| Component | Status |
|-----------|--------|
| `packages/agents` candidate detection | **Implemented** |
| `packages/agents` recommendations + operator validation | **Implemented** |
| API candidate/prepare/pause/retire/protect routes | **Implemented** |
| Approval-gated direct pause/retire routes | **Implemented** |
| Audit events on operator actions | **Implemented** |
| In-memory protect registry + action history | **Partial** (not Postgres-durable) |
| Command Center Necromancer panel | **Implemented** |
| Agent creation Creator Router (legacy) | **Implemented** (unchanged) |
| Performance review / auto need detection | **Missing** (future) |
| Playwright E2E | **Missing** |

---

## Backend readiness

| Check | Result |
|-------|--------|
| List candidates | PASS |
| Classify stale/failed/orphaned/blocked | PASS |
| Prepare recommendation | PASS |
| Pause with approval | PASS |
| Retire with approval | PASS |
| Protect with approval | PASS |
| Block without approval | PASS |
| Block GUING/side-project pause/retire | PASS |
| Block destructive language | PASS |
| Audit on actions | PASS |
| No delete endpoint | PASS |
| No shell/Cursor CLI path | PASS |

---

## UI behavior

| Check | Result |
|-------|--------|
| Agents section panel | PASS |
| Candidate list / empty state | PASS |
| Recommendation display | PASS |
| Approval gating in UI | PASS |
| Safety notice | PASS |
| Mock mode guard | PASS |
| Live API required | PASS |

---

## Safety guarantees

- **No automatic execution** — all pause/retire/protect require `approved: true` + `operatorId`
- **No deletion** — retire maps to cancelled/retired status only
- **No shell** — blocked in validation patterns
- **No Cursor CLI** — blocked
- **GUING/side projects** — pause/retire blocked on blocked scope
- **No voice / no autonomous dispatch**

---

## Verification suite (0.32)

| Command | Result |
|---------|--------|
| `pnpm test` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm build` | **PASS** |
| `pnpm check:clean-start` | **PASS** |
| `pnpm demo:mvp` | **PASS** |
| `pnpm test:postgres` | **PASS** |

**Known gaps:** No browser E2E; protect registry not Postgres-durable; manual smoke not automated in CI.

---

## Base-system readiness impact

| Area | 0.31 | 0.32 |
|------|------|------|
| Necromancer | PARTIAL | **PARTIAL+** (operator UI + candidate API) |
| Navigation | PARTIAL | PARTIAL |
| Cursor IDE exit | FAIL | **FAIL** |
| Overall | PARTIAL | **PARTIAL** |

---

## Do not start 0.33 until operator explicitly approves.
