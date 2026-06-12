import type { ApprovalRequest } from "@realmos/contracts";

type ApprovalQueuePanelProps = {
  approvals: ApprovalRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export function ApprovalQueuePanel({ approvals, onApprove, onReject }: ApprovalQueuePanelProps) {
  const pending = approvals.filter((approval) => approval.status === "pending");

  return (
    <section className="card" aria-label="Approval queue panel">
      <h3 className="panel-title">Approval Queue</h3>
      {pending.length === 0 ? (
        <p className="text-sm text-textSecondary">No pending approvals.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((approval) => (
            <article key={approval.id} className="rounded-lg border border-border/70 bg-surface p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="font-semibold">{approval.title}</h4>
                <span className="badge bg-rose-500/15 text-rose-200">{approval.riskLevel}</span>
              </div>
              <p className="mb-3 text-sm text-textSecondary">{approval.description}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-medium text-white"
                  onClick={() => onApprove?.(approval.id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs"
                  onClick={() => onReject?.(approval.id)}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
