export type CreationType =
  | "ai_agent"
  | "agentic_workflow"
  | "deterministic_module"
  | "automation_workflow"
  | "human_task"
  | "hybrid_system";

export type CreationRepeatability = "one_time" | "recurring" | "continuous";

export type CreationOwner =
  | "necromancer"
  | "creator_router"
  | "automation_architect"
  | "deterministic_engineer"
  | "agentic_orchestrator"
  | "human";

export type CreationProposal = {
  id: string;
  requestedBy: string;
  businessId?: string;
  needSummary: string;
  recommendedCreationType: CreationType;
  reasoningRequired: boolean;
  repeatability: CreationRepeatability;
  riskLevel: "low" | "medium" | "high" | "critical";
  costProfile: "free_local" | "low" | "medium" | "high";
  approvalRequired: boolean;
  proposedOwner: CreationOwner;
  whyNotSimpler: string;
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
};
