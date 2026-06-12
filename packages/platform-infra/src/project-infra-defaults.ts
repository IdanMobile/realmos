import type { InfrastructureResourceRef, ProjectInfrastructurePlan } from "@realmos/contracts";
import { nowIso } from "./id";

export function createDefaultGuingInfrastructurePlan(): ProjectInfrastructurePlan {
  const timestamp = nowIso();
  const projectDb: InfrastructureResourceRef = {
    id: "guing_project_db",
    realmId: "realm_guing",
    type: "database",
    provider: "gcp",
    name: "guing-dedicated-db",
    environment: "production",
    isRealmOSPlatformResource: false,
    isProjectRuntimeResource: true,
    notes: "GUING product database — dedicated to GUING runtime."
  };

  return {
    id: "guing_infra_plan",
    realmId: "realm_guing",
    mode: "dedicated_project_infra",
    status: "approved",
    appDatabase: projectDb,
    backend: {
      id: "guing_backend",
      realmId: "realm_guing",
      type: "backend",
      provider: "gcp",
      name: "guing-runtime-server",
      environment: "production",
      isRealmOSPlatformResource: false,
      isProjectRuntimeResource: true
    },
    auth: {
      id: "guing_auth",
      realmId: "realm_guing",
      type: "auth",
      provider: "custom",
      name: "guing-auth",
      environment: "production",
      isRealmOSPlatformResource: false,
      isProjectRuntimeResource: true
    },
    notes: "GUING uses dedicated runtime infrastructure. RealmOS only stores orchestration metadata.",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createMockPrototypeInfrastructurePlan(): ProjectInfrastructurePlan {
  const timestamp = nowIso();
  return {
    id: "guing_prototype_plan",
    realmId: "realm_guing",
    mode: "mock_only",
    status: "draft",
    appDatabase: {
      id: "guing_mock_firestore",
      realmId: "realm_guing",
      type: "database",
      provider: "firebase",
      name: "realmos-firestore",
      environment: "dev",
      isRealmOSPlatformResource: true,
      isProjectRuntimeResource: true,
      notes: "Temporary prototype — requires approval and exit plan."
    },
    notes: "Mock-only prototype plan — must not become production without dedicated infra.",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function listPlanResources(plan: ProjectInfrastructurePlan): InfrastructureResourceRef[] {
  return [
    plan.appDatabase,
    plan.backend,
    plan.auth,
    plan.storage,
    plan.hosting,
    plan.queues,
    plan.analytics,
    plan.secrets
  ].filter((resource): resource is InfrastructureResourceRef => Boolean(resource));
}
