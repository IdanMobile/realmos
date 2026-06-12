import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  CursorWorkPacket,
  LocalExecutorDispatch,
  LocalExecutorDispatchInput,
  LocalExecutorResultInput,
  LocalExecutorStatus
} from "@realmos/contracts";
import { makeWorkLoopId, nowIso } from "./id";

const DEFAULT_EXECUTOR_ID = "local-cursor-bridge";
const SIDE_PROJECT_REALM_PATTERN = /guing/i;
const SECRET_PATTERN =
  /(?:api[_-]?key|secret|password|token|private[_-]?key|service[_-]?account)\s*[:=]\s*\S+/i;

export type ExecutorBridgeValidationError = {
  field: string;
  message: string;
};

export type ExecutorQueueArtifacts = {
  rootDir: string;
  packetDir: string;
  packetJsonPath: string;
  promptMdPath: string;
  verificationJsonPath: string;
};

export function getExecutorQueueRoot(cwd: string = process.cwd()): string {
  const configured = process.env.REALMOS_EXECUTOR_QUEUE_DIR?.trim();
  if (configured) {
    return path.resolve(configured);
  }
  return path.join(cwd, ".realmos", "executor-queue");
}

export function isExecutorBridgeEnabled(): boolean {
  return process.env.REALMOS_EXECUTOR_BRIDGE_ENABLED !== "false";
}

export function validateLocalExecutorDispatchInput(
  input: LocalExecutorDispatchInput
): ExecutorBridgeValidationError[] {
  const errors: ExecutorBridgeValidationError[] = [];

  if (!input.realmId?.trim()) {
    errors.push({ field: "realmId", message: "realmId is required." });
  } else if (SIDE_PROJECT_REALM_PATTERN.test(input.realmId)) {
    errors.push({
      field: "realmId",
      message: "GUING and side-project realms are blocked until RealmOS self-management milestone."
    });
  }

  if (!input.repositoryId?.trim()) {
    errors.push({ field: "repositoryId", message: "repositoryId is required." });
  }

  if (!input.workPacketId?.trim()) {
    errors.push({ field: "workPacketId", message: "workPacketId is required." });
  }

  if (!input.taskSummary?.trim()) {
    errors.push({ field: "taskSummary", message: "taskSummary is required." });
  }

  if (!input.prompt?.trim()) {
    errors.push({ field: "prompt", message: "prompt is required." });
  } else if (SECRET_PATTERN.test(input.prompt)) {
    errors.push({ field: "prompt", message: "prompt must not contain secret-like assignments." });
  }

  if (!input.allowedPaths?.length) {
    errors.push({ field: "allowedPaths", message: "allowedPaths must include at least one path." });
  }

  if (!input.forbiddenPaths?.length) {
    errors.push({ field: "forbiddenPaths", message: "forbiddenPaths must include at least one path." });
  }

  if (!input.verificationCommands?.length) {
    errors.push({
      field: "verificationCommands",
      message: "verificationCommands must include at least one command."
    });
  }

  for (const allowed of input.allowedPaths ?? []) {
    for (const forbidden of input.forbiddenPaths ?? []) {
      if (allowed === forbidden || allowed.startsWith(`${forbidden}/`)) {
        errors.push({
          field: "allowedPaths",
          message: `allowed path "${allowed}" conflicts with forbidden path "${forbidden}".`
        });
      }
    }
  }

  return errors;
}

export function buildLocalExecutorDispatch(
  input: LocalExecutorDispatchInput,
  id: string = makeWorkLoopId("exec")
): LocalExecutorDispatch {
  const timestamp = nowIso();
  return {
    id,
    executorId: input.executorId?.trim() || DEFAULT_EXECUTOR_ID,
    realmId: input.realmId.trim(),
    repositoryId: input.repositoryId.trim(),
    workPacketId: input.workPacketId.trim(),
    branchTarget: input.branchTarget?.trim() || undefined,
    worktreeTarget: input.worktreeTarget?.trim() || undefined,
    allowedPaths: [...input.allowedPaths],
    forbiddenPaths: [...input.forbiddenPaths],
    taskSummary: input.taskSummary.trim(),
    prompt: input.prompt.trim(),
    verificationCommands: [...input.verificationCommands],
    stopConditions: input.stopConditions?.length
      ? [...input.stopConditions]
      : ["Stop for human-only actions, secrets, or production deployment."],
    requiresApproval: input.requiresApproval ?? true,
    status: "queued",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function buildLocalExecutorDispatchFromWorkPacket(
  packet: CursorWorkPacket,
  input: {
    realmId: string;
    repositoryId: string;
    branchTarget?: string;
    worktreeTarget?: string;
    executorId?: string;
  }
): LocalExecutorDispatchInput {
  const repositoryContext = packet.repositoryContext;
  const allowedPaths =
    repositoryContext?.allowedPaths?.length ? [...repositoryContext.allowedPaths] : ["packages/**", "apps/**"];
  const forbiddenPaths =
    repositoryContext?.forbiddenPaths?.length
      ? [...repositoryContext.forbiddenPaths]
      : [".env", "generated/**", "node_modules/**"];

  const verificationCommands =
    repositoryContext?.verificationCommands?.length
      ? [...repositoryContext.verificationCommands]
      : ["pnpm test", "pnpm typecheck"];

  return {
    executorId: input.executorId,
    realmId: input.realmId,
    repositoryId: input.repositoryId,
    workPacketId: packet.id,
    branchTarget: input.branchTarget,
    worktreeTarget: input.worktreeTarget,
    allowedPaths,
    forbiddenPaths,
    taskSummary: packet.title,
    prompt: [
      `# ${packet.title}`,
      "",
      "## Goal",
      packet.goal,
      "",
      "## Rules",
      ...packet.rules.map((rule) => `- ${rule}`),
      "",
      "## Files to read",
      ...packet.filesToRead.map((file) => `- ${file}`),
      "",
      "## Files to modify",
      ...(packet.filesToModify.length ? packet.filesToModify.map((file) => `- ${file}`) : ["- (scope TBD)"]),
      "",
      "## Expected output",
      ...packet.expectedOutput.map((item) => `- ${item}`),
      "",
      "## Stop after",
      packet.stopAfter
    ].join("\n"),
    verificationCommands,
    stopConditions: [
      "Do not start GUING or side projects.",
      "Do not commit secrets or `.env`.",
      "Stop for human-only actions."
    ],
    requiresApproval: true
  };
}

export function canDispatchLocalExecutor(
  dispatch: LocalExecutorDispatch,
  options: { approved?: boolean } = {}
): { allowed: boolean; reason?: string } {
  if (!isExecutorBridgeEnabled()) {
    return { allowed: false, reason: "Executor bridge is disabled." };
  }

  if (dispatch.status !== "queued" && dispatch.status !== "blocked") {
    return { allowed: false, reason: `Cannot dispatch from status ${dispatch.status}.` };
  }

  if (dispatch.requiresApproval && !options.approved && !dispatch.approvedAt) {
    return { allowed: false, reason: "Human approval is required before dispatch." };
  }

  return { allowed: true };
}

export function applyExecutorApproval(dispatch: LocalExecutorDispatch): LocalExecutorDispatch {
  const timestamp = nowIso();
  return {
    ...dispatch,
    approvedAt: timestamp,
    updatedAt: timestamp,
    status: dispatch.status === "blocked" ? "queued" : dispatch.status
  };
}

export async function writeExecutorQueueArtifacts(
  dispatch: LocalExecutorDispatch,
  cwd: string = process.cwd()
): Promise<ExecutorQueueArtifacts> {
  const rootDir = getExecutorQueueRoot(cwd);
  const packetDir = path.join(rootDir, dispatch.id);
  const packetJsonPath = path.join(packetDir, "packet.json");
  const promptMdPath = path.join(packetDir, "prompt.md");
  const verificationJsonPath = path.join(packetDir, "verification.json");

  await mkdir(packetDir, { recursive: true });

  const artifactPayload = {
    ...dispatch,
    safety: {
      mode: "dry_run",
      shellExecution: false,
      note: "Queue artifacts only — Cursor CLI or local agent consumes these files."
    }
  };

  await writeFile(packetJsonPath, `${JSON.stringify(artifactPayload, null, 2)}\n`, "utf8");
  await writeFile(promptMdPath, `${dispatch.prompt.trim()}\n`, "utf8");
  await writeFile(
    verificationJsonPath,
    `${JSON.stringify(
      {
        verificationCommands: dispatch.verificationCommands,
        stopConditions: dispatch.stopConditions,
        allowedPaths: dispatch.allowedPaths,
        forbiddenPaths: dispatch.forbiddenPaths
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return { rootDir, packetDir, packetJsonPath, promptMdPath, verificationJsonPath };
}

export function markExecutorDispatched(
  dispatch: LocalExecutorDispatch,
  queueArtifactPath: string
): LocalExecutorDispatch {
  const timestamp = nowIso();
  return {
    ...dispatch,
    status: "dispatched",
    queueArtifactPath,
    dispatchedAt: timestamp,
    updatedAt: timestamp
  };
}

export function applyExecutorResult(
  dispatch: LocalExecutorDispatch,
  result: LocalExecutorResultInput
): LocalExecutorDispatch {
  const timestamp = nowIso();
  const terminal = result.status === "completed" || result.status === "failed";

  return {
    ...dispatch,
    status: result.status as LocalExecutorStatus,
    resultSummary: result.resultSummary?.trim() || dispatch.resultSummary,
    errorMessage: result.errorMessage?.trim() || dispatch.errorMessage,
    updatedAt: timestamp,
    completedAt: terminal ? timestamp : dispatch.completedAt
  };
}

export function summarizeExecutorBridge(
  dispatches: LocalExecutorDispatch[],
  queueRoot: string = getExecutorQueueRoot()
): {
  enabled: boolean;
  mode: "dry_run";
  queueRoot: string;
  queuedCount: number;
  dispatchedCount: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
  blockedCount: number;
  lastDispatch: LocalExecutorDispatch | null;
} {
  const count = (status: LocalExecutorStatus) =>
    dispatches.filter((dispatch) => dispatch.status === status).length;

  const sorted = [...dispatches].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return {
    enabled: isExecutorBridgeEnabled(),
    mode: "dry_run",
    queueRoot,
    queuedCount: count("queued"),
    dispatchedCount: count("dispatched"),
    runningCount: count("running"),
    completedCount: count("completed"),
    failedCount: count("failed"),
    blockedCount: count("blocked"),
    lastDispatch: sorted[0] ?? null
  };
}
