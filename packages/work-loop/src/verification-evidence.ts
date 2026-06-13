import { createHash } from "node:crypto";
import type {
  VerificationCiMetadataInput,
  VerificationEvidenceInput,
  VerificationEvidenceRecord,
  VerificationEvidenceSummary,
  VerificationGateDefinition,
  VerificationGateOverallStatus
} from "@realmos/contracts";
import { makeWorkLoopId, nowIso } from "./id";

const SECRET_ASSIGNMENT_PATTERN =
  /(?:api[_-]?key|secret|password|token|private[_-]?key|service[_-]?account)\s*[:=]\s*\S+/gi;
const PRIVATE_KEY_PATTERN = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
const SERVICE_ACCOUNT_JSON_PATTERN = /"type"\s*:\s*"service_account"/;

function looksLikeEnvFileDump(text: string): boolean {
  if (/^#?\s*\.env\b/im.test(text)) return true;

  const assignmentLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*=/.test(line));

  return assignmentLines.length >= 3;
}

export const DEFAULT_VERIFICATION_GATES: VerificationGateDefinition[] = [
  { gateId: "pnpm_test", label: "pnpm test", expectedCommand: "pnpm test", required: true },
  { gateId: "pnpm_typecheck", label: "pnpm typecheck", expectedCommand: "pnpm typecheck", required: true },
  { gateId: "pnpm_build", label: "pnpm build", expectedCommand: "pnpm build", required: true },
  {
    gateId: "pnpm_check_clean_start",
    label: "pnpm check:clean-start",
    expectedCommand: "pnpm check:clean-start",
    required: true
  },
  { gateId: "pnpm_demo_mvp", label: "pnpm demo:mvp", expectedCommand: "pnpm demo:mvp", required: false },
  {
    gateId: "pnpm_test_postgres",
    label: "pnpm test:postgres",
    expectedCommand: "pnpm test:postgres",
    required: false
  },
  {
    gateId: "manual_smoke",
    label: "Manual Command Center smoke",
    expectedCommand: "manual smoke",
    required: false,
    manualOnly: true
  }
];

export type RedactionResult = {
  text: string;
  redactionApplied: boolean;
  blocked: boolean;
  blockReason?: string;
};

export function hashVerificationOutput(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function redactVerificationOutput(text: string): RedactionResult {
  if (PRIVATE_KEY_PATTERN.test(text)) {
    return {
      text: "",
      redactionApplied: false,
      blocked: true,
      blockReason: "Private key material cannot be stored in verification evidence."
    };
  }

  if (SERVICE_ACCOUNT_JSON_PATTERN.test(text)) {
    return {
      text: "",
      redactionApplied: false,
      blocked: true,
      blockReason: "Service account JSON cannot be stored in verification evidence."
    };
  }

  if (/^#?\s*\.env\b/m.test(text) || looksLikeEnvFileDump(text)) {
    return {
      text: "",
      redactionApplied: false,
      blocked: true,
      blockReason: ".env contents cannot be stored in verification evidence."
    };
  }

  let redactionApplied = false;
  let sanitized = text;

  const afterSecrets = sanitized.replace(SECRET_ASSIGNMENT_PATTERN, "[REDACTED_SECRET]");
  if (afterSecrets !== sanitized) {
    redactionApplied = true;
    sanitized = afterSecrets;
  }
  SECRET_ASSIGNMENT_PATTERN.lastIndex = 0;

  const afterDbUrl = sanitized.replace(/DATABASE_URL=postgres:\/\/[^\s]+/gi, "DATABASE_URL=[REDACTED]");
  if (afterDbUrl !== sanitized) {
    redactionApplied = true;
    sanitized = afterDbUrl;
  }

  return { text: sanitized.trim(), redactionApplied, blocked: false };
}

export function validateVerificationEvidenceInput(
  input: VerificationEvidenceInput
): { valid: boolean; errors: Array<{ field: string; message: string }> } {
  const errors: Array<{ field: string; message: string }> = [];

  if (!input.initiativeId?.trim()) {
    errors.push({ field: "initiativeId", message: "initiativeId is required." });
  }
  if (!input.gateId?.trim()) {
    errors.push({ field: "gateId", message: "gateId is required." });
  }
  if (!input.commandName?.trim()) {
    errors.push({ field: "commandName", message: "commandName is required." });
  }
  if (!input.workPacketId && !input.runStateId) {
    errors.push({
      field: "workPacketId",
      message: "workPacketId or runStateId is required."
    });
  }

  const combined = `${input.outputText ?? ""}\n${input.outputSummary ?? ""}\n${input.notes ?? ""}`;
  if (combined.trim()) {
    const redaction = redactVerificationOutput(combined);
    if (redaction.blocked) {
      errors.push({ field: "outputText", message: redaction.blockReason ?? "Blocked content." });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildVerificationEvidenceRecord(
  input: VerificationEvidenceInput,
  id: string = makeWorkLoopId("verify_evidence")
): { record: VerificationEvidenceRecord | null; errors: Array<{ field: string; message: string }> } {
  const validation = validateVerificationEvidenceInput(input);
  if (!validation.valid) {
    return { record: null, errors: validation.errors };
  }

  const rawOutput = input.outputText?.trim() ?? input.outputSummary?.trim() ?? "";
  let outputText: string | undefined;
  let outputSummary = input.outputSummary?.trim();
  let redactionApplied = false;
  let redactionBlocked = false;
  let blockReason: string | undefined;

  if (rawOutput) {
    const redaction = redactVerificationOutput(rawOutput);
    if (redaction.blocked) {
      return {
        record: null,
        errors: [{ field: "outputText", message: redaction.blockReason ?? "Blocked content." }]
      };
    }
    outputText = redaction.text;
    outputSummary = outputSummary ?? redaction.text.slice(0, 500);
    redactionApplied = redaction.redactionApplied;
  }

  const capturedAt = nowIso();
  const outputHash = outputText ? hashVerificationOutput(outputText) : undefined;

  return {
    record: {
      id,
      workPacketId: input.workPacketId,
      runStateId: input.runStateId,
      dispatchId: input.dispatchId,
      initiativeId: input.initiativeId.trim(),
      gateId: input.gateId.trim(),
      commandName: input.commandName.trim(),
      expectedCommand: input.expectedCommand?.trim(),
      reportedStatus: input.reportedStatus,
      outputText,
      outputSummary,
      outputHash,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      capturedAt,
      durationMs: input.durationMs,
      environment: input.environment,
      ciProvider: input.ciProvider,
      ciRunUrl: input.ciRunUrl,
      commitSha: input.commitSha,
      branch: input.branch,
      operatorId: input.operatorId,
      source: input.source ?? "operator",
      artifactRefs: input.artifactRefs ?? [],
      notes: input.notes?.trim(),
      warnings: input.warnings ?? [],
      gaps: input.gaps ?? [],
      redactionApplied,
      redactionBlocked,
      blockReason
    },
    errors: []
  };
}

export function buildCiVerificationEvidenceRecord(
  input: VerificationCiMetadataInput,
  id: string = makeWorkLoopId("verify_evidence")
): { record: VerificationEvidenceRecord | null; errors: Array<{ field: string; message: string }> } {
  if (!input.ciRunUrl?.trim()) {
    return { record: null, errors: [{ field: "ciRunUrl", message: "ciRunUrl is required." }] };
  }

  return buildVerificationEvidenceRecord({
    workPacketId: input.workPacketId,
    runStateId: input.runStateId,
    initiativeId: input.initiativeId,
    gateId: input.gateId,
    commandName: input.gateId,
    expectedCommand: DEFAULT_VERIFICATION_GATES.find((gate) => gate.gateId === input.gateId)?.expectedCommand,
    reportedStatus: input.reportedStatus ?? "pass",
    environment: "ci",
    ciProvider: input.ciProvider ?? "github_actions",
    ciRunUrl: input.ciRunUrl.trim(),
    commitSha: input.commitSha,
    branch: input.branch,
    operatorId: input.operatorId,
    source: "ci_manual",
    outputSummary: `CI run linked: ${input.ciRunUrl.trim()}`,
    notes: input.notes
  }, id);
}

function gateStatusForRecord(
  gate: VerificationGateDefinition,
  records: VerificationEvidenceRecord[]
): VerificationGateOverallStatus {
  const gateRecords = records.filter((record) => record.gateId === gate.gateId);
  if (gateRecords.length === 0) {
    return gate.manualOnly ? "manual_only" : "not_run";
  }

  const latest = gateRecords[gateRecords.length - 1]!;
  const hasEvidence = Boolean(latest.outputText || latest.outputSummary || latest.ciRunUrl);

  if (latest.reportedStatus === "fail") {
    return hasEvidence ? "fail_with_evidence" : "pass_reported_missing_evidence";
  }

  if (latest.reportedStatus === "pass" && hasEvidence) {
    return "pass_with_evidence";
  }

  if (latest.reportedStatus === "pass") {
    return "pass_reported_missing_evidence";
  }

  return gate.manualOnly ? "manual_only" : "not_run";
}

export function summarizeVerificationEvidence(input: {
  initiativeId: string;
  workPacketId?: string;
  runStateId?: string;
  records: VerificationEvidenceRecord[];
  gates?: VerificationGateDefinition[];
}): VerificationEvidenceSummary {
  const gates = input.gates ?? DEFAULT_VERIFICATION_GATES;
  const scoped = input.records.filter((record) => {
    if (input.workPacketId && record.workPacketId !== input.workPacketId) return false;
    if (input.runStateId && record.runStateId !== input.runStateId) return false;
    if (record.initiativeId !== input.initiativeId) return false;
    return true;
  });

  const gateStatuses = gates.map((gate) => ({
    gateId: gate.gateId,
    label: gate.label,
    expectedCommand: gate.expectedCommand,
    required: gate.required,
    manualOnly: gate.manualOnly,
    status: gateStatusForRecord(gate, scoped),
    evidenceIds: scoped.filter((record) => record.gateId === gate.gateId).map((record) => record.id)
  }));

  const missingRequiredGateIds = gateStatuses
    .filter((gate) => gate.required && gate.status !== "pass_with_evidence")
    .map((gate) => gate.gateId);

  const attachedCount = gateStatuses.filter((gate) => gate.evidenceIds.length > 0).length;

  let overallStatus: VerificationEvidenceSummary["overallStatus"] = "partial";
  if (missingRequiredGateIds.length === 0 && attachedCount > 0) {
    overallStatus = "pass_with_evidence";
  } else if (gateStatuses.some((gate) => gate.status === "fail_with_evidence")) {
    overallStatus = "fail_with_evidence";
  } else if (attachedCount === 0) {
    overallStatus = "not_run";
  } else if (missingRequiredGateIds.length > 0) {
    overallStatus = "pass_reported_missing_evidence";
  }

  const hashes = scoped.map((record) => record.outputHash).filter(Boolean) as string[];

  return {
    initiativeId: input.initiativeId,
    workPacketId: input.workPacketId,
    runStateId: input.runStateId,
    totalCount: scoped.length,
    attachedCount,
    missingRequiredGateIds,
    gates: gateStatuses,
    overallStatus,
    outputHashSummary: hashes.length ? hashVerificationOutput(hashes.join("|")) : undefined,
    updatedAt: nowIso()
  };
}
