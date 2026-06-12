import type { InfrastructureResourceRef, RealmOSPlatformDecision } from "@realmos/contracts";
import { nowIso } from "./id";

export function createDefaultPlatformDecision(): RealmOSPlatformDecision {
  const timestamp = nowIso();
  return {
    id: "platform_baseline_v1",
    cloudPlatform: "firebase",
    localNodeRuntime: "m2_macbook_16gb",
    sourceControl: "github",
    localLLMRuntime: "ollama",
    status: "selected",
    rationale: "Minimize operational surface for a self-sustained RealmOS MVP.",
    delayedPlatforms: [
      {
        name: "supabase",
        reasonToDelay: "Do not add Postgres until Firestore is painful.",
        conditionToAdopt: "Need branchable SQL or relational reporting."
      },
      {
        name: "neon",
        reasonToDelay: "Do not add Postgres until Firestore is painful.",
        conditionToAdopt: "Need SQL analytics or complex relational reporting."
      },
      {
        name: "vercel",
        reasonToDelay: "Firebase Hosting/App Hosting is the default.",
        conditionToAdopt: "Need Vercel-specific preview or Next.js workflow."
      },
      {
        name: "render",
        reasonToDelay: "Not needed at MVP start.",
        conditionToAdopt: "Need managed container hosting outside Firebase."
      },
      {
        name: "fly",
        reasonToDelay: "Not needed at MVP start.",
        conditionToAdopt: "Need edge deployment for a specific project."
      },
      {
        name: "railway",
        reasonToDelay: "Not needed at MVP start.",
        conditionToAdopt: "Need quick disposable project infra."
      },
      {
        name: "bigquery",
        reasonToDelay: "Event analytics not large enough yet.",
        conditionToAdopt: "Need large-scale event warehousing."
      },
      {
        name: "cloud_run",
        reasonToDelay: "Firebase Functions cover MVP backend needs.",
        conditionToAdopt: "Need long-running containerized services."
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createRealmOSPlatformResources(): InfrastructureResourceRef[] {
  return [
    {
      id: "realmos_firestore",
      realmId: "realm_realmos",
      type: "database",
      provider: "firebase",
      name: "realmos-firestore",
      environment: "production",
      isRealmOSPlatformResource: true,
      isProjectRuntimeResource: false,
      notes: "RealmOS orchestration Firestore — not for project product data."
    },
    {
      id: "realmos_auth",
      realmId: "realm_realmos",
      type: "auth",
      provider: "firebase",
      name: "realmos-auth",
      environment: "production",
      isRealmOSPlatformResource: true,
      isProjectRuntimeResource: false,
      notes: "RealmOS orchestration auth — not for project product users."
    },
    {
      id: "realmos_storage",
      realmId: "realm_realmos",
      type: "storage",
      provider: "firebase",
      name: "realmos-storage",
      environment: "production",
      isRealmOSPlatformResource: true,
      isProjectRuntimeResource: false,
      notes: "RealmOS orchestration storage — not for project product files."
    },
    {
      id: "realmos_functions",
      realmId: "realm_realmos",
      type: "backend",
      provider: "firebase",
      name: "realmos-functions",
      environment: "production",
      isRealmOSPlatformResource: true,
      isProjectRuntimeResource: false,
      notes: "RealmOS orchestration functions — not for project product backend."
    },
    {
      id: "realmos_local_workers",
      realmId: "realm_realmos",
      type: "worker",
      provider: "local",
      name: "realmos-local-workers",
      environment: "local",
      isRealmOSPlatformResource: true,
      isProjectRuntimeResource: false,
      notes: "RealmOS local workers — not for project runtime workers."
    }
  ];
}
