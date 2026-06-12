import type { WorkPacketLifecycleStatus, WorkPacketVerificationStatus } from "./work-packet-lifecycle";

export type RunStateResultStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "blocked"
  | "not_applicable";

export type RunStateHandoffAuditEvent = {
  eventType: string;
  timestamp: string;
  summary: string;
  payload?: Record<string, unknown>;
};

export type HandoffSummaryObject = {
  runStateId: string;
  sourcePacketId: string;
  sourceDispatchId?: string;
  initiativeId: string;
  lifecycleStatus: WorkPacketLifecycleStatus;
  resultStatus: RunStateResultStatus;
  verificationStatus: WorkPacketVerificationStatus;
  handoffTextSummary: string;
  knownRisks: string[];
  blockedReasons: string[];
  nextRecommendedInitiative: string;
  handoffRequired: boolean;
  handoffUpdated: boolean;
  updatedAt: string;
};

export type NextChatPromptObject = {
  runStateId: string;
  sourcePacketId: string;
  initiativeId: string;
  promptText: string;
  nextRecommendedInitiative: string;
  updatedAt: string;
};

export type RealmOSRunState = {
  id: string;
  sourcePacketId: string;
  sourceDispatchId?: string;
  realmId: string;
  repositoryId: string;
  initiativeId: string;
  taskLabel: string;
  lifecycleStatus: WorkPacketLifecycleStatus;
  resultStatus: RunStateResultStatus;
  verificationStatus: WorkPacketVerificationStatus;
  commandsExpected: string[];
  commandsReported: string[];
  changedFilesSummary: string;
  artifactsSummary: string;
  safetySummary: string;
  knownRisks: string[];
  blockedReasons: string[];
  nextRecommendedInitiative: string;
  handoffTextSummary: string;
  newChatPromptText?: string;
  handoffRequired: boolean;
  handoffUpdated: boolean;
  auditEvents: RunStateHandoffAuditEvent[];
  createdAt: string;
  updatedAt: string;
};

export type RunStateHandoffInput = {
  initiativeId?: string;
  taskLabel?: string;
  handoffRequired?: boolean;
};
