import type {
  AgentMessage,
  CommunicationArchiveEntry,
  CommunicationDecision,
  CommunicationThread
} from "@realmos/contracts";

export type CommunicationLedgerStore = {
  listThreads(): Promise<CommunicationThread[]>;
  getThread(id: string): Promise<CommunicationThread | null>;
  createThread(thread: CommunicationThread): Promise<CommunicationThread>;
  updateThread(id: string, patch: Partial<CommunicationThread>): Promise<CommunicationThread | null>;

  listMessages(): Promise<AgentMessage[]>;
  listMessagesByThread(threadId: string): Promise<AgentMessage[]>;
  createMessage(message: AgentMessage): Promise<AgentMessage>;

  listDecisions(): Promise<CommunicationDecision[]>;
  listDecisionsByThread(threadId: string): Promise<CommunicationDecision[]>;
  createDecision(decision: CommunicationDecision): Promise<CommunicationDecision>;

  listArchives(): Promise<CommunicationArchiveEntry[]>;
  createArchive(entry: CommunicationArchiveEntry): Promise<CommunicationArchiveEntry>;
};

export type CommunicationAnalyticsSnapshot = {
  threadCount: number;
  openThreadCount: number;
  messageCount: number;
  blockerCount: number;
  errorCount: number;
  decisionCount: number;
  threadsWithBlockers: string[];
  threadsWithErrors: string[];
};
