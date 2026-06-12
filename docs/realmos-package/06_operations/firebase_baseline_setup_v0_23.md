# Firebase Baseline Setup — Initiative 0.23

RealmOS uses Firebase as the **future cloud platform layer** for orchestration metadata only. Initiative 0.23 adds baseline wiring — config, health, safe initialization hooks — without production deploy or Postgres migration.

## What Firebase is for (RealmOS)

- Authentication (future)
- Firestore for RealmOS coordination state (future)
- Storage for artifact metadata (future)
- Hosting / App Hosting (future)
- Cloud Functions when needed (future)

RealmOS **orchestration metadata** lives here eventually. **Product/project runtimes** (e.g. GUING) keep their own infra per `PROJECT_INFRASTRUCTURE_ISOLATION.md`.

## What is intentionally NOT wired yet

- No Firestore reads/writes from API routes
- No Auth flows or user sessions
- No Hosting deploy or Cloud Functions deploy
- No migration from Postgres to Firebase
- No sync agent implementation
- No production Firebase project creation from this repo

## Environment variables

### Server / API (`@realmos/platform-infra`)

| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project id — required for `configured` status |
| `FIREBASE_AUTH_EMULATOR_HOST` | e.g. `127.0.0.1:9099` |
| `FIRESTORE_EMULATOR_HOST` | e.g. `127.0.0.1:8080` |
| `FIREBASE_STORAGE_EMULATOR_HOST` | e.g. `127.0.0.1:9199` |
| `REALMOS_FIREBASE_ENABLED=false` | Force disabled status in health |

### Web client (public, browser-safe only)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key (public) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web app id |

Copy from `.env.example`. **Never commit `.env` or service account JSON.**

## Required user actions (Firebase project)

1. Create or select a Firebase project in [Firebase Console](https://console.firebase.google.com/) — **manual, not automated by RealmOS**.
2. Add a Web app in Project settings → copy public config into `NEXT_PUBLIC_*` vars.
3. For server Admin SDK in production later: download service account JSON locally and set `GOOGLE_APPLICATION_CREDENTIALS` — **never commit the file**.

## Local emulator flow (optional)

Emulators are **not required** for `pnpm test`, CI, or MVP demo.

1. Install Firebase CLI (machine-level): https://firebase.google.com/docs/cli  
   If `firebase` is missing, install manually — RealmOS does not install it for you.
2. Login (one-time): `firebase login`
3. From repo root, start emulators (uses `firebase.json` ports):

```bash
firebase emulators:start
```

4. In `.env` (local, gitignored):

```bash
FIREBASE_PROJECT_ID=demo-realmos
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

5. Restart API: `pnpm dev` or `bash scripts/dev-api.sh`
6. Check health: `curl http://localhost:4100/api/health` → `checks.firebase.mode` should be `emulator`.

## Verification without Firebase

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp
```

With no `FIREBASE_PROJECT_ID`, health reports `checks.firebase.status: not_configured`. The API and demo continue normally.

## Production deploy

**Out of scope for 0.23.** No `firebase deploy`, no public hosting, no Cloud Functions release.

## Secret handling rules

- Do not commit `.env`, service account keys, or refresh tokens
- Do not store private keys in `NEXT_PUBLIC_*` variables
- Use emulators for local dev without production credentials when possible
- Production credentials remain operator-managed outside the repository

## Related docs

- `PLATFORM_DECISIONS.md`
- `PROJECT_INFRASTRUCTURE_ISOLATION.md`
- `docs/realmos-package/99_audits/firebase_baseline_audit_v0_23.md`
