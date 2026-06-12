import { describe, expect, it } from "vitest";
import type { CreationProposal } from "@realmos/contracts";
import {
  createPaidToolCandidate,
  finalizeCapabilitySearchReport,
  refineCreationProposalWithCapabilityScout,
  searchInternalCapabilities
} from "../src/index";

describe("Capability Scout", () => {
  it("prefers existing internal capability when fit is high", () => {
    const candidates = searchInternalCapabilities("Need governance approval policy checks before risky actions.");
    const top = candidates.sort((a, b) => b.fitScore - a.fitScore)[0];

    expect(top?.source).toBe("internal");
    expect(top?.name).toBe("Governance Kernel");
    expect(top?.fitScore).toBeGreaterThanOrEqual(70);
  });

  it("requires approval for paid subscription tools", () => {
    const candidate = createPaidToolCandidate({
      name: "Linear Pro",
      summary: "Paid project management SaaS integration."
    });

    expect(candidate.requiresSubscription).toBe(true);
    expect(candidate.requiresApproval).toBe(true);
  });

  it("requires approval for sensitive permission tools", () => {
    const report = finalizeCapabilitySearchReport({
      needSummary: "Need browser automation with camera access for visual QA."
    });

    const flagged = report.candidates.find((candidate) => candidate.requiresApproval);
    expect(flagged?.requiresApproval).toBe(true);
  });

  it("creates a CapabilitySearchReport for package decisions", () => {
    const report = finalizeCapabilitySearchReport({
      needSummary: "Find an npm package for schema validation."
    });

    expect(report.id.startsWith("cap_report_")).toBe(true);
    expect(report.candidates.some((candidate) => candidate.source === "npm_package")).toBe(true);
    expect(report.buildVsBuyDecision).not.toBeUndefined();
  });

  it("lets Creator Router consume capability scout results", () => {
    const proposal: CreationProposal = {
      id: "proposal_test",
      requestedBy: "agent_jarvis",
      needSummary: "Need governance approval policy checks.",
      recommendedCreationType: "ai_agent",
      reasoningRequired: true,
      repeatability: "recurring",
      riskLevel: "medium",
      costProfile: "low",
      approvalRequired: false,
      proposedOwner: "necromancer",
      whyNotSimpler: "Initial router guess.",
      acceptanceCriteria: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const report = finalizeCapabilitySearchReport({ needSummary: proposal.needSummary });
    const refined = refineCreationProposalWithCapabilityScout(proposal, report);

    expect(report.buildVsBuyDecision).toBe("use_existing");
    expect(refined.recommendedCreationType).toBe("deterministic_module");
    expect(refined.proposedOwner).toBe("deterministic_engineer");
  });
});
