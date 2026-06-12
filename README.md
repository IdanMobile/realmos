# RealmOS / Jarvis HQ

Cursor's single source of truth is:

```text
CURSOR_SSOT.md
```

First Cursor prompt (new sessions):

```text
Read docs/realmos-package/99_handoffs/new_chat_prompt.md and follow it.
```

## Manual Verify

```bash
corepack enable
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm demo:mvp   # requires API on :4100
```

See `VERIFICATION_COMMANDS.md` for full commands.

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
