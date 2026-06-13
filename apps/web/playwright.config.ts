import { defineConfig, devices } from "@playwright/test";

const mockApiPort = 4199;
const webPort = Number(process.env.E2E_WEB_PORT ?? 3010);
const mockApiBaseUrl = `http://127.0.0.1:${mockApiPort}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/*.spec.ts"],
  testIgnore: ["**/mock-mode.smoke.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 60_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${webPort}`,
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "node e2e/mock-api-server.mjs",
      url: `${mockApiBaseUrl}/api/health`,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        E2E_MOCK_API_PORT: String(mockApiPort)
      }
    },
    {
      command: `pnpm exec next start --port ${webPort}`,
      url: `http://127.0.0.1:${webPort}`,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000
    }
  ]
});
