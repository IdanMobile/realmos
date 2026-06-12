import type { Budget, CostEntry } from "@realmos/contracts";

type CostBudgetPanelProps = {
  monthlyBudget: Budget;
  costs: CostEntry[];
};

function isLocalProvider(provider: string): boolean {
  return provider === "ollama" || provider === "local";
}

export function CostBudgetPanel({ monthlyBudget, costs }: CostBudgetPanelProps) {
  const totalSpent = costs.reduce((sum, entry) => sum + entry.amount, 0);
  const limit = monthlyBudget.monthlyLimit ?? 0;
  const localSpend = costs
    .filter((entry) => isLocalProvider(entry.provider))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const onlineSpend = totalSpent - localSpend;
  const approvalThreshold = monthlyBudget.requiresApprovalAbove ?? 0.5;
  const overThreshold = onlineSpend >= approvalThreshold;

  return (
    <section className="card" aria-label="Cost budget panel">
      <h3 className="panel-title">Cost & Budget</h3>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-surface p-3">
          <p className="text-xs text-textSecondary">Monthly limit</p>
          <p className="text-lg font-semibold">
            {limit} {monthlyBudget.currency}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3">
          <p className="text-xs text-textSecondary">Total spent</p>
          <p className="text-lg font-semibold">
            {totalSpent.toFixed(2)} {monthlyBudget.currency}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3">
          <p className="text-xs text-textSecondary">Local (Ollama)</p>
          <p className="text-lg font-semibold">{localSpend.toFixed(2)} USD</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3">
          <p className="text-xs text-textSecondary">Online</p>
          <p className="text-lg font-semibold">{onlineSpend.toFixed(2)} USD</p>
        </div>
      </div>
      {overThreshold ? (
        <p className="mb-3 text-sm text-amber-200">
          Online spend reached approval threshold ({approvalThreshold} USD).
        </p>
      ) : null}
      <ul className="space-y-2">
        {costs.map((cost) => (
          <li key={cost.id} className="flex items-center justify-between text-sm">
            <span>
              {cost.provider}
              {cost.model ? ` · ${cost.model}` : ""}
            </span>
            <span>
              {cost.amount.toFixed(2)} {cost.currency}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
