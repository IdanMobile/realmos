import type { ApprovalRequest, ToolRunRequest, ToolRunResult } from "@realmos/contracts";

type ToolActivityPanelProps = {
  requests: ToolRunRequest[];
  results: ToolRunResult[];
  pendingApprovals: ApprovalRequest[];
  terminalEnabled?: boolean;
};

export function ToolActivityPanel({
  requests,
  results,
  pendingApprovals,
  terminalEnabled = false
}: ToolActivityPanelProps) {
  const toolApprovals = pendingApprovals.filter(
    (approval) =>
      approval.actionType === "terminal_command" ||
      (typeof approval.payload === "object" &&
        approval.payload !== null &&
        "requestId" in (approval.payload as Record<string, unknown>))
  );

  return (
    <section className="card lg:col-span-2" aria-label="Tool activity panel">
      <h3 className="panel-title">Tool Activity</h3>
      <p className="mb-3 text-sm text-textSecondary">
        {terminalEnabled
          ? "Terminal execution is enabled. Approved commands run on the local machine."
          : "Filesystem drafts use dry-run. Terminal commands require approval and REALMOS_ALLOW_TERMINAL=true."}
      </p>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold">Pending tool approvals</h4>
        {toolApprovals.length === 0 ? (
          <p className="text-sm text-textSecondary">No pending tool approvals.</p>
        ) : (
          <ul className="space-y-2">
            {toolApprovals.map((approval) => (
              <li key={approval.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{approval.title}</span>
                  <span className="badge bg-amber-500/15 text-amber-200">{approval.status}</span>
                </div>
                <p className="mt-1 text-textSecondary">{approval.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold">Tool run requests</h4>
        {requests.length === 0 ? (
          <p className="text-sm text-textSecondary">No tool runs yet.</p>
        ) : (
          <ul className="space-y-2">
            {requests.map((request) => (
              <li key={request.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{request.title}</span>
                  <span className="badge bg-slate-500/15 text-slate-200">{request.status}</span>
                </div>
                <p className="mt-1 text-textSecondary">
                  {request.tool} · {request.kind} · risk {request.riskLevel}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Results</h4>
        {results.length === 0 ? (
          <p className="text-sm text-textSecondary">No results yet.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((result) => (
              <li key={result.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Request {result.requestId}</span>
                  <span className="badge bg-cyan-500/15 text-cyan-200">{result.status}</span>
                </div>
                {result.output ? (
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-textSecondary">{result.output}</pre>
                ) : null}
                {result.error ? <p className="mt-2 text-xs text-rose-200">{result.error}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
