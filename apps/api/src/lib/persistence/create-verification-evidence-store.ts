import type { VerificationEvidenceRecord } from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";

export type VerificationEvidenceStore = {
  listVerificationEvidenceRecords(): Promise<VerificationEvidenceRecord[]>;
  getVerificationEvidenceRecord(id: string): Promise<VerificationEvidenceRecord | null>;
  createVerificationEvidenceRecord(record: VerificationEvidenceRecord): Promise<VerificationEvidenceRecord>;
};

export function createVerificationEvidenceStore(
  adapter: OperationalPersistenceAdapter
): VerificationEvidenceStore {
  return {
    listVerificationEvidenceRecords: () =>
      adapter.readTable<VerificationEvidenceRecord>(OperationalTables.verificationEvidence),
    getVerificationEvidenceRecord: (id) =>
      adapter.readOne<VerificationEvidenceRecord>(OperationalTables.verificationEvidence, id),
    createVerificationEvidenceRecord: (record) =>
      adapter.upsertOne(OperationalTables.verificationEvidence, record)
  };
}
