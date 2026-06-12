import type { AuditEvent, Memory } from "@realmos/contracts";
import { createDefaultBusinessTeam } from "./default-team";
import { createInitialBusinessTasks } from "./initial-tasks";
import { makeScopedId, nowIso } from "./id";
import { inferBusinessName, summarizeMission } from "./infer-name";
import type {
  BusinessCreationStore,
  CreateBusinessFromIdeaInput,
  CreateBusinessFromIdeaResult
} from "./types";
import { generateWorldMap } from "./world-map";

function validateInput(input: CreateBusinessFromIdeaInput): void {
  if (!input.userId.trim()) {
    throw new Error("userId is required.");
  }
  if (!input.ideaText.trim()) {
    throw new Error("ideaText is required.");
  }
}

export async function createBusinessFromIdea(
  store: BusinessCreationStore,
  input: CreateBusinessFromIdeaInput
): Promise<CreateBusinessFromIdeaResult> {
  validateInput(input);

  const timestamp = nowIso();
  const businessName = inferBusinessName(input.ideaText, input.proposedName);
  const businessId = makeScopedId("biz", businessName);
  const memoryScopeId = `memscope_${businessId}`;

  const business = await store.createBusiness({
    id: businessId,
    name: businessName,
    mission: summarizeMission(input.ideaText),
    type: input.businessType ?? "startup",
    status: "planning",
    ownerUserId: input.userId,
    agentIds: [],
    taskIds: [],
    memoryScopeId,
    metrics: [],
    risks: [],
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const team = createDefaultBusinessTeam(businessId, businessName);
  const pavelAgentId = team.agents.find((agent) => agent.role === "SpecKit Planner")?.id;
  const rickAgentId = team.agents.find((agent) => agent.role === "Research")?.id;
  const stanAgentId = team.agents.find((agent) => agent.role === "Risk")?.id;

  if (!pavelAgentId || !rickAgentId || !stanAgentId) {
    throw new Error("Default business team is incomplete.");
  }

  const createdAgents = [];
  for (const agent of team.agents) {
    createdAgents.push(await store.createAgent(agent));
  }

  const tasks = createInitialBusinessTasks({
    businessId,
    businessName,
    ideaText: input.ideaText,
    agentIdsByKey: team.agentIdsByKey,
    pavelAgentId,
    rickAgentId,
    stanAgentId
  });

  const createdTasks = [];
  for (const task of tasks) {
    createdTasks.push(await store.createTask(task));
  }

  const updatedBusiness =
    (await store.updateBusiness(businessId, {
      ceoAgentId: team.ceoAgentId,
      agentIds: createdAgents.map((agent) => agent.id),
      taskIds: createdTasks.map((task) => task.id)
    })) ?? business;

  const memoryTemplates: Array<Omit<Memory, "id" | "createdAt" | "updatedAt">> = [
    {
      scope: "business",
      scopeId: memoryScopeId,
      kind: "decision",
      title: "Business created from idea",
      content: input.ideaText,
      source: "conversation",
      sensitivity: "normal",
      retention: "keep"
    },
    {
      scope: "business",
      scopeId: memoryScopeId,
      kind: "summary",
      title: "Default team assigned",
      content: `Created ${createdAgents.map((agent) => agent.name).join(", ")} for ${businessName}.`,
      source: "agent",
      sensitivity: "normal",
      retention: "keep"
    },
    {
      scope: "global",
      scopeId: "global",
      kind: "event",
      title: `New business: ${businessName}`,
      content: `Jarvis created ecosystem business ${businessName} from a user idea.`,
      source: "agent",
      sensitivity: "normal",
      retention: "keep"
    }
  ];

  const createdMemories = [];
  for (const template of memoryTemplates) {
    createdMemories.push(
      await store.createMemory({
        id: makeScopedId("memory", template.title),
        ...template,
        createdAt: timestamp,
        updatedAt: timestamp
      })
    );
  }

  const auditEvents: AuditEvent[] = [];
  const auditTemplates: Array<Omit<AuditEvent, "id" | "createdAt">> = [
    {
      actorType: "user",
      actorId: input.userId,
      businessId,
      eventType: "business_created",
      summary: `Created business ${businessName} from idea`,
      payload: { businessId, ideaText: input.ideaText }
    },
    ...createdAgents.map((agent) => ({
      actorType: "system" as const,
      businessId,
      eventType: "agent_created" as const,
      summary: `Created agent ${agent.name} (${agent.role})`,
      payload: { agentId: agent.id, businessId }
    })),
    ...createdTasks.map((task) => ({
      actorType: "system" as const,
      businessId,
      taskId: task.id,
      eventType: "task_created" as const,
      summary: `Created task ${task.title}`,
      payload: { taskId: task.id, businessId }
    })),
    ...createdMemories.map((memory) => ({
      actorType: "system" as const,
      businessId: memory.scope === "business" ? businessId : undefined,
      eventType: "memory_written" as const,
      summary: `Wrote memory ${memory.title}`,
      payload: { memoryId: memory.id, scope: memory.scope }
    }))
  ];

  for (const template of auditTemplates) {
    auditEvents.push(
      await store.appendAuditEvent({
        id: makeScopedId("audit", template.summary),
        ...template,
        createdAt: timestamp
      })
    );
  }

  const [businesses, agents, existingWorldMap] = await Promise.all([
    store.listBusinesses(),
    store.listAgents(),
    store.getWorldMap()
  ]);

  const worldMap = generateWorldMap({
    existing: existingWorldMap,
    businesses,
    agents,
    tasks: createdTasks
  });
  const savedWorldMap = await store.saveWorldMap(worldMap);

  return {
    business: updatedBusiness,
    agents: createdAgents,
    tasks: createdTasks,
    memories: createdMemories,
    auditEvents,
    worldMap: savedWorldMap
  };
}
