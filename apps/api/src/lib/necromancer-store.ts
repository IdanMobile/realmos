export type NecromancerOperatorActionRecord = {
  id: string;
  candidateId: string;
  action: "pause" | "retire" | "protect" | "prepare";
  operatorId: string;
  approved: boolean;
  outcome: "applied" | "blocked";
  summary: string;
  timestamp: string;
  payload?: Record<string, unknown>;
};

const protectedCandidateIds = new Set<string>();
const actionHistory: NecromancerOperatorActionRecord[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

export const necromancerStore = {
  listProtectedIds(): string[] {
    return [...protectedCandidateIds];
  },

  isProtected(candidateId: string): boolean {
    return protectedCandidateIds.has(candidateId);
  },

  markProtected(candidateId: string): void {
    protectedCandidateIds.add(candidateId);
  },

  clearProtected(candidateId: string): void {
    protectedCandidateIds.delete(candidateId);
  },

  appendAction(record: Omit<NecromancerOperatorActionRecord, "id" | "timestamp">): NecromancerOperatorActionRecord {
    const entry: NecromancerOperatorActionRecord = {
      id: `necromancer_action_${actionHistory.length + 1}`,
      timestamp: nowIso(),
      ...record
    };
    actionHistory.unshift(entry);
    return entry;
  },

  listActions(limit = 50): NecromancerOperatorActionRecord[] {
    return actionHistory.slice(0, limit);
  },

  resetForTests(): void {
    protectedCandidateIds.clear();
    actionHistory.length = 0;
  }
};
