import type { ToolRunnerStore } from "@realmos/tool-runner";
import type { RealmOSDatabase } from "../db/types";

export function createToolRunnerStore(db: RealmOSDatabase): ToolRunnerStore {
  return {
    getAgent: (id) => db.getAgent(id),
    createToolRunRequest: (request) => db.createToolRunRequest(request),
    updateToolRunRequest: (id, patch) => db.updateToolRunRequest(id, patch),
    createToolRunResult: (result) => db.createToolRunResult(result),
    createApproval: (approval) => db.createApproval(approval),
    appendAuditEvent: (event) => db.appendAuditEvent(event)
  };
}
