import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VerificationEvidencePanel } from "./VerificationEvidencePanel";

vi.mock("@/lib/api/verification-evidence", () => ({
  fetchVerificationEvidenceSummary: vi.fn(),
  attachVerificationEvidence: vi.fn(),
  attachCiVerificationEvidence: vi.fn()
}));

import {
  attachVerificationEvidence,
  fetchVerificationEvidenceSummary
} from "@/lib/api/verification-evidence";

describe("VerificationEvidencePanel", () => {
  it("shows mock mode error", () => {
    render(<VerificationEvidencePanel dataSource="mock" workPacketId="wpl_test" />);
    expect(screen.getByText(/requires live API/i)).toBeInTheDocument();
  });

  it("shows gate summary and missing evidence", async () => {
    vi.mocked(fetchVerificationEvidenceSummary).mockResolvedValue({
      ok: true,
      data: {
        initiativeId: "0.33",
        workPacketId: "wpl_test",
        totalCount: 1,
        attachedCount: 1,
        missingRequiredGateIds: ["pnpm_typecheck"],
        overallStatus: "pass_reported_missing_evidence",
        gates: [
          {
            gateId: "pnpm_test",
            label: "pnpm test",
            expectedCommand: "pnpm test",
            required: true,
            status: "pass_with_evidence",
            evidenceIds: ["ev1"]
          },
          {
            gateId: "pnpm_typecheck",
            label: "pnpm typecheck",
            expectedCommand: "pnpm typecheck",
            required: true,
            status: "not_run",
            evidenceIds: []
          }
        ],
        updatedAt: new Date().toISOString()
      }
    });

    render(<VerificationEvidencePanel dataSource="api" workPacketId="wpl_test" />);

    await waitFor(() => {
      expect(screen.getByText(/pnpm test/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Missing required/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /run shell/i })).not.toBeInTheDocument();
  });

  it("attaches pasted output evidence", async () => {
    vi.mocked(fetchVerificationEvidenceSummary).mockResolvedValue({
      ok: true,
      data: {
        initiativeId: "0.33",
        workPacketId: "wpl_test",
        totalCount: 0,
        attachedCount: 0,
        missingRequiredGateIds: ["pnpm_test"],
        overallStatus: "not_run",
        gates: [
          {
            gateId: "pnpm_test",
            label: "pnpm test",
            expectedCommand: "pnpm test",
            required: true,
            status: "not_run",
            evidenceIds: []
          }
        ],
        updatedAt: new Date().toISOString()
      }
    });

    vi.mocked(attachVerificationEvidence).mockResolvedValue({
      ok: true,
      data: {
        record: {
          id: "ev1",
          initiativeId: "0.33",
          gateId: "pnpm_test",
          commandName: "pnpm test",
          reportedStatus: "pass",
          capturedAt: new Date().toISOString(),
          environment: "local",
          source: "operator",
          artifactRefs: [],
          warnings: [],
          gaps: [],
          redactionApplied: false,
          redactionBlocked: false,
          workPacketId: "wpl_test"
        },
        summary: {
          initiativeId: "0.33",
          workPacketId: "wpl_test",
          totalCount: 1,
          attachedCount: 1,
          missingRequiredGateIds: [],
          overallStatus: "pass_with_evidence",
          gates: [],
          updatedAt: new Date().toISOString()
        }
      }
    });

    render(<VerificationEvidencePanel dataSource="api" workPacketId="wpl_test" />);
    await waitFor(() => expect(screen.getByText(/Attach output evidence/i)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/Paste pnpm test output/i), {
      target: { value: "All tests passed" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Attach output evidence" }));

    await waitFor(() => {
      expect(attachVerificationEvidence).toHaveBeenCalled();
    });
  });
});
