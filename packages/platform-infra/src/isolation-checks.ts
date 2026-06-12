import type {
  InfrastructureIsolationViolation,
  InfrastructureResourceRef,
  ProjectInfrastructurePlan,
  TemporaryPrototypeInfrastructureApproval
} from "@realmos/contracts";
import { makePlatformInfraId, nowIso } from "./id";
import { listPlanResources } from "./project-infra-defaults";

const VIOLATION_BY_TYPE: Record<
  InfrastructureResourceRef["type"],
  InfrastructureIsolationViolation["violationType"] | null
> = {
  database: "project_uses_realmos_database",
  auth: "project_uses_realmos_auth",
  storage: "project_uses_realmos_storage",
  backend: "project_uses_realmos_functions",
  secret_store: "project_uses_realmos_secrets",
  worker: "project_uses_realmos_workers",
  queue: "project_uses_realmos_queue",
  hosting: "project_runtime_mixed_with_realmos_orchestration",
  api: "project_runtime_mixed_with_realmos_orchestration",
  analytics: "project_runtime_mixed_with_realmos_orchestration",
  deployment: "project_runtime_mixed_with_realmos_orchestration"
};

function violationForResource(
  plan: ProjectInfrastructurePlan,
  resource: InfrastructureResourceRef
): InfrastructureIsolationViolation | null {
  if (!resource.isProjectRuntimeResource || !resource.isRealmOSPlatformResource) {
    return null;
  }

  const violationType =
    VIOLATION_BY_TYPE[resource.type] ?? "project_runtime_mixed_with_realmos_orchestration";

  return {
    id: makePlatformInfraId("infra_violation"),
    realmId: plan.realmId,
    violationType,
    severity:
      plan.mode === "mock_only" && resource.environment !== "production" ? "high" : "critical",
    resourceId: resource.id,
    rationale: `Project runtime resource ${resource.name} uses RealmOS platform infrastructure (${resource.provider}).`,
    allowedOnlyIfTemporaryPrototype: true,
    requiresUserApproval: true,
    createdAt: nowIso()
  };
}

export function detectInfrastructureIsolationViolations(
  plan: ProjectInfrastructurePlan,
  approvals: TemporaryPrototypeInfrastructureApproval[] = []
): InfrastructureIsolationViolation[] {
  const covered = new Set(approvals.flatMap((approval) => approval.resourceIds));

  return listPlanResources(plan)
    .map((resource) => violationForResource(plan, resource))
    .filter((violation): violation is InfrastructureIsolationViolation => Boolean(violation))
    .filter((violation) => !violation.resourceId || !covered.has(violation.resourceId));
}

export function hasBlockingInfrastructureViolations(
  violations: InfrastructureIsolationViolation[],
  approvals: TemporaryPrototypeInfrastructureApproval[] = []
): boolean {
  const approvedResources = new Set(approvals.flatMap((approval) => approval.resourceIds));

  return violations.some((violation) => {
    if (violation.resourceId && approvedResources.has(violation.resourceId)) {
      return false;
    }
    return violation.severity === "critical" || violation.requiresUserApproval;
  });
}

export type PrototypeApprovalInput = {
  realmId: string;
  resourceIds: string[];
  reason: string;
  exitPlan: string;
  approvedByUserId: string;
  expiresAt?: string;
};

export function createTemporaryPrototypeApproval(
  input: PrototypeApprovalInput
): TemporaryPrototypeInfrastructureApproval {
  return {
    id: makePlatformInfraId("prototype_approval"),
    realmId: input.realmId,
    resourceIds: input.resourceIds,
    reason: input.reason,
    exitPlan: input.exitPlan,
    expiresAt: input.expiresAt,
    approvedByUserId: input.approvedByUserId,
    createdAt: nowIso()
  };
}

export function validatePrototypeApprovalInput(input: PrototypeApprovalInput): string[] {
  const errors: string[] = [];
  if (!input.realmId) errors.push("realmId is required");
  if (!input.resourceIds.length) errors.push("resourceIds must not be empty");
  if (!input.reason.trim()) errors.push("reason is required");
  if (!input.exitPlan.trim()) errors.push("exitPlan is required");
  if (!input.approvedByUserId) errors.push("approvedByUserId is required");
  return errors;
}
