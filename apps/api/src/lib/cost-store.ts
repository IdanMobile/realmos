import type { CostLoggerStore } from "@realmos/llm-router";
import type { RealmOSDatabase } from "../db/types";

export function createCostLoggerStore(db: RealmOSDatabase): CostLoggerStore {
  return {
    listBudgets: () => db.listBudgets(),
    listCostEntries: () => db.listCostEntries(),
    createCostEntry: (entry) => db.createCostEntry(entry)
  };
}
