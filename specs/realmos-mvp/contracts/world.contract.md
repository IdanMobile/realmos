# World Contract

```ts
type WorldMap = {
  id: string;
  title: string;
  version: string;
  nodes: WorldNode[];
  edges: WorldEdge[];
  updatedAt: string;
};

type WorldNode = {
  id: string;
  kind: "jarvis_hq" | "business_land" | "office" | "room" | "agent_desk" | "task_marker" | "metric_marker";
  refType?: "business" | "agent" | "task" | "metric";
  refId?: string;
  label: string;
  status: "healthy" | "warning" | "blocked" | "active" | "offline";
  position?: { x: number; y: number; z?: number };
  visualTheme?: string;
};

type WorldEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  kind: "reports_to" | "works_on" | "depends_on" | "communicates_with" | "belongs_to";
};
```
