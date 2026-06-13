import { expect, test } from "@playwright/test";
import { assertNoForbiddenControls, assertSideProjectsBlocked } from "./safety-assertions";

const PACKET_OBJECTIVE = "E2E 0.37 create approve dispatch flow";

test.describe("Work packet create → approve → dispatch (E2E mock API)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?section=runs");
    await expect(page.getByTestId("work-packet-create-panel")).toBeVisible();
  });

  test("creates draft, marks ready, approves, and dry-run dispatches", async ({ page }) => {
    await page.getByTestId("work-packet-create-objective").fill(PACKET_OBJECTIVE);
    await page.getByTestId("work-packet-create-governance-checkbox").check();
    await page.getByTestId("work-packet-create-submit").click();
    await expect(page.getByTestId("work-packet-create-success")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: PACKET_OBJECTIVE }).click();
    await page.getByTestId("work-packet-mark-ready").click();
    await expect(page.getByText(/Mark ready succeeded/i)).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("work-packet-operator-id").fill("operator-e2e");
    await page.getByTestId("work-packet-approve").click();
    await expect(page.getByText(/Approve succeeded/i)).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("work-packet-dispatch").click();
    await expect(page.getByText(/Dispatch \(dry-run queue\) succeeded/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("work-packet-dispatch-id")).toBeVisible();
    await expect(page.getByTestId("work-packet-dispatch-id")).toContainText("exec_e2e");
    await expect(page.getByTestId("work-packet-awaiting-notice")).toBeVisible();
  });

  test("safety — no shell, Cursor CLI, delete, GUING creation", async ({ page }) => {
    await assertNoForbiddenControls(page);
    await assertSideProjectsBlocked(page);
    const realmSelect = page.getByTestId("work-packet-create-realm");
    await expect(realmSelect.locator("option")).toHaveText(["realm_realmos", "realm_realm_os"]);
    await expect(page.getByRole("button", { name: /Delete/i })).toHaveCount(0);
  });
});
