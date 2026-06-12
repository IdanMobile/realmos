import type { CommunicationLedgerStore } from "@realmos/core";
import type { RealmOSDatabase } from "../db/types";

export function createCommunicationLedgerStore(db: RealmOSDatabase): CommunicationLedgerStore {
  return {
    listThreads: () => db.listCommunicationThreads(),
    getThread: (id) => db.getCommunicationThread(id),
    createThread: (thread) => db.createCommunicationThread(thread),
    updateThread: (id, patch) => db.updateCommunicationThread(id, patch),
    listMessages: () => db.listCommunicationMessages(),
    listMessagesByThread: (threadId) => db.listCommunicationMessagesByThread(threadId),
    createMessage: (message) => db.createCommunicationMessage(message),
    listDecisions: () => db.listCommunicationDecisions(),
    listDecisionsByThread: (threadId) => db.listCommunicationDecisionsByThread(threadId),
    createDecision: (decision) => db.createCommunicationDecision(decision),
    listArchives: () => db.listCommunicationArchives(),
    createArchive: (entry) => db.createCommunicationArchive(entry)
  };
}
