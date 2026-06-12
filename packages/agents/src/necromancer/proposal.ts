import type { CreationProposal } from "@realmos/contracts";
import { classifyCreationNeed } from "./creator-router";

function nowIso(): string {
  return new Date().toISOString();
}

function makeProposalId(needSummary: string): string {
  const slug = needSummary.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24);
  return `proposal_${slug}_${Date.now().toString(36)}`;
}

export function createCreationProposal(input: {
  requestedBy: string;
  needSummary: string;
  businessId?: string;
}): CreationProposal {
  const timestamp = nowIso();
  const classification = classifyCreationNeed(input.needSummary);

  return {
    id: makeProposalId(input.needSummary),
    requestedBy: input.requestedBy,
    businessId: input.businessId,
    needSummary: input.needSummary,
    ...classification,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
