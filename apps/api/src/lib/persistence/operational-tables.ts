export const OPERATIONAL_SINGLETON_ID = "default";

export const OperationalTables = {
  continuousWorkPolicy: "operational_continuous_work_policy",
  workItems: "operational_work_items",
  cursorWorkPackets: "operational_cursor_work_packets",
  cursorCompletionReports: "operational_cursor_completion_reports",
  nextBestWorkDecisions: "operational_next_best_work_decisions",
  fleet: "operational_fleet",
  fleetCapacityPolicy: "operational_fleet_capacity_policy",
  squads: "operational_squads",
  fleetRuns: "operational_fleet_runs",
  parallelWorkPlans: "operational_parallel_work_plans",
  workConflicts: "operational_work_conflicts",
  realms: "operational_realms",
  realmEnvironments: "operational_realm_environments",
  realmAccessPolicies: "operational_realm_access_policies",
  repositoryBindings: "operational_repository_bindings",
  repositoryConflicts: "operational_repository_conflicts",
  platformDecision: "operational_platform_decision",
  platformResources: "operational_platform_resources",
  projectInfrastructurePlans: "operational_project_infrastructure_plans",
  prototypeApprovals: "operational_prototype_approvals",
  isolationViolations: "operational_isolation_violations"
} as const;

export type OperationalTableName = (typeof OperationalTables)[keyof typeof OperationalTables];
