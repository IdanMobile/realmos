export type ProjectInfrastructureMode =
  | "none_yet"
  | "mock_only"
  | "dedicated_project_infra"
  | "external_existing_infra";

export type ProjectInfrastructureStatus = "draft" | "approved" | "active" | "deprecated";

export type InfrastructureResourceType =
  | "database"
  | "backend"
  | "auth"
  | "storage"
  | "hosting"
  | "api"
  | "secret_store"
  | "queue"
  | "worker"
  | "analytics"
  | "deployment";

export type InfrastructureProvider =
  | "firebase"
  | "supabase"
  | "neon"
  | "vercel"
  | "render"
  | "fly"
  | "railway"
  | "aws"
  | "gcp"
  | "azure"
  | "local"
  | "github"
  | "custom"
  | "unknown";

export type InfrastructureResourceRef = {
  id: string;
  realmId: string;
  type: InfrastructureResourceType;
  provider: InfrastructureProvider;
  name: string;
  environment: "local" | "dev" | "staging" | "production";
  isRealmOSPlatformResource: boolean;
  isProjectRuntimeResource: boolean;
  notes?: string;
};

export type ProjectInfrastructurePlan = {
  id: string;
  realmId: string;
  mode: ProjectInfrastructureMode;
  status: ProjectInfrastructureStatus;
  appDatabase?: InfrastructureResourceRef;
  backend?: InfrastructureResourceRef;
  auth?: InfrastructureResourceRef;
  storage?: InfrastructureResourceRef;
  hosting?: InfrastructureResourceRef;
  queues?: InfrastructureResourceRef;
  analytics?: InfrastructureResourceRef;
  secrets?: InfrastructureResourceRef;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type InfrastructureIsolationViolation = {
  id: string;
  realmId: string;
  violationType:
    | "project_uses_realmos_database"
    | "project_uses_realmos_auth"
    | "project_uses_realmos_storage"
    | "project_uses_realmos_functions"
    | "project_uses_realmos_secrets"
    | "project_uses_realmos_workers"
    | "project_uses_realmos_queue"
    | "project_runtime_mixed_with_realmos_orchestration";
  severity: "medium" | "high" | "critical";
  resourceId?: string;
  rationale: string;
  allowedOnlyIfTemporaryPrototype: boolean;
  requiresUserApproval: boolean;
  createdAt: string;
};

export type TemporaryPrototypeInfrastructureApproval = {
  id: string;
  realmId: string;
  resourceIds: string[];
  reason: string;
  exitPlan: string;
  expiresAt?: string;
  approvedByUserId: string;
  createdAt: string;
};
