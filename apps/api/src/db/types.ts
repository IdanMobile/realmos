import type {
  Agent,
  AgentMessage,
  ApprovalRequest,
  Artifact,
  AuditEvent,
  Budget,
  Business,
  CapabilitySearchReport,
  CommunicationArchiveEntry,
  CommunicationDecision,
  CommunicationThread,
  ContinuousWorkPolicy,
  CostEntry,
  CursorCompletionReport,
  CursorWorkPacket,
  Memory,
  NextBestWorkDecision,
  Task,
  ToolRunRequest,
  ToolRunResult,
  WorkItem,
  WorldMap
} from "@realmos/contracts";

export type SeedBundle = {
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
  communicationArchives: CommunicationArchiveEntry[];
  artifacts: Artifact[];
  toolRunRequests: ToolRunRequest[];
  toolRunResults: ToolRunResult[];
  continuousWorkPolicy?: ContinuousWorkPolicy;
  workItems?: WorkItem[];
  cursorWorkPackets?: CursorWorkPacket[];
  cursorCompletionReports?: CursorCompletionReport[];
  nextBestWorkDecisions?: NextBestWorkDecision[];
};

export interface RealmOSDatabase {
  listBusinesses(): Promise<Business[]>;
  getBusiness(id: string): Promise<Business | null>;
  createBusiness(business: Business): Promise<Business>;
  updateBusiness(id: string, patch: Partial<Business>): Promise<Business | null>;

  listAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | null>;
  createAgent(agent: Agent): Promise<Agent>;
  updateAgent(id: string, patch: Partial<Agent>): Promise<Agent | null>;

  listTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Task): Promise<Task>;
  updateTask(id: string, patch: Partial<Task>): Promise<Task | null>;

  listMemories(): Promise<Memory[]>;
  getMemory(id: string): Promise<Memory | null>;
  createMemory(memory: Memory): Promise<Memory>;
  updateMemory(id: string, patch: Partial<Memory>): Promise<Memory | null>;
  deleteMemory(id: string): Promise<boolean>;

  listApprovals(): Promise<ApprovalRequest[]>;
  getApproval(id: string): Promise<ApprovalRequest | null>;
  createApproval(approval: ApprovalRequest): Promise<ApprovalRequest>;
  updateApproval(id: string, patch: Partial<ApprovalRequest>): Promise<ApprovalRequest | null>;

  listAuditEvents(): Promise<AuditEvent[]>;
  appendAuditEvent(event: AuditEvent): Promise<AuditEvent>;

  listCostEntries(): Promise<CostEntry[]>;
  createCostEntry(entry: CostEntry): Promise<CostEntry>;
  listBudgets(): Promise<Budget[]>;
  getWorldMap(): Promise<WorldMap>;
  saveWorldMap(worldMap: WorldMap): Promise<WorldMap>;

  listCapabilityReports(): Promise<CapabilitySearchReport[]>;
  appendCapabilityReport(report: CapabilitySearchReport): Promise<CapabilitySearchReport>;

  listCommunicationThreads(): Promise<CommunicationThread[]>;
  getCommunicationThread(id: string): Promise<CommunicationThread | null>;
  createCommunicationThread(thread: CommunicationThread): Promise<CommunicationThread>;
  updateCommunicationThread(
    id: string,
    patch: Partial<CommunicationThread>
  ): Promise<CommunicationThread | null>;

  listCommunicationMessages(): Promise<AgentMessage[]>;
  listCommunicationMessagesByThread(threadId: string): Promise<AgentMessage[]>;
  createCommunicationMessage(message: AgentMessage): Promise<AgentMessage>;

  listCommunicationDecisions(): Promise<CommunicationDecision[]>;
  listCommunicationDecisionsByThread(threadId: string): Promise<CommunicationDecision[]>;
  createCommunicationDecision(decision: CommunicationDecision): Promise<CommunicationDecision>;

  listCommunicationArchives(): Promise<CommunicationArchiveEntry[]>;
  createCommunicationArchive(entry: CommunicationArchiveEntry): Promise<CommunicationArchiveEntry>;

  listArtifacts(): Promise<Artifact[]>;
  listArtifactsByBusiness(businessId: string): Promise<Artifact[]>;
  createArtifact(artifact: Artifact): Promise<Artifact>;

  listToolRunRequests(): Promise<ToolRunRequest[]>;
  getToolRunRequest(id: string): Promise<ToolRunRequest | null>;
  createToolRunRequest(request: ToolRunRequest): Promise<ToolRunRequest>;
  updateToolRunRequest(id: string, patch: Partial<ToolRunRequest>): Promise<ToolRunRequest | null>;
  listToolRunResults(): Promise<ToolRunResult[]>;
  createToolRunResult(result: ToolRunResult): Promise<ToolRunResult>;

  getContinuousWorkPolicy(): Promise<ContinuousWorkPolicy>;
  saveContinuousWorkPolicy(policy: ContinuousWorkPolicy): Promise<ContinuousWorkPolicy>;
  listWorkItems(): Promise<WorkItem[]>;
  getWorkItem(id: string): Promise<WorkItem | null>;
  createWorkItem(item: WorkItem): Promise<WorkItem>;
  updateWorkItem(id: string, patch: Partial<WorkItem>): Promise<WorkItem | null>;
  listCursorWorkPackets(): Promise<CursorWorkPacket[]>;
  getCursorWorkPacket(id: string): Promise<CursorWorkPacket | null>;
  createCursorWorkPacket(packet: CursorWorkPacket): Promise<CursorWorkPacket>;
  updateCursorWorkPacket(id: string, patch: Partial<CursorWorkPacket>): Promise<CursorWorkPacket | null>;
  listCursorCompletionReports(): Promise<CursorCompletionReport[]>;
  createCursorCompletionReport(report: CursorCompletionReport): Promise<CursorCompletionReport>;
  listNextBestWorkDecisions(): Promise<NextBestWorkDecision[]>;
  appendNextBestWorkDecision(decision: NextBestWorkDecision): Promise<NextBestWorkDecision>;

  loadSeed(bundle: SeedBundle): Promise<void>;
}
