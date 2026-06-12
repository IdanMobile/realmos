export function OperatorGuidePanel() {
  return (
    <section className="card lg:col-span-2" aria-label="Operator guide panel">
      <h3 className="panel-title">Operator Guide</h3>
      <div className="space-y-3 text-sm text-textSecondary">
        <p>
          RealmOS MVP is for personal planning: create businesses from ideas, generate SpecKit artifacts, track agents,
          memory, costs, and approvals.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <span className="font-medium text-textPrimary">Start stack:</span>{" "}
            <code className="text-xs">pnpm --filter @realmos/api dev</code> and{" "}
            <code className="text-xs">pnpm --filter @realmos/web dev</code>
          </li>
          <li>
            <span className="font-medium text-textPrimary">Create from idea:</span> POST{" "}
            <code className="text-xs">/api/jarvis/commands/create-business-from-idea</code> or use the Jarvis chat route.
          </li>
          <li>
            <span className="font-medium text-textPrimary">Review approvals</span> in the Approval Queue before enabling
            risky tools or high-cost model routes.
          </li>
          <li>
            <span className="font-medium text-textPrimary">Terminal tools:</span> set{" "}
            <code className="text-xs">REALMOS_ALLOW_TERMINAL=true</code> in <code className="text-xs">.env</code>, restart
            API, then approve each command.
          </li>
          <li>
            <span className="font-medium text-textPrimary">Backup:</span> download{" "}
            <code className="text-xs">GET /api/export/bundle</code> for a full JSON export.
          </li>
          <li>
            <span className="font-medium text-textPrimary">Demo script:</span>{" "}
            <code className="text-xs">node scripts/mvp-demo.mjs</code>
          </li>
        </ol>
      </div>
    </section>
  );
}
