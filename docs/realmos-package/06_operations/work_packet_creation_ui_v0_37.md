# Work Packet Creation UI — Initiative 0.37

Version: 0.37.0  
Prepared: 2026-06-13

## Purpose

Complete the Command Center operator flow for **creating**, reviewing, **approving**, and **dry-run dispatching** work packets from the UI — without curl or scripts.

## UI flow

| Step | UI | API |
|------|-----|-----|
| 1. Create draft | `WorkPacketCreatePanel` in Tasks/Runs/Overview | `POST /api/lifecycle/packets` |
| 2. Mark ready | Monitor panel → Mark ready | `POST .../ready` |
| 3. Approve | Operator ID + Approve | `POST .../approve` |
| 4. Dispatch (dry-run) | Dispatch button | `POST .../dispatch` |
| 5. Await result | Status + notice | Manual result / verification (existing) |

## Safety defaults

- Realm selector: **RealmOS base-system only** (`realm_realmos`, `realm_realm_os`)
- **No GUING/side-project** realms or initiatives in form
- Governance checkbox required before create
- Client + server validation via `validateWorkPacketLifecycleInput`
- Approval requires **operator ID**
- Dispatch only when status is **approved**
- Dry-run only — queue artifact path shown; no shell/Cursor CLI auto-run

## Components

- `WorkPacketCreatePanel.tsx` — create form
- `WorkPacketTaskMonitorPanel.tsx` — create panel + monitor + operator ID + dispatch display
- `lib/lifecycle/form-validation.ts` — client gating
- `lib/lifecycle/defaults.ts` — RealmOS-safe defaults

## E2E

`e2e/work-packet-create.smoke.spec.ts` — create → ready → approve → dispatch against mock API.

## Verification

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm test:e2e
```

## Recommended next

**0.38 — Live Full-Stack Operator Smoke** — await operator approval.
