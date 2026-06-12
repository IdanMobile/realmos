import type { Task } from "@realmos/contracts";

export function TaskStatusPanel({ tasks }: { tasks: Task[] }) {
  return (
    <section className="card" aria-label="Task status panel">
      <h3 className="panel-title">Task Status</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-lg border border-border/70 bg-surface p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className="font-semibold">{task.title}</h4>
              <span className="badge bg-amber-500/15 text-amber-200">{task.status}</span>
            </div>
            <p className="text-sm text-textSecondary">{task.goal}</p>
            <p className="mt-2 text-xs text-textSecondary">Priority: {task.priority}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
