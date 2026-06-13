import { describe, expect, it } from "vitest";
import {
  buildVerificationEvidenceRecord,
  DEFAULT_VERIFICATION_GATES,
  hashVerificationOutput,
  redactVerificationOutput,
  summarizeVerificationEvidence
} from "../src/verification-evidence";

describe("verification evidence redaction", () => {
  it("redacts secret assignments", () => {
    const result = redactVerificationOutput("api_key=supersecret123");
    expect(result.redactionApplied).toBe(true);
    expect(result.text).toContain("[REDACTED_SECRET]");
    expect(result.blocked).toBe(false);
  });

  it("blocks private key material", () => {
    const result = redactVerificationOutput("-----BEGIN RSA PRIVATE KEY-----\nabc");
    expect(result.blocked).toBe(true);
  });

  it("blocks service account json", () => {
    const result = redactVerificationOutput('{"type":"service_account","project_id":"x"}');
    expect(result.blocked).toBe(true);
  });

  it("blocks multi-line env file dumps", () => {
    const result = redactVerificationOutput(
      "DATABASE_URL=postgres://x\nAPI_KEY=abc\nSECRET_TOKEN=def\nOTHER=1"
    );
    expect(result.blocked).toBe(true);
  });
});

describe("verification evidence records", () => {
  it("builds evidence with output hash", () => {
    const built = buildVerificationEvidenceRecord({
      workPacketId: "wpl_test",
      initiativeId: "0.33",
      gateId: "pnpm_test",
      commandName: "pnpm test",
      expectedCommand: "pnpm test",
      reportedStatus: "pass",
      outputText: "All tests passed",
      environment: "local",
      operatorId: "operator"
    });

    expect(built.record?.outputHash).toBe(hashVerificationOutput("All tests passed"));
    expect(built.record?.redactionApplied).toBe(false);
  });

  it("rejects blocked secret content", () => {
    const built = buildVerificationEvidenceRecord({
      workPacketId: "wpl_test",
      initiativeId: "0.33",
      gateId: "pnpm_test",
      commandName: "pnpm test",
      reportedStatus: "pass",
      outputText: "-----BEGIN RSA PRIVATE KEY-----\nabc",
      environment: "local",
      operatorId: "operator"
    });

    expect(built.record).toBeNull();
    expect(built.errors.length).toBeGreaterThan(0);
  });
});

describe("verification evidence summary", () => {
  it("marks missing required gates", () => {
    const built = buildVerificationEvidenceRecord({
      workPacketId: "wpl_test",
      initiativeId: "0.33",
      gateId: "pnpm_test",
      commandName: "pnpm test",
      reportedStatus: "pass",
      outputText: "ok",
      environment: "ci",
      operatorId: "operator"
    });

    const summary = summarizeVerificationEvidence({
      initiativeId: "0.33",
      workPacketId: "wpl_test",
      records: built.record ? [built.record] : [],
      gates: DEFAULT_VERIFICATION_GATES
    });

    expect(summary.attachedCount).toBe(1);
    expect(summary.missingRequiredGateIds).toContain("pnpm_typecheck");
    expect(summary.overallStatus).toBe("pass_reported_missing_evidence");
  });
});
