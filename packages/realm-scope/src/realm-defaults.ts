import type {
  Realm,
  RealmAccessPolicy,
  RealmEnvironment,
  RepositoryBinding
} from "@realmos/contracts";
import { nowIso } from "./id";

export function createDefaultGlobalRealm(): Realm {
  const timestamp = nowIso();
  return {
    id: "realm_realmos",
    name: "RealmOS Global",
    type: "personal",
    status: "active",
    mission: "Orchestrate Idan Jarvis HQ and ecosystem businesses.",
    ownerUserId: "user_idan",
    memoryScopeId: "memory_global",
    repositoryBindingIds: ["repo_binding_realmos"],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createDefaultProjectRealm(): Realm {
  const timestamp = nowIso();
  return {
    id: "realm_guing",
    name: "GUING",
    type: "software_project",
    status: "building",
    mission: "Design-to-code pipeline product realm.",
    ownerUserId: "user_idan",
    memoryScopeId: "memory_guing",
    repositoryBindingIds: ["repo_binding_guing"],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createDefaultRealmBindings(): RepositoryBinding[] {
  const timestamp = nowIso();
  return [
    {
      id: "repo_binding_realmos",
      realmId: "realm_realmos",
      provider: "github",
      repoName: "realmos",
      repoUrl: "https://github.com/idan/realmos",
      localPath: "realmos/",
      defaultBranch: "main",
      allowedBranches: ["main"],
      packagePaths: ["apps/", "packages/", "docs/"],
      protectedPaths: [".env", "generated/", "node_modules/"],
      ownershipRules: [
        {
          id: "rule_realmos_global",
          repositoryBindingId: "repo_binding_realmos",
          pathPattern: "packages/contracts/**",
          ownerScope: "global",
          ownerRealmId: "realm_realmos",
          allowedAgentIds: ["agent_jarvis"],
          requiresApproval: false
        }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "repo_binding_guing",
      realmId: "realm_guing",
      provider: "github",
      repoName: "guing-product",
      localPath: "../guing-product/",
      defaultBranch: "main",
      allowedBranches: ["main", "develop"],
      packagePaths: ["src/", "app/"],
      protectedPaths: ["infra/production/", ".env"],
      ownershipRules: [
        {
          id: "rule_guing_product",
          repositoryBindingId: "repo_binding_guing",
          pathPattern: "src/**",
          ownerScope: "realm",
          ownerRealmId: "realm_guing",
          allowedAgentIds: ["agent_guing_archi"],
          requiresApproval: true
        }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];
}

export function createDefaultRealmEnvironment(realm: Realm): RealmEnvironment {
  const timestamp = nowIso();
  return {
    id: `env_${realm.id}`,
    realmId: realm.id,
    agentIds: [],
    workflowIds: [],
    taskIds: [],
    memoryScopeId: realm.memoryScopeId,
    communicationThreadIds: [],
    artifactIds: [],
    decisionIds: [],
    repositoryBindingIds: realm.repositoryBindingIds,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createDefaultRealmAccessPolicy(realmId: string): RealmAccessPolicy {
  const timestamp = nowIso();
  return {
    id: `access_${realmId}`,
    realmId,
    allowedGlobalAgentIds: ["agent_jarvis", "agent_necromancer"],
    allowedRealmAgentIds: [],
    crossRealmAccess: [
      {
        fromRealmId: "realm_guing",
        toRealmId: "realm_realmos",
        reason: "Reference global orchestration contracts only.",
        requiresApproval: true
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
