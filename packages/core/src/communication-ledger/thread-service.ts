import type {
  AgentMessage,
  CommunicationDecision,
  CommunicationThread
} from "@realmos/contracts";
import { isDecisionMessage } from "./filters";
import { makeCommunicationId, nowIso } from "./id";
import type { CommunicationLedgerStore } from "./types";

export async function createCommunicationThread(
  store: CommunicationLedgerStore,
  input: Omit<CommunicationThread, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<CommunicationThread> {
  const timestamp = nowIso();
  return store.createThread({
    ...input,
    id: input.id ?? makeCommunicationId("thread", input.title),
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function appendAgentMessage(
  store: CommunicationLedgerStore,
  input: Omit<AgentMessage, "id" | "createdAt"> & { id?: string }
): Promise<AgentMessage> {
  const thread = await store.getThread(input.threadId);
  if (!thread) {
    throw new Error(`Message threadId ${input.threadId} does not exist.`);
  }

  const message = await store.createMessage({
    ...input,
    id: input.id ?? makeCommunicationId("message", input.subject),
    createdAt: nowIso()
  });

  await store.updateThread(thread.id, { updatedAt: nowIso() });
  return message;
}

export async function getThreadWithMessages(
  store: CommunicationLedgerStore,
  threadId: string
): Promise<{ thread: CommunicationThread; messages: AgentMessage[] } | null> {
  const thread = await store.getThread(threadId);
  if (!thread) return null;

  const messages = (await store.listMessagesByThread(threadId)).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  return { thread, messages };
}

export function extractDecisionsFromMessages(
  threadId: string,
  messages: AgentMessage[],
  businessId?: string,
  taskId?: string
): CommunicationDecision[] {
  return messages.filter(isDecisionMessage).map((message) => ({
    id: makeCommunicationId("decision", message.subject),
    threadId,
    businessId: message.businessId ?? businessId,
    taskId: message.taskId ?? taskId,
    title: message.subject,
    decision: message.body,
    decidedByAgentId: message.fromAgentId,
    acceptedByAgentId: message.type === "decision_accepted" ? message.toAgentId : undefined,
    rationale: message.structuredPayload?.rationale?.toString() ?? message.body,
    alternativesConsidered: Array.isArray(message.structuredPayload?.alternativesConsidered)
      ? (message.structuredPayload.alternativesConsidered as string[])
      : [],
    artifactRefs: message.artifactRefs,
    createdAt: message.createdAt
  }));
}

export async function persistExtractedDecisions(
  store: CommunicationLedgerStore,
  decisions: CommunicationDecision[]
): Promise<CommunicationDecision[]> {
  const created = [];
  for (const decision of decisions) {
    created.push(await store.createDecision(decision));
  }
  return created;
}
