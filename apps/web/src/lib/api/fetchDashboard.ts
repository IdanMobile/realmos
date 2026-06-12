import type { DashboardMockData } from "@/lib/mock/loadMockDashboard";
import type { FleetConsoleData } from "@/components/panels/FleetControlPanel";
import type { PlatformInfraConsoleData } from "@/components/panels/ProjectInfrastructurePanel";
import type { RepositoryConsoleData } from "@/components/panels/RepositoryBoundaryPanel";
import type { WorkLoopConsoleData } from "@/components/panels/SelfBuildConsolePanel";
import { createDefaultFleet, createDefaultFleetCapacityPolicy } from "@realmos/fleet-control";
import { runSystemOptimizer, scoutModelForUseCase } from "@realmos/intelligence";
import {
  createDefaultGlobalRealm,
  createDefaultProjectRealm,
  createDefaultRealmAccessPolicy,
  createDefaultRealmBindings,
  createDefaultRealmEnvironment,
  GLOBAL_SHELL_ROUTES,
  projectShellRoutes
} from "@realmos/realm-scope";
import {
  createDefaultGuingInfrastructurePlan,
  createDefaultPlatformDecision,
  createRealmOSPlatformResources,
  FIREBASE_BASELINE_CONFIG,
  GITHUB_SOURCE_CONTROL_CONFIG,
  M1_PRO_LOCAL_NODE_CONFIG,
  OLLAMA_LOCAL_LLM_CONFIG
} from "@realmos/platform-infra";
import { createDefaultContinuousWorkPolicy } from "@realmos/work-loop";
import { getApiBaseUrl } from "./client";

const EMPTY_FLEET: FleetConsoleData = {
  fleet: createDefaultFleet(),
  capacityPolicy: createDefaultFleetCapacityPolicy(),
  squads: [],
  fleetRuns: [],
  parallelWorkPlans: [],
  workConflicts: [],
  activeRunCount: 0,
  latestPlan: null,
  executionEnabled: false
};

const EMPTY_WORK_LOOP: WorkLoopConsoleData = {
  policy: createDefaultContinuousWorkPolicy(),
  workItems: [],
  cursorWorkPackets: [],
  cursorCompletionReports: [],
  latestDecision: null,
  pendingHumanItems: []
};

function createEmptyRealmConsole(): RepositoryConsoleData {
  const globalRealm = createDefaultGlobalRealm();
  const projectRealm = createDefaultProjectRealm();
  return {
    realms: [globalRealm, projectRealm],
    environments: [
      createDefaultRealmEnvironment(globalRealm),
      createDefaultRealmEnvironment(projectRealm)
    ],
    accessPolicies: [
      createDefaultRealmAccessPolicy(globalRealm.id),
      createDefaultRealmAccessPolicy(projectRealm.id)
    ],
    repositoryBindings: createDefaultRealmBindings(),
    repositoryConflicts: [],
    globalShellRoutes: GLOBAL_SHELL_ROUTES,
    projectShellRoutes: projectShellRoutes(projectRealm.id, projectRealm.name)
  };
}

const EMPTY_REALM = createEmptyRealmConsole();

function createEmptyPlatformInfraConsole(): PlatformInfraConsoleData {
  return {
    platformDecision: createDefaultPlatformDecision(),
    realmOSPlatformResources: createRealmOSPlatformResources(),
    projectInfrastructurePlans: [createDefaultGuingInfrastructurePlan()],
    prototypeApprovals: [],
    isolationViolations: [],
    firebaseConfig: FIREBASE_BASELINE_CONFIG,
    localNodeConfig: M1_PRO_LOCAL_NODE_CONFIG,
    githubConfig: GITHUB_SOURCE_CONTROL_CONFIG,
    ollamaConfig: OLLAMA_LOCAL_LLM_CONFIG
  };
}

const EMPTY_PLATFORM_INFRA = createEmptyPlatformInfraConsole();

const EMPTY_ANALYTICS: DashboardMockData["communicationAnalytics"] = {
  threadCount: 0,
  openThreadCount: 0,
  messageCount: 0,
  blockerCount: 0,
  errorCount: 0,
  decisionCount: 0,
  threadsWithBlockers: [],
  threadsWithErrors: []
};

export function normalizeDashboardData(raw: Partial<DashboardMockData>): DashboardMockData {
  const onlineCostUsd = (raw.costEntries ?? [])
    .filter((entry) => entry.provider !== "ollama")
    .reduce((sum, entry) => sum + entry.amount, 0);

  return {
    businesses: raw.businesses ?? [],
    agents: raw.agents ?? [],
    tasks: raw.tasks ?? [],
    approvals: raw.approvals ?? [],
    budgets: raw.budgets ?? [],
    costEntries: raw.costEntries ?? [],
    memories: raw.memories ?? [],
    auditEvents: raw.auditEvents ?? [],
    worldMap: raw.worldMap ?? {
      id: "world_empty",
      title: "Empty World",
      version: "0.0.0",
      nodes: [],
      edges: [],
      updatedAt: new Date().toISOString()
    },
    capabilityReports: raw.capabilityReports ?? [],
    communicationThreads: raw.communicationThreads ?? [],
    communicationMessages: raw.communicationMessages ?? [],
    communicationDecisions: raw.communicationDecisions ?? [],
    communicationAnalytics: raw.communicationAnalytics ?? EMPTY_ANALYTICS,
    artifacts: raw.artifacts ?? [],
    toolRunRequests: raw.toolRunRequests ?? [],
    toolRunResults: raw.toolRunResults ?? [],
    optimizationReport:
      raw.optimizationReport ??
      runSystemOptimizer({ scope: "global", onlineCostUsd, tokenBaseline: 2400, tokenPackEstimate: 800 }),
    modelRoutingDecision:
      raw.modelRoutingDecision ??
      scoutModelForUseCase({ useCase: "simple_tasks", preferLocal: true }).decision,
    knowledgeVaultNotes: raw.knowledgeVaultNotes ?? ["Database-only vault is active for MVP memory storage."],
    workLoop: raw.workLoop ?? EMPTY_WORK_LOOP,
    fleet: raw.fleet ?? EMPTY_FLEET,
    realm: raw.realm ?? EMPTY_REALM,
    platformInfra: raw.platformInfra ?? EMPTY_PLATFORM_INFRA,
    briefing: raw.briefing ?? {
      greeting: "Good afternoon, Idan.",
      items: [],
      quickActions: []
    }
  };
}

export async function fetchDashboardFromApi(baseUrl = getApiBaseUrl()): Promise<DashboardMockData | null> {
  try {
    const response = await fetch(`${baseUrl}/api/dashboard`, { cache: "no-store" });
    if (!response.ok) return null;
    const raw = (await response.json()) as Partial<DashboardMockData>;
    return normalizeDashboardData(raw);
  } catch {
    return null;
  }
}
