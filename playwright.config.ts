import { defineConfig, devices } from "@playwright/test";

const frontendUrl = "http://127.0.0.1:3000";
const backendUrl = "http://127.0.0.1:3001";
const recaptchaToken = process.env.E2E_RECAPTCHA_TEST_TOKEN ?? "local-e2e-recaptcha-token";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  reporter: "list",
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "corepack pnpm@10.0.0 --dir ../finance-control-backend start:prod",
      env: {
        NODE_ENV: "test",
        PORT: "3001",
        PUBLIC_APP_URL: frontendUrl,
        CORS_ORIGINS: frontendUrl,
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: `${backendUrl}/api/v1/health/live`,
    },
    {
      command: "corepack pnpm@10.0.0 start",
      env: {
        BACKEND_API_ORIGIN: backendUrl,
        NEXT_PUBLIC_E2E_MODE: "true",
        NEXT_PUBLIC_E2E_RECAPTCHA_TOKEN: recaptchaToken,
        NEXT_PUBLIC_NEST_DOMAINS:
          "profile,accounts,categories,transactions,dashboard,reports,export",
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: frontendUrl,
    },
  ],
  expect: { timeout: 10_000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
