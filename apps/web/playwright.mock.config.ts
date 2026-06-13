import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.E2E_MOCK_WEB_PORT ?? 3012);

/** Mock-seed mode: API unreachable at SSR → dashboard uses local seed JSON. Uses next dev for runtime env. */
export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/mock-mode.smoke.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 90_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${webPort}`,
    trace: "on-first-retry"
  },
  webServer: {
    command: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:9 pnpm exec next dev --port ${webPort}`,
    url: `http://127.0.0.1:${webPort}`,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000
  }
});
