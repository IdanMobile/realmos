export type VerificationEvidenceEnvironment =
  | "local"
  | "ci"
  | "postgres_smoke"
  | "demo"
  | "manual_smoke";

export type VerificationEvidenceSource = "operator" | "ci_manual" | "system";

export type VerificationEvidenceReportedStatus = "pass" | "fail" | "not_run" | "blocked";

export type VerificationGateOverallStatus =
  | "pass_with_evidence"
  | "pass_reported_missing_evidence"
  | "fail_with_evidence"
  | "not_run"
  | "manual_only";

export type VerificationEvidenceRecord = {
  id: string;
  workPacketId?: string;
  runStateId?: string;
  dispatchId?: string;
  initiativeId: string;
  gateId: string;
  commandName: string;
  expectedCommand?: string;
  reportedStatus: VerificationEvidenceReportedStatus;
  outputText?: string;
  outputSummary?: string;
  outputHash?: string;
  startedAt?: string;
  completedAt?: string;
  capturedAt: string;
  durationMs?: number;
  environment: VerificationEvidenceEnvironment;
  ciProvider?: string;
  ciRunUrl?: string;
  commitSha?: string;
  branch?: string;
  operatorId?: string;
  source: VerificationEvidenceSource;
  artifactRefs: string[];
  notes?: string;
  warnings: string[];
  gaps: string[];
  redactionApplied: boolean;
  redactionBlocked: boolean;
  blockReason?: string;
};

export type VerificationGateDefinition = {
  gateId: string;
  label: string;
  expectedCommand: string;
  required: boolean;
  manualOnly?: boolean;
};

export type VerificationGateStatus = {
  gateId: string;
  label: string;
  expectedCommand: string;
  required: boolean;
  manualOnly?: boolean;
  status: VerificationGateOverallStatus;
  evidenceIds: string[];
};

export type VerificationEvidenceSummary = {
  initiativeId: string;
  workPacketId?: string;
  runStateId?: string;
  totalCount: number;
  attachedCount: number;
  missingRequiredGateIds: string[];
  gates: VerificationGateStatus[];
  overallStatus: VerificationGateOverallStatus | "partial";
  outputHashSummary?: string;
  updatedAt: string;
};

export type VerificationEvidenceInput = {
  workPacketId?: string;
  runStateId?: string;
  dispatchId?: string;
  initiativeId: string;
  gateId: string;
  commandName: string;
  expectedCommand?: string;
  reportedStatus: VerificationEvidenceReportedStatus;
  outputText?: string;
  outputSummary?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  environment: VerificationEvidenceEnvironment;
  ciProvider?: string;
  ciRunUrl?: string;
  commitSha?: string;
  branch?: string;
  operatorId?: string;
  source?: VerificationEvidenceSource;
  artifactRefs?: string[];
  notes?: string;
  warnings?: string[];
  gaps?: string[];
};

export type VerificationCiMetadataInput = {
  workPacketId?: string;
  runStateId?: string;
  initiativeId: string;
  gateId: string;
  ciProvider?: string;
  ciRunUrl: string;
  commitSha?: string;
  branch?: string;
  reportedStatus?: VerificationEvidenceReportedStatus;
  operatorId?: string;
  notes?: string;
};
