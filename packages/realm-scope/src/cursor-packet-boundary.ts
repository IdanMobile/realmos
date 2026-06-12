import type { CursorWorkPacket } from "@realmos/contracts";
import {
  buildCursorRepositoryContext,
  REPOSITORY_BOUNDARY_PACKET_RULES,
  type RepositoryWorkScope
} from "./repository-conflicts";
import type { RepositoryBinding } from "@realmos/contracts";

export type EnrichWorkPacketInput = {
  packet: CursorWorkPacket;
  realmId: string;
  scope: "global" | "realm";
  repositoryBinding: RepositoryBinding;
};

export function enrichCursorWorkPacketWithRepositoryBoundary(
  input: EnrichWorkPacketInput
): CursorWorkPacket {
  const repositoryContext = buildCursorRepositoryContext(input.repositoryBinding);

  return {
    ...input.packet,
    scope: input.scope,
    realmId: input.realmId,
    repositoryContext,
    filesToRead: [
      ...input.packet.filesToRead,
      "REALM_REPOSITORY_BOUNDARY_STRATEGY.md",
      "CURSOR_SSOT.md"
    ],
    filesToModify: input.packet.filesToModify.filter((path) =>
      repositoryContext.allowedPaths.some((allowed) => path.startsWith(allowed.replace("**", "")))
    ),
    rules: [...input.packet.rules, ...REPOSITORY_BOUNDARY_PACKET_RULES],
    expectedOutput: [
      ...input.packet.expectedOutput,
      "Repository boundary respected for realm scope",
      `Verification: ${repositoryContext.verificationCommands.join(", ")}`
    ]
  };
}

export function scopeStrategyLabel(scope: RepositoryWorkScope): string {
  return `${scope.realmId}@${scope.repositoryBindingId}`;
}
