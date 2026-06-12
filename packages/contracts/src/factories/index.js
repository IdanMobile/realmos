const VALID_WORLD_REF_TYPES = ["business", "agent", "task", "metric"];
function nowIso() {
    return new Date().toISOString();
}
function defaultModelProfile() {
    return {
        defaultModelClass: "local_simple",
        allowOnline: false,
        allowLocal: true
    };
}
export function createMockBusiness(overrides = {}) {
    const timestamp = nowIso();
    return {
        id: "business_mock",
        name: "Mock Business",
        mission: "Validate RealmOS contract factories.",
        type: "software_project",
        status: "idea",
        ownerUserId: "user_idan",
        agentIds: [],
        taskIds: [],
        memoryScopeId: "memory_business_mock",
        metrics: [],
        risks: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        ...overrides
    };
}
export function createMockAgent(overrides = {}) {
    const timestamp = nowIso();
    return {
        id: "agent_mock",
        name: "Mock Agent",
        role: "assistant",
        scope: "business",
        businessId: "business_mock",
        directive: "Support RealmOS development safely.",
        skills: [],
        limitations: ["No autonomous spending", "No external messaging"],
        tools: [],
        memoryAccess: [],
        modelProfile: defaultModelProfile(),
        canCreateAgents: false,
        canExecuteCode: false,
        canSpendMoney: false,
        canContactHumans: false,
        status: "draft",
        createdAt: timestamp,
        updatedAt: timestamp,
        ...overrides
    };
}
export function createMockApprovalRequest(overrides = {}) {
    return {
        id: "approval_mock",
        actionType: "other",
        riskLevel: "medium",
        title: "Mock approval request",
        description: "Requires human review before execution.",
        payload: {},
        status: "pending",
        createdAt: nowIso(),
        ...overrides
    };
}
export function createMockMemory(scope, scopeId, overrides = {}) {
    if (!scope || !scopeId.trim()) {
        throw new Error("Memory requires an explicit scope and scopeId.");
    }
    const timestamp = nowIso();
    return {
        id: "memory_mock",
        scope,
        scopeId,
        kind: "knowledge",
        title: "Mock memory entry",
        content: "Scoped memory for contract tests.",
        source: "manual",
        sensitivity: "normal",
        retention: "keep",
        createdAt: timestamp,
        updatedAt: timestamp,
        ...overrides
    };
}
export function createMockWorldNode(overrides = {}) {
    if (overrides.refType && !VALID_WORLD_REF_TYPES.includes(overrides.refType)) {
        throw new Error(`WorldNode refType must be one of: ${VALID_WORLD_REF_TYPES.join(", ")}`);
    }
    return {
        id: "world_node_mock",
        kind: "agent_desk",
        label: "Mock World Node",
        status: "healthy",
        ...overrides
    };
}
export function createMockTask(overrides = {}) {
    const timestamp = nowIso();
    return {
        id: "task_mock",
        businessId: "business_mock",
        title: "Mock task",
        goal: "Validate task contract defaults.",
        status: "todo",
        priority: "medium",
        requiresApproval: false,
        dependencies: [],
        artifacts: [],
        auditEventIds: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        ...overrides
    };
}
export function createMockRun(overrides = {}) {
    return {
        id: "run_mock",
        requestedBy: { actorType: "system" },
        kind: "governance_check",
        status: "queued",
        startedAt: nowIso(),
        eventIds: [],
        outputArtifactIds: [],
        ...overrides
    };
}
export function createMockAuditEvent(overrides = {}) {
    return {
        id: "audit_mock",
        actorType: "system",
        eventType: "policy_blocked",
        summary: "Mock audit event",
        payload: {},
        createdAt: nowIso(),
        ...overrides
    };
}
export function createMockBudget(overrides = {}) {
    const timestamp = nowIso();
    return {
        id: "budget_mock",
        scope: "global",
        scopeId: "global",
        currency: "USD",
        createdAt: timestamp,
        updatedAt: timestamp,
        ...overrides
    };
}
export function createMockCostEntry(overrides = {}) {
    return {
        id: "cost_mock",
        provider: "local",
        amount: 0,
        currency: "USD",
        metadata: {},
        createdAt: nowIso(),
        ...overrides
    };
}
export function createMockArtifact(overrides = {}) {
    return {
        id: "artifact_mock",
        kind: "spec",
        title: "Mock artifact",
        metadata: {},
        createdAt: nowIso(),
        ...overrides
    };
}
export function createMockWorldMap(overrides = {}) {
    return {
        id: "world_map_mock",
        title: "Mock World Map",
        version: "1.0.0",
        nodes: [],
        edges: [],
        updatedAt: nowIso(),
        ...overrides
    };
}
