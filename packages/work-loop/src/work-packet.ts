import type { CursorWorkPacket, WorkItem } from "@realmos/contracts";
import { makeWorkLoopId, nowIso } from "./id";

export type GenerateWorkPacketInput = {
  workItem: WorkItem;
  createdByAgentId?: string;
  filesToRead?: string[];
  filesToModify?: string[];
};

export function generateCursorWorkPacket(input: GenerateWorkPacketInput): CursorWorkPacket {
  const timestamp = nowIso();
  const agentId = input.createdByAgentId ?? "agent_jarvis";

  return {
    id: makeWorkLoopId("packet"),
    workItemId: input.workItem.id,
    title: `Cursor packet: ${input.workItem.title}`,
    status: "ready_for_cursor",
    goal: input.workItem.title,
    filesToRead: input.filesToRead ?? [
      "CURSOR_SSOT.md",
      "SSOT_TODO_CHECKLIST.md",
      "PROJECT_STATE.md"
    ],
    filesToModify: input.filesToModify ?? [],
    rules: [
      "Follow CURSOR_SSOT.md",
      "Use ADD + TDD",
      "Stop only for human-only actions"
    ],
    expectedOutput: [
      "Implementation complete for scoped work item",
      "Tests passing",
      "PROJECT_STATE.md updated if phase changed"
    ],
    stopAfter: "Work item verification commands pass",
    createdByAgentId: agentId,
    createdAt: timestamp
  };
}
