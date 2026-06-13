# Necromancer Operator Flow — Initiative 0.32

Prepared: 2026-06-13  
Purpose: Verify and harden the Necromancer operator path for safe lifecycle review of stale, failed, and orphaned RealmOS work.

## Summary

| Area | Status |
|------|--------|
| Candidate detection (agents/tasks/work packets) | **PASS** |
| Recommendation preparation | **PASS** |
| Approval-gated pause/retire/protect | **PASS** |
| Audit events on operator actions | **PASS** |
| Command Center Necromancer panel | **PASS** |
| Autonomous/destructive actions | **BLOCKED** |
| GUING/side-project scope actions | **BLOCKED** |

## Capability definition

Necromancer in the RealmOS base system:

1. **Detect** stale, failed, orphaned, or blocked agents, tasks, and work packet lifecycles
2. **Classify** candidate risk and recommended safe action
3. **Prepare** operator-readable recommendations (no state change)
4. **Pause / retire / protect** only after explicit operator approval
5. **Record** audit events and in-memory action history
6. **Never** delete data, run shell, invoke Cursor CLI, or act autonomously

## API

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/necromancer/candidates` | List detected candidates |
| GET | `/api/necromancer/candidates/:id` | Candidate + recommendation |
| POST | `/api/necromancer/candidates/:id/prepare` | Prepare recommendation (audited) |
| POST | `/api/necromancer/candidates/:id/pause` | Pause with `{ approved: true, operatorId }` |
| POST | `/api/necromancer/candidates/:id/retire` | Retire/cancel with approval |
| POST | `/api/necromancer/candidates/:id/protect` | Mark do-not-touch with approval |
| GET | `/api/necromancer/actions` | Recent operator action history |

Legacy creation routes remain:

- `POST /api/necromancer/proposals/classify`
- `POST /api/necromancer/agents/prepare`
- `POST /api/agents/:id/pause` — now approval-gated
- `POST /api/agents/:id/retire` — now approval-gated

## UI

Command Center → **Agents** section → **Necromancer Operator** panel:

- Candidate list or honest empty state
- Classification, risk, realm/repo context
- Recommendation text
- Approval checkbox + operator ID
- Prepare / Pause / Retire / Protect buttons
- Recent action history
- Safety banner: no autonomous destructive actions

Requires **Live API** mode.

## Manual smoke

```bash
pnpm --filter @realmos/api dev
pnpm --filter @realmos/web dev
# Open http://localhost:3000/?section=agents
# Confirm Necromancer panel, empty state or candidates
# Confirm action buttons require approval
```

## Recommended next

**0.33 — Verification Evidence Capture**
