import { expect, test } from "@playwright/test";
import { assertJarvisSafetyNotice, assertNoForbiddenControls, assertSideProjectsBlocked } from "./safety-assertions";

test.describe("Command Center — mock seed mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("governance-safety-banner")).toBeVisible();
  });

  test("shows Mock data badge and honest degraded API messaging", async ({ page }) => {
    await expect(page.getByTestId("data-source-badge")).toHaveText("Mock data");
    await expect(page.getByTestId("governance-safety-banner")).toContainText("Mock seed");
    await assertSideProjectsBlocked(page);
    await assertNoForbiddenControls(page);
  });

  test("Ask Jarvis shows safety notice and live API required on send", async ({ page }) => {
    await page.getByTestId("ask-jarvis-button").click();
    await expect(page.getByTestId("jarvis-chat-panel")).toBeVisible();
    await assertJarvisSafetyNotice(page);
    await page.getByTestId("jarvis-chat-input").fill("Status check");
    await page.getByTestId("jarvis-chat-submit").click();
    await expect(page.getByTestId("jarvis-message-error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("jarvis-message-error")).toContainText(/Live API|unavailable/i);
  });
});
