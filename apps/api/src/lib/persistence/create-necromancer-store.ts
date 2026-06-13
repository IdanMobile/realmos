import type {
  NecromancerActionListFilters,
  NecromancerOperatorActionRecord,
  NecromancerProtectionRecord
} from "@realmos/contracts";
import { makeWorkLoopId, nowIso } from "@realmos/work-loop";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";

export type NecromancerStore = {
  listProtectedCandidateIds(): Promise<string[]>;
  isProtected(candidateId: string): Promise<boolean>;
  markProtected(
    input: Omit<NecromancerProtectionRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<NecromancerProtectionRecord>;
  appendAction(
    input: Omit<NecromancerOperatorActionRecord, "id" | "createdAt" | "actionType"> & { id?: string }
  ): Promise<NecromancerOperatorActionRecord>;
  listActions(filters?: NecromancerActionListFilters): Promise<NecromancerOperatorActionRecord[]>;
  resetForTests(): Promise<void>;
};

export function createNecromancerStore(adapter: OperationalPersistenceAdapter): NecromancerStore {
  return {
    async listProtectedCandidateIds() {
      const protections = await adapter.readTable<NecromancerProtectionRecord>(
        OperationalTables.necromancerProtections
      );
      return protections.map((record) => record.candidateId);
    },

    async isProtected(candidateId) {
      const protections = await adapter.readTable<NecromancerProtectionRecord>(
        OperationalTables.necromancerProtections
      );
      return protections.some((record) => record.candidateId === candidateId);
    },

    async markProtected(input) {
      const timestamp = nowIso();
      const existing = (await adapter.readTable<NecromancerProtectionRecord>(
        OperationalTables.necromancerProtections
      )).find((record) => record.candidateId === input.candidateId);

      const record: NecromancerProtectionRecord = {
        id: input.id ?? existing?.id ?? makeWorkLoopId("necromancer_protect"),
        candidateId: input.candidateId,
        realmId: input.realmId,
        operatorId: input.operatorId,
        reason: input.reason,
        evidenceId: input.evidenceId,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp
      };

      await adapter.upsertOne(OperationalTables.necromancerProtections, record);
      return record;
    },

    async appendAction(input) {
      const record: NecromancerOperatorActionRecord = {
        id: input.id ?? makeWorkLoopId("necromancer_action"),
        createdAt: nowIso(),
        actionType: input.action,
        ...input
      };

      await adapter.upsertOne(OperationalTables.necromancerActions, record);
      return record;
    },

    async listActions(filters = {}) {
      let records = await adapter.readTable<NecromancerOperatorActionRecord>(
        OperationalTables.necromancerActions
      );

      if (filters.candidateId) {
        records = records.filter((record) => record.candidateId === filters.candidateId);
      }
      if (filters.action) {
        records = records.filter((record) => record.action === filters.action);
      }
      if (filters.operatorId) {
        records = records.filter((record) => record.operatorId === filters.operatorId);
      }
      if (filters.outcome) {
        records = records.filter((record) => record.outcome === filters.outcome);
      }

      records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const limit = filters.limit ?? 50;
      return records.slice(0, limit);
    },

    async resetForTests() {
      await adapter.replaceTable(OperationalTables.necromancerProtections, []);
      await adapter.replaceTable(OperationalTables.necromancerActions, []);
    }
  };
}
