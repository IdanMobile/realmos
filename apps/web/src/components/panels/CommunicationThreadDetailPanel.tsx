import type { AgentMessage, CommunicationDecision, CommunicationThread } from "@realmos/contracts";

type CommunicationThreadDetailPanelProps = {
  thread: CommunicationThread | null;
  messages: AgentMessage[];
  decisions: CommunicationDecision[];
};

export function CommunicationThreadDetailPanel({
  thread,
  messages,
  decisions
}: CommunicationThreadDetailPanelProps) {
  if (!thread) {
    return (
      <section className="card" aria-label="Communication thread detail panel">
        <h3 className="panel-title">Thread Detail</h3>
        <p className="text-sm text-textSecondary">Select a thread to read the full conversation history.</p>
      </section>
    );
  }

  const threadMessages = messages
    .filter((message) => message.threadId === thread.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <section className="card lg:col-span-2" aria-label="Communication thread detail panel">
      <h3 className="panel-title">{thread.title}</h3>
      <p className="mb-4 text-sm text-textSecondary">
        Raw messages are preserved. Summaries and archives reference this thread without replacing it.
      </p>
      <div className="space-y-3">
        {threadMessages.map((message) => (
          <article key={message.id} className="rounded-lg border border-border/70 bg-surface p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className="font-semibold">{message.subject}</h4>
              <span className="badge bg-amber-500/15 text-amber-200">{message.type}</span>
            </div>
            <p className="text-xs text-textSecondary">
              {message.fromAgentId}
              {message.toAgentId ? ` → ${message.toAgentId}` : ""} · {message.createdAt}
            </p>
            <p className="mt-2 text-sm">{message.body}</p>
          </article>
        ))}
      </div>
      {decisions.length > 0 ? (
        <div className="mt-4">
          <h4 className="mb-2 font-semibold">Extracted Decisions</h4>
          <div className="space-y-2">
            {decisions
              .filter((decision) => decision.threadId === thread.id)
              .map((decision) => (
                <article key={decision.id} className="rounded-lg border border-border/70 bg-surface p-3">
                  <h5 className="font-semibold">{decision.title}</h5>
                  <p className="text-sm text-textSecondary">{decision.decision}</p>
                </article>
              ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
