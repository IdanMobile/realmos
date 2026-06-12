import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { isDangerousTerminalCommand } from "./forbidden";

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_BUFFER = 512 * 1024;

export type TerminalExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type TerminalExecutionError = {
  message: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
};

export async function executeApprovedTerminalCommand(input: {
  command: string;
  cwd?: string;
  timeoutMs?: number;
}): Promise<TerminalExecutionResult> {
  const command = input.command.trim();
  if (!command) {
    throw new Error("Terminal command is empty.");
  }
  if (isDangerousTerminalCommand(command)) {
    throw new Error("Dangerous terminal command pattern blocked even when execution is enabled.");
  }

  const shell = process.env.SHELL || "/bin/bash";
  try {
    const { stdout, stderr } = await execFileAsync(shell, ["-lc", command], {
      cwd: input.cwd,
      timeout: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxBuffer: DEFAULT_MAX_BUFFER,
      env: process.env
    });
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0
    };
  } catch (error) {
    const execError = error as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number | string;
    };
    if (execError.code === "ETIMEDOUT") {
      throw new Error(`Terminal command timed out after ${input.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms.`);
    }
    const exitCode = typeof execError.code === "number" ? execError.code : 1;
    throw {
      message: execError.message || "Terminal command failed.",
      stdout: execError.stdout?.toString(),
      stderr: execError.stderr?.toString(),
      exitCode
    } satisfies TerminalExecutionError;
  }
}
