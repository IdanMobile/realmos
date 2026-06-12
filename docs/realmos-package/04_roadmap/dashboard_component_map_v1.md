# RealmOS — Dashboard Component Map v1

## Layout

```text
CommandCenterLayout
  SidebarNav
  TopCommandBar
  MainGrid
    JarvisBriefingPanel
    EcosystemBusinessesPanel
    ActiveAgentsPanel
    TaskStatusPanel
    ApprovalQueuePanel
    CostBudgetPanel
    MemorySummariesPanel
    RecentActivityPanel
    WorldPreviewPanel
```

## Components

### JarvisBriefingPanel

Props:

```ts
{
  greeting: string;
  briefingItems: BriefingItem[];
  inputValue: string;
  quickActions: QuickAction[];
}
```

### EcosystemBusinessesPanel

Props:

```ts
{
  businesses: Business[];
}
```

### ActiveAgentsPanel

Props:

```ts
{
  agents: Agent[];
}
```

### TaskStatusPanel

Props:

```ts
{
  tasks: Task[];
}
```

### ApprovalQueuePanel

Props:

```ts
{
  approvals: ApprovalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}
```

### CostBudgetPanel

Props:

```ts
{
  monthlyBudget: Budget;
  costs: CostEntry[];
}
```

### MemorySummariesPanel

Props:

```ts
{
  memories: Memory[];
}
```

### RecentActivityPanel

Props:

```ts
{
  events: AuditEvent[];
}
```

### WorldPreviewPanel

Props:

```ts
{
  worldMap: WorldMap;
}
```

## Design Direction

- dark mode
- practical sci-fi
- clean cards
- small neon accents
- no clutter
- no game characters in MVP
