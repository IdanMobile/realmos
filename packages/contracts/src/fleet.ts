export type FleetLane =
  | "planning"
  | "backend"
  | "frontend"
  | "design"
  | "qa"
  | "security"
  | "docs"
  | "research"
  | "governance"
  | "optimization"
  | "operations";

export type CoordinationMode =
  | "serial"
  | "parallel"
  | "map_reduce"
  | "review_chain"
  | "council"
  | "handoff"
  | "race_with_review";

export type FleetRunStatus =
  | "queued"
  | "ready"
  | "running"
  | "waiting_for_report"
  | "blocked"
  | "waiting_for_approval"
  | "succeeded"
  | "failed"
  | "cancelled";

export type FleetCapacityPolicy = {
  id: string;
  maxConcurrentRuns: number;
  maxConcurrentRunsPerBusiness: number;
  maxConcurrentRunsPerLane: Partial<Record<FleetLane, number>>;
  maxCostPerHourUsd?: number;
  maxTokensPerHour?: number;
  requireApprovalAboveRisk: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
};

export type Fleet = {
  id: string;
  name: string;
  businessId?: string;
  supervisorAgentId: string;
  capacityPolicyId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Squad = {
  id: string;
  fleetId: string;
  name: string;
  businessId?: string;
  lane: FleetLane;
  supervisorAgentId: string;
  agentIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkConflict = {
  id: string;
  workItemIds: string[];
  conflictType:
    | "same_file"
    | "same_package"
    | "same_business_object"
    | "same_task"
    | "same_decision_area"
    | "same_database_migration"
    | "same_external_integration"
    | "same_budget_pool"
    | "same_deployment_target";
  severity: "low" | "medium" | "high" | "critical";
  resolution: "serialize" | "same_squad" | "supervisor_review" | "cancel_one" | "allow";
  rationale: string;
  createdAt: string;
};

export type FleetRun = {
  id: string;
  fleetId: string;
  squadId?: string;
  workItemId: string;
  lane: FleetLane;
  coordinationMode: CoordinationMode;
  status: FleetRunStatus;
  assignedAgentIds: string[];
  assignedWorkflowId?: string;
  conflicts: WorkConflict[];
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ParallelWorkPlan = {
  id: string;
  title: string;
  businessId?: string;
  fleetId: string;
  coordinationMode: CoordinationMode;
  workItemIds: string[];
  dependencyEdges: Array<{ fromWorkItemId: string; toWorkItemId: string }>;
  conflictIds: string[];
  approvalRequired: boolean;
  rationale: string;
  createdAt: string;
};
