import type { WorkPacketLifecycle, WorkPacketLifecycleStatus } from "@realmos/contracts";

export type LifecycleSummary = {
  totalCount: number;
  countsByStatus: Record<WorkPacketLifecycleStatus, number>;
  approvalNeededCount: number;
  awaitingResultCount: number;
  verificationPendingCount: number;
  latestPacket: WorkPacketLifecycle | null;
};

export const LIFECYCLE_SAFETY_FLAGS = {
  mode: "dry_run" as const,
  shellExecution: false,
  automaticExecution: false,
  cursorCliInvoked: false,
  humanApprovalRequired: true,
  guingBlocked: true
};

export function summarizeLifecyclePackets(packets: WorkPacketLifecycle[]): LifecycleSummary {
  const statuses: WorkPacketLifecycleStatus[] = [
    "draft",
    "ready_for_approval",
    "approved",
    "dispatched",
    "in_progress",
    "awaiting_result",
    "verification_pending",
    "verified",
    "completed",
    "failed",
    "blocked",
    "cancelled"
  ];

  const countsByStatus = {} as Record<WorkPacketLifecycleStatus, number>;
  for (const status of statuses) {
    countsByStatus[status] = packets.filter((packet) => packet.status === status).length;
  }

  const sorted = [...packets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return {
    totalCount: packets.length,
    countsByStatus,
    approvalNeededCount: countsByStatus.ready_for_approval,
    awaitingResultCount: countsByStatus.awaiting_result,
    verificationPendingCount: countsByStatus.verification_pending,
    latestPacket: sorted[0] ?? null
  };
}

export function filterMonitorPackets(packets: WorkPacketLifecycle[]): {
  awaitingApproval: WorkPacketLifecycle[];
  awaitingResult: WorkPacketLifecycle[];
  verificationPending: WorkPacketLifecycle[];
  queuedOrDispatched: WorkPacketLifecycle[];
} {
  return {
    awaitingApproval: packets.filter((packet) => packet.status === "ready_for_approval"),
    awaitingResult: packets.filter((packet) =>
      ["awaiting_result", "dispatched", "in_progress"].includes(packet.status)
    ),
    verificationPending: packets.filter((packet) => packet.status === "verification_pending"),
    queuedOrDispatched: packets.filter((packet) =>
      ["approved", "dispatched", "in_progress", "awaiting_result"].includes(packet.status)
    )
  };
}

export type LifecycleActionKey =
  | "markReady"
  | "approve"
  | "dispatch"
  | "recordResult"
  | "attachVerification"
  | "closeCompleted"
  | "closeFailed"
  | "closeBlocked"
  | "closeCancelled";

export function availableLifecycleActions(status: WorkPacketLifecycleStatus): LifecycleActionKey[] {
  switch (status) {
    case "draft":
      return ["markReady", "closeCancelled"];
    case "ready_for_approval":
      return ["approve", "closeCancelled"];
    case "approved":
      return ["dispatch", "closeCancelled"];
    case "dispatched":
    case "in_progress":
    case "awaiting_result":
      return ["recordResult", "closeCancelled"];
    case "verification_pending":
      return ["attachVerification", "closeFailed", "closeBlocked", "closeCancelled"];
    case "verified":
      return ["closeCompleted", "closeFailed", "closeBlocked"];
    case "blocked":
      return ["closeCancelled"];
    default:
      return [];
  }
}

export function formatLifecycleError(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
