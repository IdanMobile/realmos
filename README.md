# RealmOS / Jarvis HQ

Cursor's single source of truth is:

```text
CURSOR_SSOT.md
```

First Cursor prompt (new sessions):

```text
Read docs/realmos-package/99_handoffs/new_chat_prompt.md and follow it.
```

## Getting started (fresh GitHub clone)

**Use pnpm — not npm.** This is a pnpm workspace. `npm install` will fail.

### Prerequisites

- **Node.js 22+** ([nodejs.org](https://nodejs.org/) or nvm)
- **pnpm 9** (installed automatically via Corepack — see below)

### One-time setup

```bash
corepack enable
pnpm bootstrap
```

`pnpm bootstrap` creates `.env` from `.env.example` (if missing) and runs `pnpm install`.

If you already ran `npm install` and hit errors, reset and use pnpm:

```bash
rm -rf node_modules package-lock.json
corepack enable
pnpm bootstrap
```

### Run locally (one command)

```bash
pnpm dev
```

Starts API + web in one terminal (creates `.env` and installs deps on first run). Press **Ctrl+C** to stop.

- Web: http://localhost:3000
- API health: http://localhost:4100/api/health

If ports are already in use by healthy RealmOS processes, those services are reused instead of failing.

Optional MVP demo (with dev servers running):

```bash
pnpm demo:mvp
```

### Run services individually (optional)

```bash
pnpm --filter @realmos/api dev   # or ./scripts/dev-api.sh
pnpm --filter @realmos/web dev   # or ./scripts/dev-web.sh
```

### Verify

```bash
pnpm test
pnpm typecheck
pnpm build
```

See `VERIFICATION_COMMANDS.md` for Postgres smoke, CI, and other commands.

## Locked Decisions

```text
Firebase = RealmOS primary cloud platform
M2 MacBook (16GB) = local Jarvis/execution node
GitHub = source control
Ollama = local LLM runtime
```

## Hard Boundary

```text
RealmOS owns orchestration.
Each project owns its product runtime.
```
