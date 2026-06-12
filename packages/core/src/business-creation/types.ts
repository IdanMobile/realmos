import type {
  Agent,
  AuditEvent,
  Business,
  BusinessType,
  Memory,
  Task,
  WorldMap
} from "@realmos/contracts";

export type CreateBusinessFromIdeaInput = {
  userId: string;
  ideaText: string;
  proposedName?: string;
  businessType?: BusinessType;
};

export type CreateBusinessFromIdeaResult = {
  business: Business;
  agents: Agent[];
  tasks: Task[];
  memories: Memory[];
  auditEvents: AuditEvent[];
  worldMap: WorldMap;
};

export type BusinessCreationStore = {
  createBusiness(business: Business): Promise<Business>;
  updateBusiness(id: string, patch: Partial<Business>): Promise<Business | null>;
  createAgent(agent: Agent): Promise<Agent>;
  createTask(task: Task): Promise<Task>;
  createMemory(memory: Memory): Promise<Memory>;
  appendAuditEvent(event: AuditEvent): Promise<AuditEvent>;
  listBusinesses(): Promise<Business[]>;
  listAgents(): Promise<Agent[]>;
  getWorldMap(): Promise<WorldMap>;
  saveWorldMap(worldMap: WorldMap): Promise<WorldMap>;
};
