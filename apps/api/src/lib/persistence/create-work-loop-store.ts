import type {
  ContinuousWorkPolicy,
  CursorCompletionReport,
  CursorWorkPacket,
  NextBestWorkDecision,
  WorkItem
} from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";
import { createDefaultWorkLoopSeed } from "../work-loop-seed";

export type WorkLoopStore = {
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
  resetFromSeed(bundle: {
    continuousWorkPolicy?: ContinuousWorkPolicy;
    workItems?: WorkItem[];
    cursorWorkPackets?: CursorWorkPacket[];
    cursorCompletionReports?: CursorCompletionReport[];
    nextBestWorkDecisions?: NextBestWorkDecision[];
  }): Promise<void>;
};

export function createWorkLoopStore(adapter: OperationalPersistenceAdapter): WorkLoopStore {
  async function defaultPolicy(): Promise<ContinuousWorkPolicy> {
    const defaults = createDefaultWorkLoopSeed();
    const stored = await adapter.readOne<ContinuousWorkPolicy>(
      OperationalTables.continuousWorkPolicy,
      defaults.continuousWorkPolicy.id
    );
    if (stored) return stored;
    await adapter.upsertOne(OperationalTables.continuousWorkPolicy, defaults.continuousWorkPolicy);
    return defaults.continuousWorkPolicy;
  }

  return {
    async getContinuousWorkPolicy() {
      const defaults = createDefaultWorkLoopSeed();
      const stored = await adapter.readOne<ContinuousWorkPolicy>(
        OperationalTables.continuousWorkPolicy,
        defaults.continuousWorkPolicy.id
      );
      return structuredClone(stored ?? (await defaultPolicy()));
    },
    async saveContinuousWorkPolicy(policy) {
      await adapter.upsertOne(OperationalTables.continuousWorkPolicy, policy);
      return policy;
    },
    listWorkItems: () => adapter.readTable<WorkItem>(OperationalTables.workItems),
    getWorkItem: (id) => adapter.readOne<WorkItem>(OperationalTables.workItems, id),
    createWorkItem: (item) => adapter.upsertOne(OperationalTables.workItems, item),
    async updateWorkItem(id, patch) {
      const current = await adapter.readOne<WorkItem>(OperationalTables.workItems, id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return adapter.upsertOne(OperationalTables.workItems, updated);
    },
    listCursorWorkPackets: () => adapter.readTable<CursorWorkPacket>(OperationalTables.cursorWorkPackets),
    getCursorWorkPacket: (id) => adapter.readOne<CursorWorkPacket>(OperationalTables.cursorWorkPackets, id),
    createCursorWorkPacket: (packet) => adapter.upsertOne(OperationalTables.cursorWorkPackets, packet),
    async updateCursorWorkPacket(id, patch) {
      const current = await adapter.readOne<CursorWorkPacket>(OperationalTables.cursorWorkPackets, id);
      if (!current) return null;
      const updated = { ...current, ...patch };
      return adapter.upsertOne(OperationalTables.cursorWorkPackets, updated);
    },
    listCursorCompletionReports: () =>
      adapter.readTable<CursorCompletionReport>(OperationalTables.cursorCompletionReports),
    createCursorCompletionReport: (report) =>
      adapter.upsertOne(OperationalTables.cursorCompletionReports, report),
    listNextBestWorkDecisions: () =>
      adapter.readTable<NextBestWorkDecision>(OperationalTables.nextBestWorkDecisions),
    appendNextBestWorkDecision: (decision) =>
      adapter.appendOne(OperationalTables.nextBestWorkDecisions, decision),
    async resetFromSeed(bundle) {
      const defaults = createDefaultWorkLoopSeed();
      await adapter.upsertOne(
        OperationalTables.continuousWorkPolicy,
        bundle.continuousWorkPolicy ?? defaults.continuousWorkPolicy
      );
      await adapter.replaceTable(OperationalTables.workItems, bundle.workItems ?? defaults.workItems);
      await adapter.replaceTable(OperationalTables.cursorWorkPackets, bundle.cursorWorkPackets ?? []);
      await adapter.replaceTable(OperationalTables.cursorCompletionReports, bundle.cursorCompletionReports ?? []);
      await adapter.replaceTable(OperationalTables.nextBestWorkDecisions, bundle.nextBestWorkDecisions ?? []);
    }
  };
}
