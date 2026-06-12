import type {
  Agent,
  AgentMessage,
  ApprovalRequest,
  Artifact,
  AuditEvent,
  Budget,
  Business,
  CapabilitySearchReport,
  CommunicationDecision,
  CommunicationThread,
  CostEntry,
  Memory,
  ModelRoutingDecision,
  OptimizationReport,
  Task,
  ToolRunRequest,
  ToolRunResult,
  WorldMap
} from "@realmos/contracts";
import type { CommunicationAnalyticsSnapshot } from "@realmos/core";
import { runSystemOptimizer, scoutModelForUseCase } from "@realmos/intelligence";
import { createDefaultContinuousWorkPolicy } from "@realmos/work-loop";
import { createDefaultFleet, createDefaultFleetCapacityPolicy } from "@realmos/fleet-control";
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
import type { WorkLoopConsoleData } from "@/components/panels/SelfBuildConsolePanel";
import type { FleetConsoleData } from "@/components/panels/FleetControlPanel";
import type { RepositoryConsoleData } from "@/components/panels/RepositoryBoundaryPanel";
import type { PlatformInfraConsoleData } from "@/components/panels/ProjectInfrastructurePanel";

import seedJson from "../../../../../mock-data/seed.json";
import worldMapJson from "../../../../../mock-data/world-map.sample.json";

export type BriefingItem = {
  id: string;
  label: string;
  detail: string;
  tone?: "info" | "warning" | "success";
};

export type QuickAction = {
  id: string;
  label: string;
};

export type DashboardMockData = {
  businesses: Business[];
  agents: Agent[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  budgets: Budget[];
  costEntries: CostEntry[];
  memories: Memory[];
  auditEvents: AuditEvent[];
  worldMap: WorldMap;
  capabilityReports: CapabilitySearchReport[];
  communicationThreads: CommunicationThread[];
  communicationMessages: AgentMessage[];
  communicationDecisions: CommunicationDecision[];
  communicationAnalytics: CommunicationAnalyticsSnapshot;
  artifacts: Artifact[];
  optimizationReport: OptimizationReport;
  modelRoutingDecision: ModelRoutingDecision;
  knowledgeVaultNotes: string[];
  toolRunRequests: ToolRunRequest[];
  toolRunResults: ToolRunResult[];
  workLoop: WorkLoopConsoleData;
  fleet: FleetConsoleData;
  realm: RepositoryConsoleData;
  platformInfra: PlatformInfraConsoleData;
  briefing: {
    greeting: string;
    items: BriefingItem[];
    quickActions: QuickAction[];
  };
};

type SeedFile = {
  businesses: Business[];
  agents: Agent[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  budgets: Budget[];
  costEntries: CostEntry[];
  memories: Memory[];
  auditEvents: AuditEvent[];
};

function createMockFleetConsole(): FleetConsoleData {
  const timestamp = new Date().toISOString();
  const fleet = createDefaultFleet();
  const capacityPolicy = createDefaultFleetCapacityPolicy();
  return {
    fleet,
    capacityPolicy,
    squads: [
      {
        id: "squad_backend",
        fleetId: fleet.id,
        name: "Backend Lane",
        lane: "backend",
        supervisorAgentId: "agent_jarvis",
        agentIds: ["agent_alex_backend"],
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: "squad_frontend",
        fleetId: fleet.id,
        name: "Frontend Lane",
        lane: "frontend",
        supervisorAgentId: "agent_jarvis",
        agentIds: ["agent_ui_builder"],
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ],
    fleetRuns: [],
    parallelWorkPlans: [],
    workConflicts: [],
    activeRunCount: 0,
    latestPlan: null,
    executionEnabled: false
  };
}

function createMockRealmConsole(): RepositoryConsoleData {
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

function createMockPlatformInfraConsole(): PlatformInfraConsoleData {
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

export function loadMockDashboard(): DashboardMockData {
  const seed = seedJson as SeedFile;
  const pendingApprovals = seed.approvals.filter((approval) => approval.status === "pending").length;
  const onlineCostUsd = seed.costEntries
    .filter((entry) => entry.provider !== "ollama")
    .reduce((sum, entry) => sum + entry.amount, 0);

  return {
    businesses: seed.businesses,
    agents: seed.agents,
    tasks: seed.tasks,
    approvals: seed.approvals,
    budgets: seed.budgets,
    costEntries: seed.costEntries,
    memories: seed.memories,
    auditEvents: seed.auditEvents,
    worldMap: worldMapJson as WorldMap,
    capabilityReports: [],
    communicationThreads: [],
    communicationMessages: [],
    communicationDecisions: [],
    communicationAnalytics: {
      threadCount: 0,
      openThreadCount: 0,
      messageCount: 0,
      blockerCount: 0,
      errorCount: 0,
      decisionCount: 0,
      threadsWithBlockers: [],
      threadsWithErrors: []
    },
    artifacts: [],
    optimizationReport: runSystemOptimizer({
      scope: "global",
      onlineCostUsd,
      tokenBaseline: 2400,
      tokenPackEstimate: 800
    }),
    modelRoutingDecision: scoutModelForUseCase({
      useCase: "complex_reasoning",
      allowPaid: true
    }).decision,
    knowledgeVaultNotes: [
      "Obsidian integration is optional and disabled by default.",
      "Database-only vault is active for MVP memory storage."
    ],
    toolRunRequests: [
      {
        id: "tool_req_mock_1",
        kind: "filesystem_draft",
        tool: "filesystem",
        title: "Draft business spec",
        payload: { path: "specs/draft.md", content: "Draft content" },
        status: "dry_run",
        riskLevel: "low",
        dryRun: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "tool_req_mock_2",
        kind: "terminal_command",
        tool: "terminal",
        title: "Run tests",
        payload: { command: "pnpm test" },
        status: "pending_approval",
        riskLevel: "high",
        approvalId: "approval_test",
        dryRun: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    toolRunResults: [
      {
        id: "tool_res_mock_1",
        requestId: "tool_req_mock_1",
        status: "dry_run",
        output: "[dry-run] filesystem draft writer\npath: specs/draft.md",
        createdAt: new Date().toISOString()
      }
    ],
    workLoop: {
      policy: createDefaultContinuousWorkPolicy(),
      workItems: [
        {
          id: "work_phase_6_8",
          title: "Phase 6.8 — Parallel Agent Fleet contracts",
          businessId: "realm_os",
          status: "ready",
          priority: "high",
          riskLevel: "low",
          executionMode: "cursor",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "work_online_models",
          title: "Configure billing for online model providers",
          businessId: "realm_os",
          status: "candidate",
          priority: "normal",
          riskLevel: "medium",
          requiredApproval: true,
          executionMode: "human",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      cursorWorkPackets: [],
      cursorCompletionReports: [],
      latestDecision: null,
      pendingHumanItems: []
    },
    fleet: createMockFleetConsole(),
    realm: createMockRealmConsole(),
    platformInfra: createMockPlatformInfraConsole(),
    briefing: {
      greeting: "Good afternoon, Idan.",
      items: [
        {
          id: "brief_1",
          label: "Command Center online",
          detail: "Mock dashboard loaded with ecosystem state.",
          tone: "success"
        },
        {
          id: "brief_2",
          label: `${pendingApprovals} approvals waiting`,
          detail: "Review the approval queue before enabling risky capabilities.",
          tone: pendingApprovals > 0 ? "warning" : "info"
        },
        {
          id: "brief_3",
          label: "Next safe work",
          detail: "Finish dashboard panels, then prepare governance kernel phase.",
          tone: "info"
        }
      ],
      quickActions: [
        { id: "qa_brief", label: "Daily briefing" },
        { id: "qa_approvals", label: "Review approvals" },
        { id: "qa_world", label: "Open world preview" }
      ]
    }
  };
}

export function createEmptyDashboard(): DashboardMockData {
  return {
    businesses: [],
    agents: [],
    tasks: [],
    approvals: [],
    budgets: [],
    costEntries: [],
    memories: [],
    auditEvents: [],
    worldMap: {
      id: "world_empty",
      title: "Empty World",
      version: "0.0.0",
      nodes: [],
      edges: [],
      updatedAt: new Date().toISOString()
    },
    capabilityReports: [],
    communicationThreads: [],
    communicationMessages: [],
    communicationDecisions: [],
    communicationAnalytics: {
      threadCount: 0,
      openThreadCount: 0,
      messageCount: 0,
      blockerCount: 0,
      errorCount: 0,
      decisionCount: 0,
      threadsWithBlockers: [],
      threadsWithErrors: []
    },
    artifacts: [],
    optimizationReport: runSystemOptimizer({ scope: "global" }),
    modelRoutingDecision: scoutModelForUseCase({ useCase: "simple_tasks", preferLocal: true }).decision,
    knowledgeVaultNotes: ["Knowledge vault not configured."],
    toolRunRequests: [],
    toolRunResults: [],
    workLoop: {
      policy: createDefaultContinuousWorkPolicy(),
      workItems: [
        {
          id: "work_mock_1",
          title: "Phase 6.8 — Parallel Agent Fleet contracts",
          businessId: "realm_os",
          status: "ready",
          priority: "high",
          riskLevel: "low",
          executionMode: "cursor",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      cursorWorkPackets: [],
      cursorCompletionReports: [],
      latestDecision: null,
      pendingHumanItems: []
    },
    fleet: createMockFleetConsole(),
    realm: createMockRealmConsole(),
    platformInfra: createMockPlatformInfraConsole(),
    briefing: {
      greeting: "No data loaded",
      items: [],
      quickActions: []
    }
  };
}
