import type { AgentMessage, CommunicationThread } from "@realmos/contracts";

type CommunicationThreadsPanelProps = {
  threads: CommunicationThread[];
  messages: AgentMessage[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
};

export function CommunicationThreadsPanel({
  threads,
  messages,
  selectedThreadId,
  onSelectThread
}: CommunicationThreadsPanelProps) {
  return (
    <section className="card" aria-label="Communication threads panel">
      <h3 className="panel-title">Communication Threads</h3>
      {threads.length === 0 ? (
        <p className="text-sm text-textSecondary">No agent communication threads yet.</p>
      ) : (
        <ul className="space-y-2">
          {threads.map((thread) => {
            const messageCount = messages.filter((message) => message.threadId === thread.id).length;
            const selected = selectedThreadId === thread.id;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border p-3 text-left ${
                    selected ? "border-cyan-400/60 bg-cyan-500/10" : "border-border/70 bg-surface"
                  }`}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{thread.title}</span>
                    <span className="badge bg-slate-500/15 text-slate-200">{thread.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-textSecondary">
                    {thread.type} · {messageCount} messages
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
