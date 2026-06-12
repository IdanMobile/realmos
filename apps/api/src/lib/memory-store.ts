import type { MemoryStore } from "@realmos/memory";
import type { RealmOSDatabase } from "../db/types";

export function createMemoryStore(db: RealmOSDatabase): MemoryStore {
  return {
    listMemories: () => db.listMemories(),
    getMemory: (id) => db.getMemory(id),
    createMemory: (memory) => db.createMemory(memory),
    updateMemory: (id, patch) => db.updateMemory(id, patch),
    deleteMemory: (id) => db.deleteMemory(id)
  };
}
