export type WorldNodeKind =
  | "jarvis_hq"
  | "business_land"
  | "office"
  | "room"
  | "agent_desk"
  | "task_marker"
  | "metric_marker";

export type WorldNodeStatus = "healthy" | "warning" | "blocked" | "active" | "offline";

export type WorldNode = {
  id: string;
  kind: WorldNodeKind;
  refType?: "business" | "agent" | "task" | "metric";
  refId?: string;
  label: string;
  status: WorldNodeStatus;
  position?: { x: number; y: number; z?: number };
  visualTheme?: string;
  /** Reserved for future game-like UI; not rendered in MVP. */
  characterAvatarId?: string;
  characterPose?: string;
  characterEnabled?: boolean;
};

export type WorldEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  kind: "reports_to" | "works_on" | "depends_on" | "communicates_with" | "belongs_to";
};

export type WorldMap = {
  id: string;
  title: string;
  version: string;
  nodes: WorldNode[];
  edges: WorldEdge[];
  updatedAt: string;
};
