# Durable Necromancer Persistence — Initiative 0.34

Prepared: 2026-06-13  
Purpose: Persist Necromancer protect registry and operator action history in operational Postgres storage while preserving approval gates and no autonomous destructive action.

## Summary

| Area | Status |
|------|--------|
| Durable protect registry | **PASS** |
| Durable action history (applied + blocked) | **PASS** |
| Postgres migration `011` | **PASS** |
| Optional verification evidence link | **PASS** |
| Memory demo mode | **PASS** |
| Delete endpoint | **Absent (by design)** |
| Automatic cleanup | **Blocked** |

## Persistence model

### Protect registry (`NecromancerProtectionRecord`)

- `candidateId`, `realmId`, `operatorId`, `reason`, optional `evidenceId`
- `createdAt`, `updatedAt`
- Stored in `operational_necromancer_protections`

### Action history (`NecromancerOperatorActionRecord`)

- `action` / `actionType`: prepare, pause, retire, protect
- `outcome`: applied | blocked
- `operatorId`, `approved`, `summary`, `blockReason`
- `candidateSnapshot`, optional `recommendationSnapshot`
- optional `evidenceId`, `evidenceStatus` (linked | invalid)
- `approvalMetadata`, `realmId`, `createdAt`
- Stored in `operational_necromancer_actions`

Indexes on candidateId, realmId, actionType, operatorId, createdAt (JSONB payload fields).

## API

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/necromancer/status` | Persistence mode + safety flags |
| GET | `/api/necromancer/candidates` | Includes `persistenceMode`, `durable` |
| GET | `/api/necromancer/actions` | Filter by candidateId, action, operatorId, outcome |
| POST | `.../pause|retire|protect` | Optional `evidenceId` in body |

Blocked attempts are persisted with `outcome: blocked`. No delete routes.

## Evidence integration

Operator may pass optional `evidenceId` referencing a 0.33 `VerificationEvidenceRecord`. The API validates existence and records `evidenceStatus`. Evidence is optional for prepare; pause/retire/protect record approval + optional evidence link.

## UI

Command Center → **Agents** → **Necromancer Operator**:

- Badge: **Durable Postgres** vs **Memory demo**
- Optional verification evidence ID field
- Persisted action history with evidence reference
- Approval + no automatic cleanup notices

## Manual smoke

```bash
pnpm --filter @realmos/api dev   # Postgres mode: DATABASE_URL set, REALMOS_USE_MEMORY_DB=false
pnpm --filter @realmos/web dev
# Protect a safe stale candidate with approval
# Restart API and confirm protected state + action history remain
curl http://localhost:4100/api/necromancer/status
curl http://localhost:4100/api/necromancer/actions
```

## Recommended next

**0.35 — Browser E2E Smoke for Command Center Core Flows** — await operator approval.
