# Creation Proposal Contract

```ts
type CreationType =
  | "ai_agent"
  | "agentic_workflow"
  | "deterministic_module"
  | "automation_workflow"
  | "human_task"
  | "hybrid_system";

type CreationProposal = {
  id: string;
  requestedBy: string;
  businessId?: string;
  needSummary: string;
  recommendedCreationType: CreationType;
  reasoningRequired: boolean;
  repeatability: "one_time" | "recurring" | "continuous";
  riskLevel: "low" | "medium" | "high" | "critical";
  costProfile: "free_local" | "low" | "medium" | "high";
  approvalRequired: boolean;
  proposedOwner:
    | "necromancer"
    | "creator_router"
    | "automation_architect"
    | "deterministic_engineer"
    | "agentic_orchestrator"
    | "human";
  whyNotSimpler: string;
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
};
```

## Rule

RealmOS must classify the need before creating a new agent.

Not every need becomes an AI agent.
