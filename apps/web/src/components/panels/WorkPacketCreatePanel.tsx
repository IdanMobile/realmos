"use client";

import { useState, type FormEvent } from "react";
import { createLifecyclePacket } from "@/lib/api/work-packet-lifecycle";
import { ALLOWED_REALM_IDS, REALMOS_LIFECYCLE_DEFAULTS } from "@/lib/lifecycle/defaults";
import {
  formValuesToInput,
  validateWorkPacketCreateForm,
  type WorkPacketCreateFormValues
} from "@/lib/lifecycle/form-validation";
import { LIFECYCLE_SAFETY_FLAGS } from "@/lib/lifecycle/mappers";

type WorkPacketCreatePanelProps = {
  dataSource: "api" | "mock";
  onCreated?: (packetId: string) => void;
};

const INITIAL_FORM: WorkPacketCreateFormValues = {
  initiativeId: REALMOS_LIFECYCLE_DEFAULTS.initiativeId,
  objective: "",
  realmId: REALMOS_LIFECYCLE_DEFAULTS.realmId,
  repositoryId: REALMOS_LIFECYCLE_DEFAULTS.repositoryId,
  branchTarget: REALMOS_LIFECYCLE_DEFAULTS.branchTarget,
  instructions: REALMOS_LIFECYCLE_DEFAULTS.instructions,
  allowedPathsText: REALMOS_LIFECYCLE_DEFAULTS.allowedPathsText,
  forbiddenPathsText: REALMOS_LIFECYCLE_DEFAULTS.forbiddenPathsText,
  verificationCommandsText: REALMOS_LIFECYCLE_DEFAULTS.verificationCommandsText,
  expectedArtifactsText: REALMOS_LIFECYCLE_DEFAULTS.expectedArtifactsText,
  governanceConfirmed: false
};

export function WorkPacketCreatePanel({ dataSource, onCreated }: WorkPacketCreatePanelProps) {
  const [form, setForm] = useState<WorkPacketCreateFormValues>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);

  function updateField<K extends keyof WorkPacketCreateFormValues>(
    key: K,
    value: WorkPacketCreateFormValues[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors([]);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors([]);
    setMessage(null);

    const validationErrors = validateWorkPacketCreateForm(form);
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const result = await createLifecyclePacket(formValuesToInput(form));
    setSubmitting(false);

    if (!result.ok) {
      setErrors(
        result.details?.length
          ? result.details
          : [{ field: "form", message: result.message }]
      );
      return;
    }

    setMessage(`Draft work packet ${result.data.id} created. Mark ready → approve → dispatch (dry-run).`);
    setForm({ ...INITIAL_FORM, governanceConfirmed: false });
    onCreated?.(result.data.id);
  }

  if (dataSource !== "api") {
    return (
      <section
        className="card lg:col-span-2"
        aria-label="Work packet create panel"
        data-testid="work-packet-create-panel"
      >
        <h3 className="panel-title">Create Work Packet</h3>
        <p className="text-sm text-amber-200" role="alert">
          Live API required to create work packets from the Command Center.
        </p>
      </section>
    );
  }

  return (
    <section
      className="card lg:col-span-2"
      aria-label="Work packet create panel"
      data-testid="work-packet-create-panel"
    >
      <h3 className="panel-title">Create Work Packet</h3>
      <p className="mb-3 text-sm text-textSecondary">
        Create a RealmOS base-system draft. Dry-run dispatch only — no shell, no Cursor CLI, no autonomous
        execution.
      </p>

      <div className="mb-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 text-xs text-textSecondary">
        <p className="font-semibold text-textPrimary">Governance defaults</p>
        <p className="mt-1">
          GUING and side projects are not selectable. Approval required before dispatch.{" "}
          <span className="font-mono">mode={LIFECYCLE_SAFETY_FLAGS.mode}</span>
        </p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
        <label className="block text-sm">
          Initiative ID
          <input
            className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
            value={form.initiativeId}
            onChange={(event) => updateField("initiativeId", event.target.value)}
            data-testid="work-packet-create-initiative"
            placeholder="0.37"
          />
        </label>

        <label className="block text-sm">
          Objective / title
          <input
            className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1"
            value={form.objective}
            onChange={(event) => updateField("objective", event.target.value)}
            data-testid="work-packet-create-objective"
            placeholder="Describe the base-system task"
            required
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Realm (RealmOS base-system only)
            <select
              className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
              value={form.realmId}
              onChange={(event) => updateField("realmId", event.target.value)}
              data-testid="work-packet-create-realm"
            >
              {ALLOWED_REALM_IDS.map((realmId) => (
                <option key={realmId} value={realmId}>
                  {realmId}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Repository ID
            <input
              className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
              value={form.repositoryId}
              onChange={(event) => updateField("repositoryId", event.target.value)}
              data-testid="work-packet-create-repository"
            />
          </label>
        </div>

        <label className="block text-sm">
          Branch / worktree label
          <input
            className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
            value={form.branchTarget}
            onChange={(event) => updateField("branchTarget", event.target.value)}
            data-testid="work-packet-create-branch"
          />
        </label>

        <label className="block text-sm">
          Instructions / acceptance notes
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-border/70 bg-surface px-2 py-1 text-sm"
            value={form.instructions}
            onChange={(event) => updateField("instructions", event.target.value)}
            data-testid="work-packet-create-instructions"
          />
        </label>

        <label className="block text-sm">
          Allowed paths (one per line)
          <textarea
            className="mt-1 min-h-16 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
            value={form.allowedPathsText}
            onChange={(event) => updateField("allowedPathsText", event.target.value)}
            data-testid="work-packet-create-allowed-paths"
          />
        </label>

        <label className="block text-sm">
          Forbidden paths (one per line)
          <textarea
            className="mt-1 min-h-16 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
            value={form.forbiddenPathsText}
            onChange={(event) => updateField("forbiddenPathsText", event.target.value)}
            data-testid="work-packet-create-forbidden-paths"
          />
        </label>

        <label className="block text-sm">
          Verification commands (one per line)
          <textarea
            className="mt-1 min-h-16 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
            value={form.verificationCommandsText}
            onChange={(event) => updateField("verificationCommandsText", event.target.value)}
            data-testid="work-packet-create-verification-commands"
          />
        </label>

        <label className="block text-sm">
          Expected artifacts (one per line — required before mark ready)
          <textarea
            className="mt-1 min-h-16 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
            value={form.expectedArtifactsText}
            onChange={(event) => updateField("expectedArtifactsText", event.target.value)}
            data-testid="work-packet-create-expected-artifacts"
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.governanceConfirmed}
            onChange={(event) => updateField("governanceConfirmed", event.target.checked)}
            data-testid="work-packet-create-governance-checkbox"
          />
          <span>
            I confirm this is RealmOS base-system work only — not GUING or a side project. Dry-run dispatch
            only; no shell, Cursor CLI, or autonomous execution.
          </span>
        </label>

        {errors.length > 0 ? (
          <ul className="space-y-1 text-sm text-rose-300" data-testid="work-packet-create-errors">
            {errors.map((error) => (
              <li key={`${error.field}-${error.message}`}>
                {error.field}: {error.message}
              </li>
            ))}
          </ul>
        ) : null}

        {message ? (
          <p className="text-sm text-emerald-300" data-testid="work-packet-create-success">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accentMuted disabled:opacity-50"
          data-testid="work-packet-create-submit"
        >
          {submitting ? "Creating…" : "Create draft work packet"}
        </button>
      </form>
    </section>
  );
}
