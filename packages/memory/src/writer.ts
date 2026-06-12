import type { Memory } from "@realmos/contracts";
import { makeMemoryId, nowIso } from "./id";
import type { MemoryStore, WriteMemoryInput } from "./types";

function validateWriteInput(input: WriteMemoryInput): void {
  if (!input.scope.trim()) {
    throw new Error("Memory scope is required.");
  }
  if (!input.scopeId.trim()) {
    throw new Error("Memory scopeId is required.");
  }
  if (!input.title.trim()) {
    throw new Error("Memory title is required.");
  }
  if (!input.content.trim()) {
    throw new Error("Memory content is required.");
  }
}

export async function writeMemory(store: MemoryStore, input: WriteMemoryInput): Promise<Memory> {
  validateWriteInput(input);

  const timestamp = nowIso();
  return store.createMemory({
    id: input.id ?? makeMemoryId(input.title),
    scope: input.scope,
    scopeId: input.scopeId,
    kind: input.kind,
    title: input.title.trim(),
    content: input.content.trim(),
    source: input.source ?? "manual",
    sensitivity: input.sensitivity ?? "normal",
    retention: input.retention ?? "keep",
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function editMemory(
  store: MemoryStore,
  id: string,
  patch: Partial<Pick<Memory, "title" | "content" | "kind" | "sensitivity" | "retention">>
): Promise<Memory | null> {
  const existing = await store.getMemory(id);
  if (!existing) return null;

  const nextTitle = patch.title?.trim();
  const nextContent = patch.content?.trim();
  if (patch.title !== undefined && !nextTitle) {
    throw new Error("Memory title cannot be empty.");
  }
  if (patch.content !== undefined && !nextContent) {
    throw new Error("Memory content cannot be empty.");
  }

  return store.updateMemory(id, {
    ...patch,
    ...(nextTitle !== undefined ? { title: nextTitle } : {}),
    ...(nextContent !== undefined ? { content: nextContent } : {}),
    updatedAt: nowIso()
  });
}

export async function deleteMemory(store: MemoryStore, id: string): Promise<boolean> {
  return store.deleteMemory(id);
}
