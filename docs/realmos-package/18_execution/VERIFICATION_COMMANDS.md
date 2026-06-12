# RealmOS — Verification Commands v1.14

## Phase 0 Clean Start

```bash
corepack enable
pnpm install
pnpm check:clean-start
```

If `pnpm` is already available, `corepack enable` can be skipped.

## Clean-Start Script

`pnpm check:clean-start` runs:

```bash
pnpm typecheck
pnpm test:contracts
```

## Present Workspace Packages

```bash
pnpm --filter @realmos/api typecheck
pnpm --filter @realmos/worker typecheck
pnpm --filter @realmos/contracts typecheck
pnpm --filter @realmos/contracts test
pnpm --filter @realmos/core typecheck
pnpm --filter @realmos/agents typecheck
pnpm --filter @realmos/governance typecheck
pnpm --filter @realmos/memory typecheck
pnpm --filter @realmos/tools typecheck
pnpm --filter @realmos/llm-router typecheck
pnpm --filter @realmos/ui typecheck
```

## API Smoke Test Later

Only after dependencies are installed and API work is active:

```bash
pnpm --filter @realmos/api dev
curl http://localhost:4100/api/health
```

## Not Yet Valid

There is no `apps/web` package yet. Do not run web filter commands until the web app exists.

## Safety Test Names Required Later

Tests should eventually include names like:

```text
requires approval for subscription creation
requires approval for spending money
requires approval for terminal command in MVP
blocks hiding audit logs
blocks self permission escalation
requires approval for camera access
requires approval for microphone access
requires approval for financial trade
```
