import type { WorldMap } from "@realmos/contracts";

export function WorldPreviewPanel({ worldMap }: { worldMap: WorldMap }) {
  return (
    <section className="card lg:col-span-2" aria-label="World preview panel">
      <h3 className="panel-title">World Preview</h3>
      <p className="mb-4 text-sm text-textSecondary">{worldMap.title}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {worldMap.nodes.map((node) => (
          <article
            key={node.id}
            className="rounded-lg border border-border/70 bg-surface p-3"
            data-testid={`world-node-${node.id}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className="font-semibold">{node.label}</h4>
              <span className="badge bg-cyan-500/15 text-cyan-200">{node.kind}</span>
            </div>
            <p className="text-xs text-textSecondary">Status: {node.status}</p>
            {node.refType ? (
              <p className="mt-1 text-xs text-textSecondary">
                Ref: {node.refType} / {node.refId}
              </p>
            ) : null}
            {node.characterAvatarId && !node.characterEnabled ? (
              <p className="mt-1 text-xs text-textSecondary">Character slot reserved (disabled)</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
