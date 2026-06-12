import type {
  ContinuousWorkPolicy,
  NextBestWorkDecision,
  WorkItem
} from "@realmos/contracts";
import { evaluateHumanOnlyGate } from "./human-gate";
import { makeWorkLoopId, nowIso } from "./id";

const PRIORITY_RANK: Record<WorkItem["priority"], number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1
};

function isBlocked(workItem: WorkItem, itemsById: Map<string, WorkItem>): boolean {
  const deps = workItem.dependencies ?? workItem.blockedBy ?? [];
  return deps.some((depId) => {
    const dep = itemsById.get(depId);
    return !dep || dep.status !== "done";
  });
}

function pickCandidate(items: WorkItem[]): WorkItem | undefined {
  const ready = items.filter(
    (item) =>
      (item.status === "ready" || item.status === "candidate") &&
      !isBlocked(item, new Map(items.map((entry) => [entry.id, entry])))
  );

  return ready.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])[0];
}

export function selectNextBestWork(
  items: WorkItem[],
  policy: ContinuousWorkPolicy
): NextBestWorkDecision {
  const timestamp = nowIso();
  const considered = items
    .filter((item) => item.status !== "done" && item.status !== "cancelled")
    .map((item) => item.id);

  const waitingReport = items.find((item) => item.status === "waiting_for_report");
  if (waitingReport) {
    return {
      id: makeWorkLoopId("decision"),
      selectedWorkItemId: waitingReport.id,
      decision: "wait_for_report",
      rationale: "Cursor completion report pending for in-flight work.",
      consideredWorkItemIds: considered,
      createdAt: timestamp
    };
  }

  const candidate = pickCandidate(items);
  if (!candidate) {
    return {
      id: makeWorkLoopId("decision"),
      decision: "blocked",
      rationale: "No ready work items available.",
      consideredWorkItemIds: considered,
      createdAt: timestamp
    };
  }

  const gate = evaluateHumanOnlyGate(candidate, policy);
  if (gate.outcome === "pause_for_user") {
    return {
      id: makeWorkLoopId("decision"),
      selectedWorkItemId: candidate.id,
      decision: "ask_user",
      rationale: gate.reason,
      consideredWorkItemIds: considered,
      createdAt: timestamp
    };
  }

  if (gate.outcome === "pause_for_approval") {
    return {
      id: makeWorkLoopId("decision"),
      selectedWorkItemId: candidate.id,
      decision: "request_approval",
      rationale: gate.reason,
      consideredWorkItemIds: considered,
      createdAt: timestamp
    };
  }

  return {
    id: makeWorkLoopId("decision"),
    selectedWorkItemId: candidate.id,
    decision: "continue",
    rationale: gate.reason,
    consideredWorkItemIds: considered,
    createdAt: timestamp
  };
}
