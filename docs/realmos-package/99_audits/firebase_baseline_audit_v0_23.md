# Firebase Baseline Audit — Initiative 0.23

Date: 2026-06-12  
Initiative: 0.23 — Firebase Baseline Wiring  
Verdict: **PASS** (baseline wiring; no production deploy)

## Scope delivered

| Requirement | Status |
|-------------|--------|
| Firebase config module with env vars | **PASS** — `packages/platform-infra/src/firebase-config.ts` |
| Graceful missing config (`not_configured`) | **PASS** |
| Admin SDK safe init (server) | **PASS** — `firebase-admin.ts`, lazy cache, no crash when unconfigured |
| Web client safe init | **PASS** — `apps/web/src/lib/firebase/client.ts` |
| API health `checks.firebase` | **PASS** — status, mode, services, emulator hosts |
| Dashboard Firebase status card | **PASS** — `SystemStatusPanel` |
| Emulator-first docs | **PASS** — `firebase_baseline_setup_v0_23.md`, root `firebase.json` |
| No Postgres migration | **PASS** |
| No production deploy | **PASS** |
| No secrets in repo | **PASS** |
| Tests without Firebase login | **PASS** |

## Architecture boundary preserved

- RealmOS orchestration metadata only — Firebase is not default storage for all project data
- Postgres remains local durable path
- Ollama local node unchanged
- Product infra isolation rules unchanged

## Health behavior when config missing

```json
{
  "checks": {
    "firebase": {
      "status": "not_configured",
      "mode": "none",
      "projectId": null,
      "adminStatus": "not_configured",
      "services": {
        "auth": "not_configured",
        "firestore": "not_configured",
        "storage": "not_configured"
      },
      "emulatorHosts": {}
    }
  }
}
```

API overall status stays `ok` (Firebase absence is not a degradation).

## Firebase CLI / login / project

| Item | Required for CI/MVP? |
|------|----------------------|
| Firebase CLI | No |
| `firebase login` | No |
| Firebase project | No (optional for emulator/production experiments) |
| Service account JSON | No (future production Admin only) |

## Intentionally deferred

- Firestore persistence for API entities
- Auth integration
- Hosting / Functions deploy
- Sync agent M1 → Firebase
- Firebase security rules in repo

## Risks

1. **SDK weight** — `firebase-admin` and `firebase` add dependencies; not loaded for core MVP paths when unconfigured.
2. **Production Admin** — `initializeApp({ projectId })` works for emulators; production needs credentials outside repo.
3. **Emulator ports** — must match `firebase.json` and env vars.

## Recommended next initiative

**0.24 — Local Executor / Cursor CLI Bridge** (RealmOS executor/work orchestration infrastructure).

**Blocked until self-management milestone:** GUING bootstrap, side projects, product work outside RealmOS, non-operational UI polish, voice.

Firebase baseline does not unlock product work. Do not auto-start 0.24 without operator approval.
