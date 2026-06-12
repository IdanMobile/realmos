# Cursor Prompt — Build RealmOS Dashboard UI

Build the first dashboard UI for RealmOS.

Screens:

1. Command Center
2. Businesses
3. Business Detail
4. Agents
5. Agent Detail
6. Tasks
7. Approvals
8. Memory
9. Costs
10. World
11. Settings

Start with Command Center only if time is limited.

Component structure:

```text
apps/web/src/features/command-center/
  command-center-page.tsx
  components/
    jarvis-briefing-panel.tsx
    ecosystem-businesses-panel.tsx
    active-agents-panel.tsx
    task-status-panel.tsx
    approval-queue-panel.tsx
    cost-budget-panel.tsx
    memory-summaries-panel.tsx
    recent-activity-panel.tsx
    world-preview-panel.tsx
```

Use mock data first.

Visual style:

- dark dashboard
- clean practical command center
- subtle cyan/violet accents
- readable before fancy
- responsive enough for desktop

Do not create game-like characters yet.
