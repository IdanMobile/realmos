import type { Agent, Task } from "@realmos/contracts";
import type { WorkPacketLifecycle } from "@realmos/contracts";

export type NecromancerCandidateKind = "agent" | "task" | "work_packet";
export type NecromancerCandidateClassification = "stale" | "failed" | "orphaned" | "blocked";
export type NecromancerRiskLevel = "low" | "medium" | "high";
export type NecromancerRecommendedAction = "observe" | "pause" | "retire" | "protect" | "review";

export type NecromancerCandidate = {
  id: string;
  kind: NecromancerCandidateKind;
  entityId: string;
  classification: NecromancerCandidateClassification;
  riskLevel: NecromancerRiskLevel;
  title: string;
  currentStatus: string;
  realmId?: string;
  repositoryId?: string;
  businessId?: string;
  workItemId?: string;
  reason: string;
  protected: boolean;
  sideProjectBlocked: boolean;
  recommendedAction: NecromancerRecommendedAction;
};

const GUING_REALM_IDS = new Set(["realm_guing"]);
const SIDE_PROJECT_PATTERN = /guing|side.?project/i;
const DEFAULT_STALE_MS = 7 * 24 * 60 * 60 * 1000;

function candidateId(kind: NecromancerCandidateKind, entityId: string): string {
  return `${kind}:${entityId}`;
}

function parseIsoMs(value: string): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

export function isSideProjectScope(realmId?: string, repositoryId?: string): boolean {
  if (realmId && GUING_REALM_IDS.has(realmId)) return true;
  if (realmId && SIDE_PROJECT_PATTERN.test(realmId)) return true;
  if (repositoryId && SIDE_PROJECT_PATTERN.test(repositoryId)) return true;
  return false;
}

function ageMs(updatedAt: string, now: Date): number {
  return Math.max(0, now.getTime() - parseIsoMs(updatedAt));
}

function riskFromClassification(
  classification: NecromancerCandidateClassification,
  sideProjectBlocked: boolean
): NecromancerRiskLevel {
  if (sideProjectBlocked) return "high";
  if (classification === "failed") return "high";
  if (classification === "orphaned") return "medium";
  if (classification === "blocked") return "medium";
  return "low";
}

function recommendAction(input: {
  kind: NecromancerCandidateKind;
  classification: NecromancerCandidateClassification;
  sideProjectBlocked: boolean;
  protectedFlag: boolean;
}): NecromancerRecommendedAction {
  if (input.protectedFlag || input.sideProjectBlocked) return "protect";
  if (input.classification === "failed") {
    return input.kind === "agent" ? "retire" : "review";
  }
  if (input.classification === "orphaned") return "pause";
  if (input.classification === "stale") return "observe";
  return "review";
}

function scanAgents(
  agents: Agent[],
  businessIds: Set<string>,
  protectedIds: Set<string>,
  now: Date,
  staleAfterMs: number
): NecromancerCandidate[] {
  const results: NecromancerCandidate[] = [];

  for (const agent of agents) {
    if (agent.status === "retired") continue;

    const protectedFlag = protectedIds.has(candidateId("agent", agent.id));
    const sideProjectBlocked = isSideProjectScope(undefined, agent.businessId);
    let classification: NecromancerCandidateClassification | null = null;
    let reason = "";

    if (agent.scope === "business" && agent.businessId && !businessIds.has(agent.businessId)) {
      classification = "orphaned";
      reason = `Agent references missing business ${agent.businessId}.`;
    } else if (agent.status === "paused") {
      classification = "stale";
      reason = "Agent has been paused and may be inactive.";
    } else if ((agent.status === "testing" || agent.status === "draft") && ageMs(agent.updatedAt, now) > staleAfterMs) {
      classification = "stale";
      reason = `Agent remained in ${agent.status} beyond the stale threshold.`;
    }

    if (!classification) continue;

    results.push({
      id: candidateId("agent", agent.id),
      kind: "agent",
      entityId: agent.id,
      classification,
      riskLevel: riskFromClassification(classification, sideProjectBlocked),
      title: `${agent.name} (${agent.role})`,
      currentStatus: agent.status,
      businessId: agent.businessId,
      reason,
      protected: protectedFlag,
      sideProjectBlocked,
      recommendedAction: recommendAction({
        kind: "agent",
        classification,
        sideProjectBlocked,
        protectedFlag
      })
    });
  }

  return results;
}

function scanTasks(
  tasks: Task[],
  agentsById: Map<string, Agent>,
  protectedIds: Set<string>,
  now: Date,
  staleAfterMs: number
): NecromancerCandidate[] {
  const results: NecromancerCandidate[] = [];

  for (const task of tasks) {
    if (task.status === "done" || task.status === "cancelled") continue;

    const protectedFlag = protectedIds.has(candidateId("task", task.id));
    const sideProjectBlocked = isSideProjectScope(undefined, task.businessId);
    let classification: NecromancerCandidateClassification | null = null;
    let reason = "";

    if (task.status === "blocked") {
      classification = "failed";
      reason = "Task is blocked.";
    } else if (task.assignedAgentId) {
      const agent = agentsById.get(task.assignedAgentId);
      if (!agent) {
        classification = "orphaned";
        reason = `Task assigned to missing agent ${task.assignedAgentId}.`;
      } else if (agent.status === "retired" || agent.status === "paused") {
        classification = "orphaned";
        reason = `Task assigned to ${agent.status} agent ${agent.name}.`;
      }
    }

    if (!classification && task.status === "running" && ageMs(task.updatedAt, now) > staleAfterMs) {
      classification = "stale";
      reason = "Task has been running beyond the stale threshold.";
    }

    if (!classification) continue;

    results.push({
      id: candidateId("task", task.id),
      kind: "task",
      entityId: task.id,
      classification,
      riskLevel: riskFromClassification(classification, sideProjectBlocked),
      title: task.title,
      currentStatus: task.status,
      businessId: task.businessId,
      workItemId: task.id,
      reason,
      protected: protectedFlag,
      sideProjectBlocked,
      recommendedAction: recommendAction({
        kind: "task",
        classification,
        sideProjectBlocked,
        protectedFlag
      })
    });
  }

  return results;
}

function scanWorkPackets(
  workPackets: WorkPacketLifecycle[],
  protectedIds: Set<string>,
  now: Date,
  staleAfterMs: number
): NecromancerCandidate[] {
  const results: NecromancerCandidate[] = [];

  for (const packet of workPackets) {
    if (["completed", "cancelled", "verified"].includes(packet.status)) continue;

    const protectedFlag = protectedIds.has(candidateId("work_packet", packet.id));
    const sideProjectBlocked = isSideProjectScope(packet.realmId, packet.repositoryId);
    let classification: NecromancerCandidateClassification | null = null;
    let reason = "";

    if (packet.status === "failed") {
      classification = "failed";
      reason = "Work packet lifecycle failed.";
    } else if (packet.status === "blocked") {
      classification = "blocked";
      reason = "Work packet lifecycle is blocked.";
    } else if (
      ["awaiting_result", "verification_pending", "in_progress", "dispatched"].includes(packet.status) &&
      ageMs(packet.updatedAt, now) > staleAfterMs
    ) {
      classification = "stale";
      reason = `Work packet remained in ${packet.status} beyond the stale threshold.`;
    }

    if (!classification) continue;

    results.push({
      id: candidateId("work_packet", packet.id),
      kind: "work_packet",
      entityId: packet.id,
      classification,
      riskLevel: riskFromClassification(classification, sideProjectBlocked),
      title: packet.objective.slice(0, 80),
      currentStatus: packet.status,
      realmId: packet.realmId,
      repositoryId: packet.repositoryId,
      workItemId: packet.sourceWorkItemId,
      reason,
      protected: protectedFlag,
      sideProjectBlocked,
      recommendedAction: recommendAction({
        kind: "work_packet",
        classification,
        sideProjectBlocked,
        protectedFlag
      })
    });
  }

  return results;
}

export function detectNecromancerCandidates(input: {
  agents: Agent[];
  tasks: Task[];
  workPackets: WorkPacketLifecycle[];
  protectedIds?: Iterable<string>;
  now?: Date;
  staleAfterMs?: number;
}): NecromancerCandidate[] {
  const now = input.now ?? new Date();
  const staleAfterMs = input.staleAfterMs ?? DEFAULT_STALE_MS;
  const protectedIds = new Set(input.protectedIds ?? []);
  const businessIds = new Set(input.agents.map((agent) => agent.businessId).filter(Boolean) as string[]);
  const agentsById = new Map(input.agents.map((agent) => [agent.id, agent]));

  return [
    ...scanAgents(input.agents, businessIds, protectedIds, now, staleAfterMs),
    ...scanTasks(input.tasks, agentsById, protectedIds, now, staleAfterMs),
    ...scanWorkPackets(input.workPackets, protectedIds, now, staleAfterMs)
  ].sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel] || a.title.localeCompare(b.title);
  });
}

export function findNecromancerCandidate(
  candidates: NecromancerCandidate[],
  candidateIdValue: string
): NecromancerCandidate | undefined {
  return candidates.find((candidate) => candidate.id === candidateIdValue);
}
