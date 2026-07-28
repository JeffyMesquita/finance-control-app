import { defineConfig, devices } from "@playwright/test";

const frontendUrl = "http://127.0.0.1:3000";
const backendUrl = "http://127.0.0.1:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm --dir ../finance-control-backend start:dev",
      env: { PORT: "3001" },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: `${backendUrl}/health/live`,
    },
    {
      command: "pnpm dev --port 3000",
      env: { BACKEND_API_ORIGIN: backendUrl },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: frontendUrl,
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
