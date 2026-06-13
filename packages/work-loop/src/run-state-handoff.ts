import type {
  HandoffSummaryObject,
  NextChatPromptObject,
  RealmOSRunState,
  RunStateHandoffAuditEvent,
  RunStateHandoffInput,
  RunStateResultStatus,
  WorkPacketLifecycle,
  WorkPacketLifecycleStatus
} from "@realmos/contracts";
import { makeWorkLoopId, nowIso } from "./id";

const SECRET_PATTERN =
  /(?:api[_-]?key|secret|password|token|private[_-]?key|service[_-]?account)\s*[:=]\s*\S+/i;
const BLOCKED_NEXT_INITIATIVE_PATTERN = /guing|side.?project|sync.?agent/i;

export const DEFAULT_NEXT_INITIATIVE = "0.32 — Necromancer Verification / Operator UI Hardening";

export type RunStateValidationError = {
  field: string;
  message: string;
};

function appendAudit(
  state: RealmOSRunState,
  eventType: string,
  summary: string,
  payload?: Record<string, unknown>
): RunStateHandoffAuditEvent[] {
  return [
    ...state.auditEvents,
    { eventType, timestamp: nowIso(), summary, payload }
  ];
}

function touch(state: RealmOSRunState, patch: Partial<RealmOSRunState>): RealmOSRunState {
  return { ...state, ...patch, updatedAt: nowIso() };
}

export function validateRunStateTextContent(
  text: string,
  field: string
): RunStateValidationError[] {
  const errors: RunStateValidationError[] = [];
  if (SECRET_PATTERN.test(text)) {
    errors.push({ field, message: `${field} must not contain secret-like assignments.` });
  }
  return errors;
}

export function validateNextRecommendedInitiative(initiative: string): RunStateValidationError[] {
  if (BLOCKED_NEXT_INITIATIVE_PATTERN.test(initiative)) {
    return [
      {
        field: "nextRecommendedInitiative",
        message: "GUING and side-project initiatives are blocked until RealmOS self-management milestone."
      }
    ];
  }
  return [];
}

function mapResultStatus(packet: WorkPacketLifecycle): RunStateResultStatus {
  if (!packet.executorResult) return "pending";
  switch (packet.executorResult.status) {
    case "running":
      return "running";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "blocked":
      return "blocked";
  }
}

function inferNextInitiative(packet: WorkPacketLifecycle): string {
  if (packet.status === "completed" && packet.verificationStatus === "pass") {
    return DEFAULT_NEXT_INITIATIVE;
  }
  if (packet.status === "failed" || packet.status === "blocked") {
    return "0.28 — Dogfood RealmOS Managing One Real RealmOS Task (remediation)";
  }
  if (packet.handoffRequired && !packet.handoffUpdated) {
    return "0.28 — Dogfood RealmOS Managing One Real RealmOS Task";
  }
  return DEFAULT_NEXT_INITIATIVE;
}

function buildSafetySummary(): string {
  return [
    "Dry-run executor bridge only — no shell execution.",
    "Cursor CLI not invoked.",
    "Human approval required before dispatch.",
    "GUING and side projects blocked."
  ].join(" ");
}

function buildHandoffText(packet: WorkPacketLifecycle, state: RealmOSRunState): string {
  return [
    `# RealmOS Run State Handoff`,
    "",
    `Initiative: ${state.initiativeId}`,
    `Packet: ${packet.id} (${packet.status})`,
    packet.dispatchId ? `Dispatch: ${packet.dispatchId}` : null,
    `Realm/Repo: ${packet.realmId} / ${packet.repositoryId}`,
    "",
    "## Objective",
    packet.objective,
    "",
    "## Result",
    packet.executorResult?.resultSummary ?? "(no result recorded yet)",
    "",
    "## Verification",
    packet.verification
      ? `${packet.verification.reportedStatus}: ${packet.verification.outputSummary}`
      : `(verification ${packet.verificationStatus})`,
    "",
    "## Next recommended initiative",
    state.nextRecommendedInitiative,
    "",
    "## Safety",
    state.safetySummary
  ]
    .filter(Boolean)
    .join("\n");
}

function buildNewChatPrompt(packet: WorkPacketLifecycle, state: RealmOSRunState): string {
  return [
    "Read CURSOR_SSOT.md and follow it exactly.",
    "",
    "Then read:",
    "1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md",
    "2. PROJECT_STATE.md",
    "",
    `## Resume context (${new Date().toISOString().slice(0, 10)})`,
    "",
    `Continue from run state ${state.id} (packet ${packet.id}).`,
    `Lifecycle status: ${packet.status}. Verification: ${packet.verificationStatus}.`,
    "",
    `Next recommended initiative: ${state.nextRecommendedInitiative}`,
    "",
    "Do not start GUING, side projects, or autonomous execution.",
    "",
    "```bash",
    "pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start",
    "```"
  ].join("\n");
}

export function buildRunStateFromWorkPacket(
  packet: WorkPacketLifecycle,
  input: RunStateHandoffInput = {},
  id: string = makeWorkLoopId("run_state")
): { state: RealmOSRunState; errors: RunStateValidationError[] } {
  const timestamp = nowIso();
  const nextRecommendedInitiative = inferNextInitiative(packet);
  const errors = validateNextRecommendedInitiative(nextRecommendedInitiative);

  const state: RealmOSRunState = {
    id,
    sourcePacketId: packet.id,
    sourceDispatchId: packet.dispatchId,
    realmId: packet.realmId,
    repositoryId: packet.repositoryId,
    initiativeId: input.initiativeId?.trim() || "0.28",
    taskLabel: input.taskLabel?.trim() || packet.objective,
    lifecycleStatus: packet.status,
    resultStatus: mapResultStatus(packet),
    verificationStatus: packet.verificationStatus,
    commandsExpected: [...packet.verificationCommands],
    commandsReported: packet.verification?.expectedCommands ?? [],
    changedFilesSummary: packet.expectedArtifacts.join(", ") || "(none recorded)",
    artifactsSummary: packet.verification?.artifactsSummary ?? packet.expectedArtifacts.join(", "),
    safetySummary: buildSafetySummary(),
    knownRisks: packet.status === "blocked" ? ["Packet blocked — operator review required."] : [],
    blockedReasons:
      packet.status === "blocked"
        ? [packet.executorResult?.errorMessage ?? "Lifecycle blocked."]
        : packet.verification?.blockReason
          ? [packet.verification.blockReason]
          : [],
    nextRecommendedInitiative,
    handoffTextSummary: "",
    newChatPromptText: undefined,
    handoffRequired: input.handoffRequired ?? packet.handoffRequired,
    handoffUpdated: packet.handoffUpdated,
    auditEvents: [
      {
        eventType: "run_state_created",
        timestamp,
        summary: `Run state created from packet ${packet.id}.`
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  state.handoffTextSummary = buildHandoffText(packet, state);
  state.newChatPromptText = buildNewChatPrompt(packet, state);

  const textErrors = [
    ...validateRunStateTextContent(state.handoffTextSummary, "handoffTextSummary"),
    ...validateRunStateTextContent(state.newChatPromptText ?? "", "newChatPromptText")
  ];

  return { state, errors: [...errors, ...textErrors] };
}

export function updateRunStateFromWorkPacket(
  state: RealmOSRunState,
  packet: WorkPacketLifecycle
): { state: RealmOSRunState; errors: RunStateValidationError[] } {
  const nextRecommendedInitiative = inferNextInitiative(packet);
  const errors = validateNextRecommendedInitiative(nextRecommendedInitiative);

  let resultStatus = mapResultStatus(packet);
  const knownRisks = [...state.knownRisks];
  const blockedReasons = [...state.blockedReasons];

  if (packet.status === "failed") {
    knownRisks.push("Executor result reported failure.");
  }
  if (packet.verificationStatus === "fail") {
    knownRisks.push("Verification reported fail.");
  }

  const updated = touch(state, {
    sourceDispatchId: packet.dispatchId ?? state.sourceDispatchId,
    lifecycleStatus: packet.status,
    resultStatus,
    verificationStatus: packet.verificationStatus,
    commandsExpected: [...packet.verificationCommands],
    commandsReported: packet.verification
      ? [...packet.verification.expectedCommands]
      : state.commandsReported,
    changedFilesSummary: packet.expectedArtifacts.join(", ") || state.changedFilesSummary,
    artifactsSummary: packet.verification?.artifactsSummary ?? state.artifactsSummary,
    knownRisks: [...new Set(knownRisks)],
    blockedReasons:
      blockedReasons.length > 0
        ? blockedReasons
        : packet.verification?.blockReason
          ? [packet.verification.blockReason]
          : packet.executorResult?.errorMessage
            ? [packet.executorResult.errorMessage]
            : [],
    nextRecommendedInitiative,
    handoffRequired: packet.handoffRequired || state.handoffRequired,
    handoffUpdated: packet.handoffUpdated,
    auditEvents: appendAudit(state, "run_state_synced", `Synced from packet ${packet.id}.`, {
      lifecycleStatus: packet.status
    })
  });

  updated.handoffTextSummary = buildHandoffText(packet, updated);
  updated.newChatPromptText = buildNewChatPrompt(packet, updated);

  const textErrors = [
    ...validateRunStateTextContent(updated.handoffTextSummary, "handoffTextSummary"),
    ...validateRunStateTextContent(updated.newChatPromptText ?? "", "newChatPromptText")
  ];

  return { state: updated, errors: [...errors, ...textErrors] };
}

export function updateRunStateFromExecutorResult(
  state: RealmOSRunState,
  packet: WorkPacketLifecycle
): ReturnType<typeof updateRunStateFromWorkPacket> {
  return updateRunStateFromWorkPacket(state, packet);
}

export function updateRunStateFromVerification(
  state: RealmOSRunState,
  packet: WorkPacketLifecycle
): ReturnType<typeof updateRunStateFromWorkPacket> {
  const base = updateRunStateFromWorkPacket(state, packet);
  if (packet.verificationStatus === "pass" && packet.status === "verified") {
    base.state = touch(base.state, {
      handoffRequired: true,
      auditEvents: appendAudit(
        base.state,
        "verification_recorded",
        "Verification pass — handoff required.",
        { verificationStatus: packet.verificationStatus }
      )
    });
  }
  return base;
}

export function markRunStateHandoffRequired(state: RealmOSRunState): RealmOSRunState {
  return touch(state, {
    handoffRequired: true,
    auditEvents: appendAudit(state, "handoff_required", "Handoff marked required.")
  });
}

export function markRunStateHandoffUpdated(state: RealmOSRunState): RealmOSRunState {
  return touch(state, {
    handoffRequired: false,
    handoffUpdated: true,
    auditEvents: appendAudit(state, "handoff_updated", "Handoff marked updated.")
  });
}

export function buildHandoffSummaryObject(state: RealmOSRunState): HandoffSummaryObject {
  return {
    runStateId: state.id,
    sourcePacketId: state.sourcePacketId,
    sourceDispatchId: state.sourceDispatchId,
    initiativeId: state.initiativeId,
    lifecycleStatus: state.lifecycleStatus,
    resultStatus: state.resultStatus,
    verificationStatus: state.verificationStatus,
    handoffTextSummary: state.handoffTextSummary,
    knownRisks: [...state.knownRisks],
    blockedReasons: [...state.blockedReasons],
    nextRecommendedInitiative: state.nextRecommendedInitiative,
    handoffRequired: state.handoffRequired,
    handoffUpdated: state.handoffUpdated,
    updatedAt: state.updatedAt
  };
}

export function buildNextChatPromptObject(state: RealmOSRunState): NextChatPromptObject {
  return {
    runStateId: state.id,
    sourcePacketId: state.sourcePacketId,
    initiativeId: state.initiativeId,
    promptText: state.newChatPromptText ?? "",
    nextRecommendedInitiative: state.nextRecommendedInitiative,
    updatedAt: state.updatedAt
  };
}

export function summarizeRunStates(states: RealmOSRunState[]): {
  totalCount: number;
  handoffRequiredCount: number;
  handoffUpdatedCount: number;
  latestRunState: RealmOSRunState | null;
  latestHandoffSummary: HandoffSummaryObject | null;
} {
  const sorted = [...states].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const latest = sorted[0] ?? null;
  return {
    totalCount: states.length,
    handoffRequiredCount: states.filter((s) => s.handoffRequired && !s.handoffUpdated).length,
    handoffUpdatedCount: states.filter((s) => s.handoffUpdated).length,
    latestRunState: latest,
    latestHandoffSummary: latest ? buildHandoffSummaryObject(latest) : null
  };
}
