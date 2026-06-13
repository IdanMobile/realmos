import { expect, test } from "@playwright/test";
import {
  assertJarvisSafetyNotice,
  assertNoForbiddenControls,
  assertSideProjectsBlocked
} from "./safety-assertions";

test.describe("Command Center — live API (E2E mock server)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("governance-safety-banner")).toBeVisible();
  });

  test("A — Command Center loads with governance banner and Live API badge", async ({ page }) => {
    await expect(page.getByTestId("governance-safety-banner")).toBeVisible();
    await expect(page.getByTestId("data-source-badge")).toHaveText("Live API");
    await expect(page.getByTestId("governance-safety-banner")).toContainText("Live API");
    await expect(page.getByTestId("governance-safety-banner")).toContainText("dry_run");
    await expect(page.getByTestId("governance-safety-banner")).toContainText("disabled by default");
    await assertSideProjectsBlocked(page);
    await assertNoForbiddenControls(page);
  });

  test("B — Navigation updates URL, active state, and section content", async ({ page }) => {
    const sections = [
      { id: "overview", heading: "Overview", placeholder: false },
      { id: "runs", heading: "Live Runs", placeholder: false },
      { id: "agents", heading: "Agents", placeholder: false },
      { id: "decisions", heading: "Decisions", placeholder: true }
    ] as const;

    for (const section of sections) {
      await page.getByTestId(`nav-section-${section.id}`).click();
      if (section.id === "overview") {
        await expect(page).toHaveURL(/\/(\?.*)?$/);
        await expect(page.url()).not.toContain("section=overview");
      } else {
        await expect(page).toHaveURL(new RegExp(`section=${section.id}`));
      }
      await expect(page.getByTestId(`nav-section-${section.id}`)).toHaveAttribute("aria-current", "page");
      await expect(page.getByTestId(`command-center-section-${section.id}`)).toBeVisible();

      if (section.placeholder) {
        await expect(page.getByTestId(`section-placeholder-${section.id}`)).toBeVisible();
        await expect(page.getByTestId(`section-placeholder-${section.id}`)).toContainText(/planned|not implemented/i);
      }
    }
  });

  test("C — Ask Jarvis opens chat with safety notice and stub reply", async ({ page }) => {
    await page.getByTestId("ask-jarvis-button").click();
    await expect(page.getByTestId("jarvis-chat-panel")).toBeVisible();
    await assertJarvisSafetyNotice(page);
    await expect(page.getByTestId("jarvis-chat-input")).toBeVisible();
    await expect(page.getByTestId("jarvis-chat-submit")).toHaveText("Send");
    await expect(page.getByRole("button", { name: /voice|mic|microphone/i })).toHaveCount(0);

    await page.getByTestId("jarvis-chat-input").fill("What is the next initiative?");
    await page.getByTestId("jarvis-chat-submit").click();
    await expect(page.getByTestId("jarvis-message-jarvis")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("jarvis-message-jarvis")).toContainText("E2E stub reply");
    await assertNoForbiddenControls(page);
  });

  test("D — Necromancer panel shows approval gating and memory badge", async ({ page }) => {
    await page.getByTestId("nav-section-agents").click();
    const panel = page.locator('[aria-label="Necromancer operator panel"]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Approval required");
    await expect(panel).toContainText("Memory demo");
    await expect(panel).toContainText("No autonomous cleanup");
    await expect(panel.getByRole("checkbox")).toBeVisible();
    await expect(panel.getByText("Operator ID")).toBeVisible();
    await expect(panel.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Delete" })).toHaveCount(0);

    await panel.getByRole("button", { name: "Pause" }).click();
    await expect(panel).toContainText("Operator approval and ID are required");
    await assertNoForbiddenControls(page);
  });

  test("E — Verification Evidence panel shows gates and attach controls", async ({ page }) => {
    await page.getByTestId("nav-section-runs").click();
    await expect(page.locator('[aria-label="Verification evidence panel"]')).toBeVisible();

    await page.getByRole("button", { name: /E2E smoke lifecycle packet/i }).click();
    const panel = page.locator('[aria-label="Verification evidence panel"]');
    await expect(panel).toContainText("pnpm test");
    await expect(panel).toContainText("Missing required");
    await expect(panel.getByRole("button", { name: "Attach output evidence" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Attach CI metadata" })).toBeVisible();
    await expect(panel.getByLabel(/Paste command output/i)).toBeVisible();
    await expect(panel.getByLabel(/CI run URL/i)).toBeVisible();
    await expect(panel.getByRole("button", { name: /shell execution/i })).toHaveCount(0);
    await assertNoForbiddenControls(page);
  });

  test("Safety — no shell, Cursor CLI, delete, or autonomous cleanup controls", async ({ page }) => {
    await assertNoForbiddenControls(page);
    await assertSideProjectsBlocked(page);

    for (const sectionId of ["overview", "runs", "agents", "decisions"]) {
      await page.getByTestId(`nav-section-${sectionId}`).click();
      await assertNoForbiddenControls(page);
    }
  });
});
