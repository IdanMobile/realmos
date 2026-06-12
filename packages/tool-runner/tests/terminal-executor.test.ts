import { describe, expect, it } from "vitest";
import { executeApprovedTerminalCommand } from "../src/terminal-executor";

describe("terminal executor", () => {
  it("blocks dangerous commands even when execution is enabled", async () => {
    await expect(executeApprovedTerminalCommand({ command: "rm -rf /" })).rejects.toThrow(
      /blocked/i
    );
  });

  it("executes safe commands", async () => {
    const result = await executeApprovedTerminalCommand({ command: "echo realm_os_tool_test" });
    expect(result.stdout).toContain("realm_os_tool_test");
    expect(result.exitCode).toBe(0);
  });
});
