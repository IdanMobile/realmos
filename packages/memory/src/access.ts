import type { Agent, Memory, MemoryPermission } from "@realmos/contracts";

export type AgentMemoryContext = {
  agent: Agent;
  businessMemoryScopeId?: string;
};

function permissionAllowsScope(permission: MemoryPermission, memory: Memory): boolean {
  if (permission.scope !== memory.scope) return false;
  if (permission.access === "none") return false;

  if (memory.scope === "global") {
    return permission.scope === "global";
  }

  if (!permission.allowedScopeIds || permission.allowedScopeIds.length === 0) {
    return false;
  }

  return permission.allowedScopeIds.includes(memory.scopeId);
}

export function canAgentReadMemory(context: AgentMemoryContext, memory: Memory): boolean {
  const { agent, businessMemoryScopeId } = context;

  if (agent.scope === "global") {
    return true;
  }

  for (const permission of agent.memoryAccess) {
    if (permission.access === "read" || permission.access === "read_write") {
      if (permissionAllowsScope(permission, memory)) {
        return true;
      }
    }
  }

  if (memory.scope === "agent" && memory.scopeId === agent.id) {
    return true;
  }

  return false;
}

export function canAgentWriteMemory(context: AgentMemoryContext, memory: Memory): boolean {
  const { agent } = context;

  if (agent.scope === "global") {
    return true;
  }

  for (const permission of agent.memoryAccess) {
    if (permission.access === "write" || permission.access === "read_write") {
      if (permissionAllowsScope(permission, memory)) {
        return true;
      }
    }
  }

  if (memory.scope === "agent" && memory.scopeId === agent.id) {
    return true;
  }

  return false;
}

export function filterMemoriesForAgent(
  context: AgentMemoryContext,
  memories: Memory[],
  options: { includeSensitive?: boolean } = {}
): Memory[] {
  return memories.filter((memory) => {
    if (!canAgentReadMemory(context, memory)) {
      return false;
    }
    if (!options.includeSensitive && memory.sensitivity === "sensitive") {
      return false;
    }
    return true;
  });
}
