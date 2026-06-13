import { describe, expect, it } from "vitest";
import { REALMOS_LIFECYCLE_DEFAULTS } from "./defaults";
import {
  formValuesToInput,
  validateWorkPacketCreateForm,
  type WorkPacketCreateFormValues
} from "./form-validation";

function baseForm(overrides: Partial<WorkPacketCreateFormValues> = {}): WorkPacketCreateFormValues {
  return {
    initiativeId: REALMOS_LIFECYCLE_DEFAULTS.initiativeId,
    objective: "Add work packet creation UI",
    realmId: REALMOS_LIFECYCLE_DEFAULTS.realmId,
    repositoryId: REALMOS_LIFECYCLE_DEFAULTS.repositoryId,
    branchTarget: REALMOS_LIFECYCLE_DEFAULTS.branchTarget,
    instructions: REALMOS_LIFECYCLE_DEFAULTS.instructions,
    allowedPathsText: REALMOS_LIFECYCLE_DEFAULTS.allowedPathsText,
    forbiddenPathsText: REALMOS_LIFECYCLE_DEFAULTS.forbiddenPathsText,
    verificationCommandsText: REALMOS_LIFECYCLE_DEFAULTS.verificationCommandsText,
    expectedArtifactsText: REALMOS_LIFECYCLE_DEFAULTS.expectedArtifactsText,
    governanceConfirmed: true,
    ...overrides
  };
}

describe("validateWorkPacketCreateForm", () => {
  it("accepts RealmOS-safe defaults", () => {
    const errors = validateWorkPacketCreateForm(baseForm());
    expect(errors).toHaveLength(0);
  });

  it("allows prohibition language in instructions", () => {
    const errors = validateWorkPacketCreateForm(
      baseForm({ instructions: REALMOS_LIFECYCLE_DEFAULTS.instructions })
    );
    expect(errors).toHaveLength(0);
  });

  it("blocks unsafe execution requests in instructions", () => {
    const errors = validateWorkPacketCreateForm(
      baseForm({ instructions: "Run cursor cli to apply changes automatically." })
    );
    expect(errors.some((e) => e.field === "instructions")).toBe(true);
  });

  it("blocks GUING initiative", () => {
    const errors = validateWorkPacketCreateForm(baseForm({ initiativeId: "GUING bootstrap" }));
    expect(errors.some((e) => e.field === "initiativeId")).toBe(true);
  });

  it("blocks disallowed realm", () => {
    const errors = validateWorkPacketCreateForm(baseForm({ realmId: "realm_guing" }));
    expect(errors.some((e) => e.field === "realmId")).toBe(true);
  });

  it("requires governance confirmation", () => {
    const errors = validateWorkPacketCreateForm(baseForm({ governanceConfirmed: false }));
    expect(errors.some((e) => e.field === "governanceConfirmed")).toBe(true);
  });

  it("maps initiative to sourceWorkItemId", () => {
    const input = formValuesToInput(baseForm({ initiativeId: "0.37" }));
    expect(input.sourceWorkItemId).toBe("initiative:0.37");
  });
});
