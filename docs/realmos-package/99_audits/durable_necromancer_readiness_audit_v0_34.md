# Durable Necromancer Readiness Audit — Initiative 0.34

Date: 2026-06-13  
Scope: Necromancer protect registry + action history Postgres persistence, evidence links, UI durable status

## Verdict

| Overall | **PARTIAL** — Necromancer persistence improved; Cursor IDE exit still FAIL |
| Initiative 0.34 | **PASS** |
| Recommended next | **0.35 — Browser E2E Smoke for Command Center Core Flows** |

---

## Inventory (0.34)

| Component | Status |
|-----------|--------|
| `NecromancerProtectionRecord` contract | **Implemented** |
| `NecromancerOperatorActionRecord` contract | **Implemented** |
| Migration `011_necromancer_persistence.sql` | **Implemented** |
| Operational necromancer store (memory + Postgres) | **Implemented** |
| Durable protect registry | **Implemented** |
| Durable action history (applied + blocked) | **Implemented** |
| Optional evidenceId link to 0.33 records | **Implemented** |
| GET `/api/necromancer/status` | **Implemented** |
| Command Center durable/memory badge | **Implemented** |
| Delete endpoint | **Absent** |
| Playwright E2E | **Missing** (0.35 scope) |
| Manual Postgres restart smoke | **Not run in agent session** |

---

## Backend readiness

| Check | Result |
|-------|--------|
| Protect persists across store re-instantiation | PASS |
| Actions persist across re-instantiation | PASS |
| Blocked pause attempt persisted | PASS |
| Candidate list respects durable protection | PASS |
| EvidenceId validation (linked/invalid) | PASS |
| Postgres migration registered | PASS |
| No delete endpoint | PASS |
| No shell/Cursor CLI path | PASS |
| GUING/side-project block preserved | PASS |

---

## UI behavior

| Check | Result |
|-------|--------|
| Durable Postgres badge | PASS |
| Memory demo badge | PASS |
| Persisted action history | PASS |
| Evidence reference in history | PASS |
| Approval gating | PASS |
| No shell execution button | PASS |

---

## Safety guarantees

- **No automatic cleanup** — pause/retire only on explicit operator approval
- **No deletion** — retire maps to cancelled/paused status; no delete API
- **No shell** — unchanged
- **No Cursor CLI** — unchanged
- **Audit + action record** — every operator action and blocked attempt recorded
- **Secrets** — not stored in necromancer records

---

## Verification suite (0.34)

| Command | Result |
|---------|--------|
| `pnpm test` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm build` | **PASS** |
| `pnpm check:clean-start` | **PASS** |
| `pnpm demo:mvp` | **PASS** |
| `pnpm test:postgres` | **PASS** |

---

## Known gaps

1. **Playwright browser E2E** — deferred to 0.35
2. **Manual API restart smoke in Postgres mode** — operator should verify protect survives restart
3. **Cursor IDE exit** — still FAIL

---

## Do not start 0.35 until operator explicitly approves.
