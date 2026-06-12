import type {
  LocalExecutorDispatchInput,
  WorkPacketExecutorResultRecord,
  WorkPacketLifecycle,
  WorkPacketLifecycleAuditEvent,
  WorkPacketLifecycleCloseInput,
  WorkPacketLifecycleInput,
  WorkPacketLifecycleStatus,
  WorkPacketVerificationRecord
} from "@realmos/contracts";
import { makeWorkLoopId, nowIso } from "./id";

const SIDE_PROJECT_REALM_PATTERN = /guing/i;
const SECRET_PATTERN =
  /(?:api[_-]?key|secret|password|token|private[_-]?key|service[_-]?account)\s*[:=]\s*\S+/i;
const PRODUCTION_DEPLOY_PATTERN =
  /\b(firebase deploy|npm publish|pnpm publish|vercel deploy|netlify deploy|kubectl apply|terraform apply|gcloud run deploy)\b/i;

export type WorkPacketLifecycleValidationError = {
  field: string;
  message: string;
};

const TERMINAL_STATUSES: WorkPacketLifecycleStatus[] = [
  "completed",
  "failed",
  "blocked",
  "cancelled"
];

const VALID_TRANSITIONS: Record<WorkPacketLifecycleStatus, WorkPacketLifecycleStatus[]> = {
  draft: ["ready_for_approval", "cancelled"],
  ready_for_approval: ["approved", "draft", "blocked", "cancelled"],
  approved: ["dispatched", "blocked", "cancelled"],
  dispatched: ["in_progress", "awaiting_result", "blocked", "cancelled"],
  in_progress: ["awaiting_result", "blocked", "cancelled"],
  awaiting_result: ["verification_pending", "failed", "blocked", "cancelled"],
  verification_pending: ["verified", "failed", "blocked"],
  verified: ["completed", "failed", "blocked"],
  completed: [],
  failed: [],
  blocked: ["draft", "cancelled"],
  cancelled: []
};

function appendAuditEvent(
  packet: WorkPacketLifecycle,
  eventType: string,
  summary: string,
  payload?: Record<string, unknown>
): WorkPacketLifecycleAuditEvent[] {
  return [
    ...packet.auditEvents,
    {
      eventType,
      timestamp: nowIso(),
      summary,
      payload
    }
  ];
}

function touch(packet: WorkPacketLifecycle, patch: Partial<WorkPacketLifecycle>): WorkPacketLifecycle {
  return {
    ...packet,
    ...patch,
    updatedAt: nowIso()
  };
}

export function validateWorkPacketLifecycleInput(
  input: WorkPacketLifecycleInput
): WorkPacketLifecycleValidationError[] {
  const errors: WorkPacketLifecycleValidationError[] = [];

  if (!input.realmId?.trim()) {
    errors.push({ field: "realmId", message: "realmId is required." });
  } else if (SIDE_PROJECT_REALM_PATTERN.test(input.realmId)) {
    errors.push({
      field: "realmId",
      message: "GUING and side-project realms are blocked until RealmOS self-management milestone."
    });
  }

  if (!input.repositoryId?.trim()) {
    errors.push({ field: "repositoryId", message: "repositoryId is required." });
  }

  if (!input.objective?.trim()) {
    errors.push({ field: "objective", message: "objective is required." });
  }

  if (!input.instructions?.trim()) {
    errors.push({ field: "instructions", message: "instructions is required." });
  } else if (SECRET_PATTERN.test(input.instructions)) {
    errors.push({
      field: "instructions",
      message: "instructions must not contain secret-like assignments."
    });
  }

  if (!input.allowedPaths?.length) {
    errors.push({ field: "allowedPaths", message: "allowedPaths must include at least one path." });
  }

  if (!input.forbiddenPaths?.length) {
    errors.push({ field: "forbiddenPaths", message: "forbiddenPaths must include at least one path." });
  }

  if (!input.verificationCommands?.length) {
    errors.push({
      field: "verificationCommands",
      message: "verificationCommands must include at least one command."
    });
  }

  for (const command of input.verificationCommands ?? []) {
    if (PRODUCTION_DEPLOY_PATTERN.test(command)) {
      errors.push({
        field: "verificationCommands",
        message: `verification command "${command}" looks like a production deployment command and is blocked.`
      });
    }
  }

  for (const allowed of input.allowedPaths ?? []) {
    for (const forbidden of input.forbiddenPaths ?? []) {
      if (allowed === forbidden || allowed.startsWith(`${forbidden}/`)) {
        errors.push({
          field: "allowedPaths",
          message: `allowed path "${allowed}" conflicts with forbidden path "${forbidden}".`
        });
      }
    }
  }

  return errors;
}

export function validateWorkPacketLifecycleReadiness(
  packet: WorkPacketLifecycle
): WorkPacketLifecycleValidationError[] {
  const errors = validateWorkPacketLifecycleInput({
    sourceWorkItemId: packet.sourceWorkItemId,
    realmId: packet.realmId,
    repositoryId: packet.repositoryId,
    branchTarget: packet.branchTarget,
    worktreeTarget: packet.worktreeTarget,
    allowedPaths: packet.allowedPaths,
    forbiddenPaths: packet.forbiddenPaths,
    objective: packet.objective,
    instructions: packet.instructions,
    verificationCommands: packet.verificationCommands,
    expectedArtifacts: packet.expectedArtifacts,
    approvalRequired: packet.approvalRequired,
    handoffRequired: packet.handoffRequired
  });

  if (!packet.expectedArtifacts.length) {
    errors.push({
      field: "expectedArtifacts",
      message: "expectedArtifacts must include at least one artifact before readiness."
    });
  }

  return errors;
}

export function buildWorkPacketLifecycle(
  input: WorkPacketLifecycleInput,
  id: string = makeWorkLoopId("wpl")
): WorkPacketLifecycle {
  const timestamp = nowIso();
  const packetId = id;

  return {
    id,
    packetId,
    sourceWorkItemId: input.sourceWorkItemId?.trim() || undefined,
    realmId: input.realmId.trim(),
    repositoryId: input.repositoryId.trim(),
    branchTarget: input.branchTarget?.trim() || undefined,
    worktreeTarget: input.worktreeTarget?.trim() || undefined,
    allowedPaths: [...input.allowedPaths],
    forbiddenPaths: [...input.forbiddenPaths],
    objective: input.objective.trim(),
    instructions: input.instructions.trim(),
    verificationCommands: [...input.verificationCommands],
    expectedArtifacts: input.expectedArtifacts?.length ? [...input.expectedArtifacts] : [],
    approvalRequired: input.approvalRequired ?? true,
    verificationStatus: "pending",
    handoffRequired: input.handoffRequired ?? false,
    handoffUpdated: false,
    status: "draft",
    auditEvents: [
      {
        eventType: "packet_created",
        timestamp,
        summary: `Work packet lifecycle draft created: ${packetId}`
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function canTransitionWorkPacketLifecycle(
  packet: WorkPacketLifecycle,
  nextStatus: WorkPacketLifecycleStatus
): { allowed: boolean; reason?: string } {
  if (packet.status === nextStatus) {
    return { allowed: true };
  }

  if (TERMINAL_STATUSES.includes(packet.status)) {
    return { allowed: false, reason: `Cannot transition from terminal status ${packet.status}.` };
  }

  const allowed = VALID_TRANSITIONS[packet.status];
  if (!allowed.includes(nextStatus)) {
    return {
      allowed: false,
      reason: `Invalid transition from ${packet.status} to ${nextStatus}.`
    };
  }

  return { allowed: true };
}

export function markWorkPacketReadyForApproval(packet: WorkPacketLifecycle): {
  packet: WorkPacketLifecycle;
  errors: WorkPacketLifecycleValidationError[];
} {
  const errors = validateWorkPacketLifecycleReadiness(packet);
  if (errors.length) {
    return { packet, errors };
  }

  const gate = canTransitionWorkPacketLifecycle(packet, "ready_for_approval");
  if (!gate.allowed) {
    return {
      packet,
      errors: [{ field: "status", message: gate.reason ?? "Transition not allowed." }]
    };
  }

  return {
    packet: touch(packet, {
      status: "ready_for_approval",
      auditEvents: appendAuditEvent(packet, "ready_for_approval", "Packet marked ready for approval.")
    }),
    errors: []
  };
}

export function approveWorkPacketLifecycle(
  packet: WorkPacketLifecycle,
  approvedBy: string = "operator"
): { packet: WorkPacketLifecycle; errors: WorkPacketLifecycleValidationError[] } {
  if (packet.status !== "ready_for_approval") {
    return {
      packet,
      errors: [{ field: "status", message: "Only ready_for_approval packets can be approved." }]
    };
  }

  const timestamp = nowIso();
  return {
    packet: touch(packet, {
      status: "approved",
      approvedBy,
      approvedAt: timestamp,
      auditEvents: appendAuditEvent(packet, "approved", `Packet approved by ${approvedBy}.`, {
        approvedBy
      })
    }),
    errors: []
  };
}

export function buildExecutorDispatchInputFromLifecycle(
  packet: WorkPacketLifecycle
): LocalExecutorDispatchInput {
  return {
    realmId: packet.realmId,
    repositoryId: packet.repositoryId,
    workPacketId: packet.packetId,
    branchTarget: packet.branchTarget,
    worktreeTarget: packet.worktreeTarget,
    allowedPaths: [...packet.allowedPaths],
    forbiddenPaths: [...packet.forbiddenPaths],
    taskSummary: packet.objective,
    prompt: [
      `# ${packet.objective}`,
      "",
      "## Instructions",
      packet.instructions,
      "",
      "## Expected artifacts",
      ...packet.expectedArtifacts.map((artifact) => `- ${artifact}`),
      "",
      "## Safety",
      "- Dry-run queue only — no automatic shell execution.",
      "- Do not start GUING or side projects.",
      "- Stop for human-only actions, secrets, or production deployment."
    ].join("\n"),
    verificationCommands: [...packet.verificationCommands],
    stopConditions: [
      "Do not start GUING or side projects.",
      "Do not commit secrets or `.env`.",
      "Stop for human-only actions."
    ],
    requiresApproval: packet.approvalRequired
  };
}

export function markWorkPacketDispatched(
  packet: WorkPacketLifecycle,
  dispatchId: string
): WorkPacketLifecycle {
  return touch(packet, {
    status: "awaiting_result",
    dispatchId,
    auditEvents: appendAuditEvent(
      packet,
      "dispatched",
      `Packet dispatched via executor bridge: ${dispatchId}.`,
      { dispatchId }
    )
  });
}

export function recordWorkPacketExecutorResult(
  packet: WorkPacketLifecycle,
  input: {
    status: "completed" | "failed" | "running" | "blocked";
    resultSummary?: string;
    errorMessage?: string;
  },
  resultId: string = makeWorkLoopId("wpl_result")
): { packet: WorkPacketLifecycle; errors: WorkPacketLifecycleValidationError[] } {
  const allowedStatuses: WorkPacketLifecycleStatus[] = [
    "dispatched",
    "in_progress",
    "awaiting_result"
  ];
  if (!allowedStatuses.includes(packet.status)) {
    return {
      packet,
      errors: [
        {
          field: "status",
          message: `Cannot record executor result from status ${packet.status}.`
        }
      ]
    };
  }

  if (input.resultSummary && SECRET_PATTERN.test(input.resultSummary)) {
    return {
      packet,
      errors: [{ field: "resultSummary", message: "resultSummary must not contain secret-like content." }]
    };
  }

  const result: WorkPacketExecutorResultRecord = {
    id: resultId,
    status: input.status,
    resultSummary: input.resultSummary?.trim(),
    errorMessage: input.errorMessage?.trim(),
    recordedAt: nowIso()
  };

  let nextStatus: WorkPacketLifecycleStatus;
  let verificationStatus = packet.verificationStatus;

  switch (input.status) {
    case "running":
      nextStatus = "in_progress";
      break;
    case "completed":
      nextStatus = "verification_pending";
      verificationStatus = "pending";
      break;
    case "failed":
      nextStatus = "failed";
      verificationStatus = "fail";
      break;
    case "blocked":
      nextStatus = "blocked";
      verificationStatus = "blocked";
      break;
  }

  return {
    packet: touch(packet, {
      status: nextStatus,
      resultId,
      executorResult: result,
      verificationStatus,
      auditEvents: appendAuditEvent(
        packet,
        "executor_result_recorded",
        `Executor result recorded: ${input.status}.`,
        { resultId, status: input.status }
      )
    }),
    errors: []
  };
}

export function attachWorkPacketVerification(
  packet: WorkPacketLifecycle,
  input: {
    reportedStatus: "pass" | "fail" | "blocked";
    outputSummary: string;
    artifactsSummary: string;
    blockReason?: string;
  },
  verificationId: string = makeWorkLoopId("wpl_verify")
): { packet: WorkPacketLifecycle; errors: WorkPacketLifecycleValidationError[] } {
  if (packet.status !== "verification_pending") {
    return {
      packet,
      errors: [
        {
          field: "status",
          message: "Verification can only be attached when status is verification_pending."
        }
      ]
    };
  }

  const verification: WorkPacketVerificationRecord = {
    id: verificationId,
    expectedCommands: [...packet.verificationCommands],
    reportedStatus: input.reportedStatus,
    outputSummary: input.outputSummary.trim(),
    artifactsSummary: input.artifactsSummary.trim(),
    blockReason: input.blockReason?.trim(),
    recordedAt: nowIso()
  };

  const nextStatus: WorkPacketLifecycleStatus =
    input.reportedStatus === "pass" ? "verified" : input.reportedStatus === "fail" ? "failed" : "blocked";

  return {
    packet: touch(packet, {
      status: nextStatus,
      verification,
      verificationStatus: input.reportedStatus,
      auditEvents: appendAuditEvent(
        packet,
        "verification_attached",
        `Verification recorded: ${input.reportedStatus}.`,
        { verificationId, reportedStatus: input.reportedStatus }
      )
    }),
    errors: []
  };
}

export function closeWorkPacketLifecycle(
  packet: WorkPacketLifecycle,
  input: WorkPacketLifecycleCloseInput
): { packet: WorkPacketLifecycle; errors: WorkPacketLifecycleValidationError[] } {
  const closableFrom: WorkPacketLifecycleStatus[] = [
    "verified",
    "verification_pending",
    "awaiting_result",
    "approved",
    "ready_for_approval",
    "draft",
    "blocked",
    "in_progress",
    "dispatched"
  ];

  if (!closableFrom.includes(packet.status) && !TERMINAL_STATUSES.includes(packet.status)) {
    return {
      packet,
      errors: [{ field: "status", message: `Cannot close packet from status ${packet.status}.` }]
    };
  }

  if (TERMINAL_STATUSES.includes(packet.status)) {
    return { packet, errors: [] };
  }

  if (input.status === "cancelled") {
    return {
      packet: touch(packet, {
        status: "cancelled",
        handoffUpdated: input.handoffUpdated ?? packet.handoffUpdated,
        auditEvents: appendAuditEvent(
          packet,
          "closed",
          `Packet cancelled.${input.reason ? ` Reason: ${input.reason}` : ""}`,
          { status: "cancelled", reason: input.reason }
        )
      }),
      errors: []
    };
  }

  const gate = canTransitionWorkPacketLifecycle(packet, input.status);
  if (!gate.allowed) {
    const forcedTerminal = input.status === "failed" || input.status === "blocked";
    if (!forcedTerminal) {
      return {
        packet,
        errors: [{ field: "status", message: gate.reason ?? "Close transition not allowed." }]
      };
    }
  }

  if (input.status === "completed" && packet.status !== "verified") {
    return {
      packet,
      errors: [{ field: "status", message: "Only verified packets can be closed as completed." }]
    };
  }

  return {
    packet: touch(packet, {
      status: input.status,
      handoffUpdated: input.handoffUpdated ?? packet.handoffUpdated,
      auditEvents: appendAuditEvent(
        packet,
        "closed",
        `Packet closed as ${input.status}.${input.reason ? ` Reason: ${input.reason}` : ""}`,
        { status: input.status, reason: input.reason }
      )
    }),
    errors: []
  };
}

export function summarizeWorkPacketLifecycle(packets: WorkPacketLifecycle[]): {
  totalCount: number;
  countsByStatus: Record<WorkPacketLifecycleStatus, number>;
  approvalNeededCount: number;
  dispatchedCount: number;
  awaitingResultCount: number;
  verificationPendingCount: number;
  latestPacket: WorkPacketLifecycle | null;
} {
  const countsByStatus = {} as Record<WorkPacketLifecycleStatus, number>;
  for (const status of [
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
  ] as WorkPacketLifecycleStatus[]) {
    countsByStatus[status] = packets.filter((packet) => packet.status === status).length;
  }

  const sorted = [...packets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return {
    totalCount: packets.length,
    countsByStatus,
    approvalNeededCount: countsByStatus.ready_for_approval,
    dispatchedCount: countsByStatus.dispatched + countsByStatus.in_progress,
    awaitingResultCount: countsByStatus.awaiting_result,
    verificationPendingCount: countsByStatus.verification_pending,
    latestPacket: sorted[0] ?? null
  };
}
