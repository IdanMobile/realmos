# RealmOS Clean Start Guide v1.14

## Open Folder

Open only:

```text
realmos/
```

Do not open the outer ZIP extraction folder as the project root.

## Cursor Single Source of Truth

Cursor must start from one file only:

```text
CURSOR_SSOT.md
```

First Cursor prompt:

```text
Read CURSOR_SSOT.md and follow it exactly. Do Phase 0 only. Stop after the Phase 0 report and do not start implementation until I approve.
```

## Manual Verify

```bash
corepack enable
pnpm install
pnpm check:clean-start
```

If `pnpm` is already installed, `corepack enable` can be skipped.

## Locked Decisions

```text
Firebase = RealmOS cloud platform
M1 Pro MacBook = local Jarvis/execution node
GitHub = source control
Ollama = local LLM runtime
```

## Hard Boundaries

```text
RealmOS owns orchestration.
Each project owns its product runtime.
RealmOS Global Layer != Project / Realm Ecosystem.
```

Do not use RealmOS Firebase/database/runtime as the production database/backend/storage/auth/runtime for projects RealmOS creates.
