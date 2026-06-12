# Launch Readiness Checklist v1.14

## Expected User Flow

1. Unzip package.
2. Open only the `realmos/` folder in Cursor.
3. Send the one-line prompt below.
4. Cursor reads `CURSOR_SSOT.md`.
5. Cursor runs Phase 0 only.
6. Cursor reports setup status and stops.

## First Cursor Prompt

```text
Read CURSOR_SSOT.md and follow it exactly. Do Phase 0 only. Stop after the Phase 0 report and do not start implementation until I approve.
```

## Correct Folder

Correct:

```text
realmos_cursor_ready_v1_14/realmos/
```

Wrong:

```text
realmos_cursor_ready_v1_14/
```

## Manual Commands If Needed

```bash
corepack enable
pnpm install
pnpm check:clean-start
```

## Phase 0 Only

Cursor should not create Firebase resources, GitHub integrations, Ollama config, app features, or new architecture during Phase 0.
