import { expect, type Page } from "@playwright/test";

const forbiddenButtonPatterns = [
  /shell execution/i,
  /run shell/i,
  /invoke cursor cli/i,
  /cursor cli/i,
  /\bdelete\b/i,
  /autonomous cleanup/i,
  /auto[- ]?cleanup/i,
  /execute actions/i,
  /voice/i,
  /\bmic\b/i,
  /microphone/i
];

export async function assertNoForbiddenControls(page: Page): Promise<void> {
  for (const pattern of forbiddenButtonPatterns) {
    await expect(page.getByRole("button", { name: pattern })).toHaveCount(0);
  }
}

export async function assertSideProjectsBlocked(page: Page): Promise<void> {
  const banner = page.getByTestId("governance-safety-banner");
  await expect(banner).toContainText(/GUING|Side projects/i);
  await expect(banner).toContainText(/blocked/i);
  await expect(page.getByText(/GUING.*active next work/i)).toHaveCount(0);
}

export async function assertJarvisSafetyNotice(page: Page): Promise<void> {
  const notice = page.getByTestId("jarvis-safety-notice");
  await expect(notice).toContainText("Jarvis cannot execute actions yet");
  await expect(notice).toContainText("No shell");
  await expect(notice).toContainText("No Cursor CLI");
}
