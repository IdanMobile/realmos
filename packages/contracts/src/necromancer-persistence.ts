export type NecromancerActionType = "pause" | "retire" | "protect" | "prepare";

export type NecromancerActionOutcome = "applied" | "blocked";

export type NecromancerEvidenceLinkStatus = "linked" | "missing" | "invalid";

export type NecromancerCandidateSnapshot = {
  id: string;
  kind: string;
  entityId: string;
  classification: string;
  riskLevel: string;
  title: string;
  currentStatus: string;
  realmId?: string;
  repositoryId?: string;
  reason: string;
};

export type NecromancerRecommendationSnapshot = {
  summary: string;
  recommendation: string;
  requiresApproval: boolean;
};

export type NecromancerProtectionRecord = {
  id: string;
  candidateId: string;
  realmId?: string;
  operatorId: string;
  reason?: string;
  evidenceId?: string;
  createdAt: string;
  updatedAt: string;
};

export type NecromancerOperatorActionRecord = {
  id: string;
  candidateId: string;
  action: NecromancerActionType;
  actionType: NecromancerActionType;
  operatorId: string;
  approved: boolean;
  outcome: NecromancerActionOutcome;
  summary: string;
  createdAt: string;
  realmId?: string;
  blockReason?: string;
  candidateSnapshot?: NecromancerCandidateSnapshot;
  recommendationSnapshot?: NecromancerRecommendationSnapshot;
  evidenceId?: string;
  evidenceStatus?: NecromancerEvidenceLinkStatus;
  approvalMetadata?: {
    reason?: string;
  };
  payload?: Record<string, unknown>;
};

export type NecromancerActionListFilters = {
  candidateId?: string;
  action?: NecromancerActionType;
  operatorId?: string;
  outcome?: NecromancerActionOutcome;
  limit?: number;
};
