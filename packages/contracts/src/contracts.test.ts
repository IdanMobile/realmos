import { describe, expect, it } from "vitest";
import type { CapabilitySearchReport } from "./capability";
import type { CommunicationArchiveEntry, AgentMessage, CommunicationThread } from "./communication";
import type { CreationProposal } from "./creation";
import type { FleetCapacityPolicy, FleetRun, ParallelWorkPlan } from "./fleet";
import type { ContinuousWorkPolicy, NextBestWorkDecision, WorkItem } from "./work-loop";
import type { Realm, RealmEnvironment, RealmAccessPolicy } from "./realm";
import type { CursorRepositoryContext, RepositoryBinding, RepositoryConflict } from "./repository";
import type { RealmOSPlatformDecision } from "./platform";
import type {
  InfrastructureIsolationViolation,
  InfrastructureResourceRef,
  ProjectInfrastructurePlan,
  TemporaryPrototypeInfrastructureApproval
} from "./project-infrastructure";

describe("creation proposal contract", () => {
  it("can represent deterministic module instead of forcing an AI agent", () => {
    const proposal: CreationProposal = {
      id: "creation_test",
      requestedBy: "agent_necromancer",
      needSummary: "Validate approval policy rules",
      recommendedCreationType: "deterministic_module",
      reasoningRequired: false,
      repeatability: "recurring",
      riskLevel: "medium",
      costProfile: "free_local",
      approvalRequired: false,
      proposedOwner: "deterministic_engineer",
      whyNotSimpler: "A tested pure function is simpler and safer than an AI agent.",
      acceptanceCriteria: ["Policy tests pass", "No LLM required"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(proposal.recommendedCreationType).toBe("deterministic_module");
  });
});

describe("capability scout contracts", () => {
  it("can represent a build-vs-buy capability decision", () => {
    const report: CapabilitySearchReport = {
      id: "capability_report_test",
      needSummary: "Find a safe workflow tool for scheduled reports",
      searchedSources: ["internal", "n8n_node", "api_saas"],
      candidates: [
        {
          id: "candidate_n8n",
          name: "n8n scheduled workflow",
          source: "n8n_node",
          summary: "Use n8n cron and integrations for scheduled reports.",
          fitScore: 88,
          costProfile: "free",
          requiresSubscription: false,
          requiresApproval: false,
          permissionsRequired: [],
          integrationEffort: "low",
          riskLevel: "low",
          maintenanceSignal: "high",
          recommendation: "automate_with_n8n",
          reasoning: "A repeatable workflow is better as automation than an AI agent."
        }
      ],
      buildVsBuyDecision: "use_existing",
      createdAt: new Date().toISOString()
    };

    expect(report.buildVsBuyDecision).toBe("use_existing");
  });
});

describe("communication contracts", () => {
  it("stores agent messages inside structured threads", () => {
    const thread: CommunicationThread = {
      id: "thread_test",
      type: "task_thread",
      businessId: "biz_realm_os",
      taskId: "task_api",
      title: "API contract discussion",
      status: "open",
      priority: "high",
      participantAgentIds: ["agent_alex", "agent_archi"],
      createdByAgentId: "agent_alex",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const message: AgentMessage = {
      id: "message_test",
      threadId: thread.id,
      fromAgentId: "agent_alex",
      toAgentId: "agent_archi",
      businessId: "biz_realm_os",
      taskId: "task_api",
      type: "blocker",
      priority: "high",
      subject: "Missing approval field",
      body: "The API contract is missing approvalRequired.",
      requiresResponse: true,
      artifactRefs: [],
      memoryRefs: [],
      createdAt: new Date().toISOString()
    };

    expect(message.threadId).toBe(thread.id);
    expect(message.type).toBe("blocker");
  });

  it("can archive communication summaries without deleting raw thread references", () => {
    const archive: CommunicationArchiveEntry = {
      id: "archive_test",
      threadId: "thread_test",
      archivePath: "vault/communications/thread_test.md",
      summary: "API contract blocker was resolved.",
      tokenEstimate: 120,
      messageCount: 4,
      decisionCount: 1,
      errorCount: 0,
      blockerCount: 1,
      createdAt: new Date().toISOString()
    };

    expect(archive.messageCount).toBe(4);
    expect(archive.blockerCount).toBe(1);
  });
});

describe("always-on work loop contracts", () => {
  it("allows safe work to continue without user start", () => {
    const policy: ContinuousWorkPolicy = {
      id: "policy_safe_auto_prepare",
      autonomyLevel: "auto_prepare",
      safeWorkEnabled: true,
      maxRiskWithoutApproval: "low",
      requireApprovalForCost: true,
      requireApprovalForExternalActions: true,
      requireApprovalForDestructiveActions: true,
      requireStopCheckBeforePhaseAdvance: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const work: WorkItem = {
      id: "work_generate_packet",
      title: "Generate Cursor work packet",
      businessId: "realm_os",
      status: "ready",
      priority: "high",
      riskLevel: "low",
      executionMode: "cursor",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(policy.safeWorkEnabled).toBe(true);
    expect(policy.autonomyLevel).toBe("auto_prepare");
    expect(work.riskLevel).toBe("low");
  });

  it("can decide to ask the user only when required", () => {
    const decision: NextBestWorkDecision = {
      id: "decision_wait_approval",
      decision: "request_approval",
      rationale: "The next work item requires critical user approval.",
      consideredWorkItemIds: ["work_high_risk"],
      createdAt: new Date().toISOString()
    };

    expect(decision.decision).toBe("request_approval");
  });
});

describe("fleet control contracts", () => {
  it("supports multiple controlled parallel runs", () => {
    const policy: FleetCapacityPolicy = {
      id: "fleet_policy_default",
      maxConcurrentRuns: 5,
      maxConcurrentRunsPerBusiness: 3,
      maxConcurrentRunsPerLane: {
        backend: 2,
        frontend: 2,
        qa: 2,
        docs: 1
      },
      maxTokensPerHour: 1_000_000,
      requireApprovalAboveRisk: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const run: FleetRun = {
      id: "fleet_run_backend_contracts",
      fleetId: "fleet_realm_os",
      workItemId: "work_backend_contracts",
      lane: "backend",
      coordinationMode: "parallel",
      status: "running",
      assignedAgentIds: ["agent_alex_backend"],
      conflicts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(policy.maxConcurrentRuns).toBeGreaterThan(1);
    expect(run.coordinationMode).toBe("parallel");
  });

  it("represents dependency-aware parallel work plans", () => {
    const plan: ParallelWorkPlan = {
      id: "parallel_plan_ui_backend_qa",
      title: "Build contracts, UI shell, and QA checks",
      fleetId: "fleet_realm_os",
      coordinationMode: "parallel",
      workItemIds: ["work_contracts", "work_ui_shell", "work_qa_checks"],
      dependencyEdges: [{ fromWorkItemId: "work_contracts", toWorkItemId: "work_qa_checks" }],
      conflictIds: [],
      approvalRequired: false,
      rationale: "UI shell and backend contracts can progress in parallel; QA depends on contracts.",
      createdAt: new Date().toISOString()
    };

    expect(plan.workItemIds).toHaveLength(3);
    expect(plan.dependencyEdges).toHaveLength(1);
  });
});


describe("realm scoping contracts", () => {
  it("separates a project realm from the global layer", () => {
    const realm: Realm = {
      id: "realm_guing",
      name: "GUING",
      type: "software_project",
      status: "building",
      mission: "Pixel-perfect design-to-code pipeline.",
      ownerUserId: "user_idan",
      memoryScopeId: "memory_guing",
      repositoryBindingIds: ["repo_guing_product", "repo_guing_brain"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const environment: RealmEnvironment = {
      id: "env_guing",
      realmId: realm.id,
      agentIds: ["agent_guing_archi", "agent_guing_qa"],
      workflowIds: ["workflow_generate_spec"],
      taskIds: ["task_runtime_adapter"],
      memoryScopeId: "memory_guing",
      communicationThreadIds: ["thread_guing_runtime"],
      artifactIds: ["artifact_guing_spec"],
      decisionIds: ["decision_guing_runtime"],
      repositoryBindingIds: realm.repositoryBindingIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(environment.realmId).toBe(realm.id);
    expect(environment.repositoryBindingIds).toHaveLength(2);
  });

  it("requires explicit cross-realm access policy", () => {
    const policy: RealmAccessPolicy = {
      id: "access_guing",
      realmId: "realm_guing",
      allowedGlobalAgentIds: ["agent_jarvis", "agent_system_optimizer"],
      allowedRealmAgentIds: ["agent_guing_archi"],
      crossRealmAccess: [
        {
          fromRealmId: "realm_guing",
          toRealmId: "realm_realmos",
          reason: "Reference global UI shell contracts.",
          requiresApproval: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(policy.crossRealmAccess[0].requiresApproval).toBe(true);
  });
});

describe("repository boundary contracts", () => {
  it("binds repositories to specific realms", () => {
    const binding: RepositoryBinding = {
      id: "repo_guing_product",
      realmId: "realm_guing",
      provider: "github",
      repoName: "guing-product",
      defaultBranch: "main",
      allowedBranches: ["main", "feature/*"],
      packagePaths: ["plugin/"],
      protectedPaths: [".github/**", ".env*"],
      ownershipRules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const context: CursorRepositoryContext = {
      repositoryBindingId: binding.id,
      repoName: binding.repoName,
      branchName: "feature/ui-layer-export",
      allowedPaths: ["plugin/**"],
      forbiddenPaths: [".env*", ".github/**"],
      verificationCommands: ["pnpm test", "pnpm typecheck"]
    };

    expect(binding.realmId).toBe("realm_guing");
    expect(context.forbiddenPaths).toContain(".env*");
  });

  it("can block cross-realm repository conflicts", () => {
    const conflict: RepositoryConflict = {
      id: "repo_conflict_cross_realm",
      repositoryBindingId: "repo_realmos",
      conflictType: "cross_realm_boundary",
      workItemIds: ["work_guing_edit_realmos"],
      severity: "critical",
      resolution: "requires_approval",
      rationale: "GUING-scoped work attempts to edit global RealmOS repository paths.",
      createdAt: new Date().toISOString()
    };

    expect(conflict.resolution).toBe("requires_approval");
  });
});


describe("platform decision contracts", () => {
  it("locks Firebase, M2 MacBook, GitHub, and Ollama as the baseline", () => {
    const decision: RealmOSPlatformDecision = {
      id: "platform_baseline_v1",
      cloudPlatform: "firebase",
      localNodeRuntime: "m2_macbook_16gb",
      sourceControl: "github",
      localLLMRuntime: "ollama",
      status: "selected",
      rationale: "Minimize operational surface for a self-sustained RealmOS MVP.",
      delayedPlatforms: [
        { name: "neon", reasonToDelay: "Do not add Postgres until Firestore is painful.", conditionToAdopt: "Need SQL analytics or complex relational reporting." },
        { name: "vercel", reasonToDelay: "Firebase Hosting/App Hosting is the default.", conditionToAdopt: "Need Vercel-specific preview or Next.js workflow." }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(decision.cloudPlatform).toBe("firebase");
    expect(decision.localNodeRuntime).toBe("m2_macbook_16gb");
    expect(decision.sourceControl).toBe("github");
    expect(decision.localLLMRuntime).toBe("ollama");
  });
});

describe("project infrastructure isolation contracts", () => {
  it("separates RealmOS orchestration infrastructure from project runtime infrastructure", () => {
    const projectDb: InfrastructureResourceRef = {
      id: "guing_project_db",
      realmId: "realm_guing",
      type: "database",
      provider: "gcp",
      name: "guing-dedicated-db",
      environment: "production",
      isRealmOSPlatformResource: false,
      isProjectRuntimeResource: true
    };

    const plan: ProjectInfrastructurePlan = {
      id: "guing_infra_plan",
      realmId: "realm_guing",
      mode: "dedicated_project_infra",
      status: "approved",
      appDatabase: projectDb,
      notes: "GUING uses dedicated runtime infrastructure. RealmOS only stores orchestration metadata.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(plan.appDatabase?.isProjectRuntimeResource).toBe(true);
    expect(plan.appDatabase?.isRealmOSPlatformResource).toBe(false);
  });

  it("represents violations when project runtime uses RealmOS platform resources", () => {
    const violation: InfrastructureIsolationViolation = {
      id: "violation_project_uses_realmos_db",
      realmId: "realm_guing",
      violationType: "project_uses_realmos_database",
      severity: "critical",
      rationale: "GUING production app data cannot be stored in RealmOS Firestore.",
      allowedOnlyIfTemporaryPrototype: true,
      requiresUserApproval: true,
      createdAt: new Date().toISOString()
    };

    expect(violation.requiresUserApproval).toBe(true);
    expect(violation.allowedOnlyIfTemporaryPrototype).toBe(true);
  });

  it("allows temporary prototype infrastructure only with approval and exit plan", () => {
    const approval: TemporaryPrototypeInfrastructureApproval = {
      id: "tmp_proto_guing",
      realmId: "realm_guing",
      resourceIds: ["realmos_firestore_mock_collection"],
      reason: "Temporary prototype before dedicated GUING infrastructure exists.",
      exitPlan: "Replace mock collection with dedicated GUING database before production.",
      approvedByUserId: "user_idan",
      createdAt: new Date().toISOString()
    };

    expect(approval.exitPlan).toContain("dedicated GUING database");
  });
});
