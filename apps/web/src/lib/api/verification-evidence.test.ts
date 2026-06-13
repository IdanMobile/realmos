import { describe, expect, it, vi } from "vitest";
import {
  attachVerificationEvidence,
  fetchVerificationEvidenceSummary
} from "./verification-evidence";

describe("verification evidence api client", () => {
  it("fetches evidence summary", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          initiativeId: "0.33",
          totalCount: 0,
          attachedCount: 0,
          missingRequiredGateIds: ["pnpm_test"],
          gates: [],
          overallStatus: "not_run",
          updatedAt: new Date().toISOString()
        }),
        { status: 200 }
      )
    );

    const result = await fetchVerificationEvidenceSummary({
      initiativeId: "0.33",
      workPacketId: "wpl_test"
    });

    expect(result.ok).toBe(true);
    fetchMock.mockRestore();
  });

  it("posts attach evidence payload", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ record: { id: "ev1" }, summary: { attachedCount: 1 } }), {
        status: 201
      })
    );

    await attachVerificationEvidence({
      workPacketId: "wpl_test",
      initiativeId: "0.33",
      gateId: "pnpm_test",
      commandName: "pnpm test",
      reportedStatus: "pass",
      outputText: "ok",
      environment: "local",
      operatorId: "operator"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/verification/evidence"),
      expect.objectContaining({ method: "POST" })
    );

    fetchMock.mockRestore();
  });
});
