import type { WorkPacketLifecycleInput } from "@realmos/contracts";
import { validateWorkPacketLifecycleInput } from "@realmos/work-loop/work-packet-lifecycle";
import { ALLOWED_REALM_IDS } from "./defaults";

const GUING_PATTERN = /guing|side.?project/i;
const GUING_PROHIBITION_PATTERN =
  /\b(?:no|not|without|never|blocked|block)\b[^.\n]{0,40}\b(?:guing|side\s*projects?)\b|\b(?:guing|side\s*projects?)\b[^.\n]{0,40}\b(?:blocked|not selectable)\b/i;

function mentionsBlockedScope(text: string): boolean {
  if (!GUING_PATTERN.test(text)) {
    return false;
  }
  if (GUING_PROHIBITION_PATTERN.test(text)) {
    return false;
  }
  const scrubbed = text
    .replace(/\bno\s+guing\b/gi, "")
    .replace(/\bnot\s+guing\b/gi, "")
    .replace(/\bwithout\s+guing\b/gi, "")
    .replace(/\bno\s+side\s+projects?\b/gi, "")
    .replace(/\bnot\s+a\s+side\s+project\b/gi, "");
  return GUING_PATTERN.test(scrubbed);
}

function lineRequestsUnsafeExecution(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (!lower) {
    return false;
  }

  const checks: Array<{ term: string; allowIf: RegExp }> = [
    { term: "cursor cli", allowIf: /\b(?:no|not|without|never)\s+cursor cli\b/ },
    { term: "shell execution", allowIf: /\b(?:no|not|without|never)\s+shell execution\b/ },
    {
      term: "autonomous execution",
      allowIf: /\b(?:no|not|without|never)\s+autonomous execution\b/
    },
    {
      term: "auto-invoke",
      allowIf: /\b(?:no|not|without|never)\s+(?:cursor cli\s+)?auto-invoke\b/
    },
    { term: "npm publish", allowIf: /\b(?:no|not|without|never)\s+npm publish\b/ },
    { term: "firebase deploy", allowIf: /\b(?:no|not|without|never)\s+firebase deploy\b/ }
  ];

  for (const { term, allowIf } of checks) {
    const idx = lower.indexOf(term);
    if (idx === -1) {
      continue;
    }
    if (allowIf.test(lower)) {
      continue;
    }
    const before = lower.slice(0, idx);
    if (/\b(?:no|not|without|never|do not|don't)\s*$/.test(before)) {
      continue;
    }
    return true;
  }

  return false;
}

function mentionsUnsafeExecution(text: string): boolean {
  return text.split(/\n|[.;]/).some(lineRequestsUnsafeExecution);
}

export type WorkPacketCreateFormValues = {
  initiativeId: string;
  objective: string;
  realmId: string;
  repositoryId: string;
  branchTarget: string;
  instructions: string;
  allowedPathsText: string;
  forbiddenPathsText: string;
  verificationCommandsText: string;
  expectedArtifactsText: string;
  governanceConfirmed: boolean;
};

export type FormFieldError = { field: string; message: string };

export function formValuesToInput(values: WorkPacketCreateFormValues): WorkPacketLifecycleInput {
  const split = (text: string) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  return {
    sourceWorkItemId: values.initiativeId.trim()
      ? `initiative:${values.initiativeId.trim()}`
      : undefined,
    realmId: values.realmId.trim(),
    repositoryId: values.repositoryId.trim(),
    branchTarget: values.branchTarget.trim() || undefined,
    allowedPaths: split(values.allowedPathsText),
    forbiddenPaths: split(values.forbiddenPathsText),
    objective: values.objective.trim(),
    instructions: values.instructions.trim(),
    verificationCommands: split(values.verificationCommandsText),
    expectedArtifacts: split(values.expectedArtifactsText),
    approvalRequired: true,
    handoffRequired: true
  };
}

export function validateWorkPacketCreateForm(values: WorkPacketCreateFormValues): FormFieldError[] {
  const errors: FormFieldError[] = [];

  if (!values.governanceConfirmed) {
    errors.push({
      field: "governanceConfirmed",
      message: "Confirm the governance checklist before creating a work packet."
    });
  }

  if (mentionsBlockedScope(values.initiativeId)) {
    errors.push({
      field: "initiativeId",
      message: "GUING and side-project initiatives are blocked."
    });
  }

  if (!ALLOWED_REALM_IDS.includes(values.realmId.trim() as (typeof ALLOWED_REALM_IDS)[number])) {
    errors.push({
      field: "realmId",
      message: "Only RealmOS base-system realms are allowed. GUING/side-project realms are blocked."
    });
  }

  if (mentionsBlockedScope(values.objective) || mentionsBlockedScope(values.instructions)) {
    errors.push({
      field: "objective",
      message: "GUING and side-project scope is blocked in objectives and instructions."
    });
  }

  if (mentionsUnsafeExecution(values.instructions)) {
    errors.push({
      field: "instructions",
      message: "Instructions must not request shell execution, Cursor CLI, or autonomous execution."
    });
  }

  const input = formValuesToInput(values);
  for (const err of validateWorkPacketLifecycleInput(input)) {
    errors.push(err);
  }

  return errors;
}
