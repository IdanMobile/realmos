import type { FleetLane, WorkItem } from "@realmos/contracts";

export type FleetPlanWorkItem = {
  workItem: WorkItem;
  lane?: FleetLane;
  scopePaths?: string[];
  packagePaths?: string[];
};

const LANE_KEYWORDS: Array<{ lane: FleetLane; pattern: RegExp }> = [
  { lane: "frontend", pattern: /\b(ui|frontend|dashboard|web|react)\b/i },
  { lane: "backend", pattern: /\b(api|backend|database|postgres|route)\b/i },
  { lane: "qa", pattern: /\b(test|qa|verify|acceptance)\b/i },
  { lane: "docs", pattern: /\b(doc|readme|handoff|guide)\b/i },
  { lane: "governance", pattern: /\b(governance|approval|audit|policy)\b/i },
  { lane: "security", pattern: /\b(security|auth|secret)\b/i },
  { lane: "research", pattern: /\b(research|scout|model)\b/i },
  { lane: "optimization", pattern: /\b(optimize|cost|performance)\b/i },
  { lane: "operations", pattern: /\b(deploy|ops|infra)\b/i },
  { lane: "design", pattern: /\b(design|mockup|wireframe)\b/i }
];

export function assignFleetLane(input: FleetPlanWorkItem): FleetLane {
  if (input.lane) return input.lane;

  const text = `${input.workItem.title} ${input.workItem.taskId ?? ""}`;
  for (const entry of LANE_KEYWORDS) {
    if (entry.pattern.test(text)) return entry.lane;
  }

  if (input.workItem.executionMode === "human") return "governance";
  if (input.workItem.executionMode === "cursor") return "backend";

  return "planning";
}
