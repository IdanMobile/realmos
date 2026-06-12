import type {
  AgentMessage,
  CommunicationArchiveEntry,
  CommunicationDecision,
  CommunicationThread
} from "@realmos/contracts";
import { filterBlockerAndErrorMessages } from "./filters";
import { makeCommunicationId, nowIso } from "./id";
import type { CommunicationLedgerStore } from "./types";

export function exportThreadMarkdown(input: {
  thread: CommunicationThread;
  messages: AgentMessage[];
  decisions: CommunicationDecision[];
}): string {
  const lines = [
    `# ${input.thread.title}`,
    "",
    `- Thread ID: ${input.thread.id}`,
    `- Type: ${input.thread.type}`,
    `- Status: ${input.thread.status}`,
    input.thread.businessId ? `- Business: ${input.thread.businessId}` : "",
    input.thread.taskId ? `- Task: ${input.thread.taskId}` : "",
    input.thread.runId ? `- Run: ${input.thread.runId}` : "",
    input.thread.approvalRequestId ? `- Approval: ${input.thread.approvalRequestId}` : "",
    "",
    "## Messages",
    ""
  ].filter(Boolean);

  for (const message of input.messages) {
    lines.push(`### ${message.subject} (${message.type})`);
    lines.push(`- From: ${message.fromAgentId}${message.toAgentId ? ` → ${message.toAgentId}` : ""}`);
    lines.push(`- At: ${message.createdAt}`);
    lines.push("");
    lines.push(message.body);
    lines.push("");
  }

  if (input.decisions.length > 0) {
    lines.push("## Decisions", "");
    for (const decision of input.decisions) {
      lines.push(`### ${decision.title}`);
      lines.push(decision.decision);
      lines.push("");
    }
  }

  return lines.join("\n");
}

export async function archiveCommunicationThread(
  store: CommunicationLedgerStore,
  threadId: string
): Promise<{ archive: CommunicationArchiveEntry; markdown: string } | null> {
  const thread = await store.getThread(threadId);
  if (!thread) return null;

  const messages = await store.listMessagesByThread(threadId);
  const decisions = await store.listDecisionsByThread(threadId);
  const { blockers, errors } = filterBlockerAndErrorMessages(messages);
  const markdown = exportThreadMarkdown({ thread, messages, decisions });

  const archive = await store.createArchive({
    id: makeCommunicationId("archive", thread.title),
    threadId: thread.id,
    archivePath: `vault/communications/${thread.id}.md`,
    summary: `Archived thread "${thread.title}" with ${messages.length} raw messages preserved.`,
    tokenEstimate: Math.ceil(markdown.length / 4),
    messageCount: messages.length,
    decisionCount: decisions.length,
    errorCount: errors.length,
    blockerCount: blockers.length,
    createdAt: nowIso()
  });

  await store.updateThread(thread.id, {
    status: "archived",
    archivedAt: nowIso(),
    updatedAt: nowIso()
  });

  return { archive, markdown };
}
