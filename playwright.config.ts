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
  reporter: "list",
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm --dir ../finance-control-backend start:dev",
      env: {
        NODE_ENV: "test",
        PORT: "3001",
        PUBLIC_APP_URL: frontendUrl,
        CORS_ORIGINS: frontendUrl,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: `${backendUrl}/api/v1/health/live`,
    },
    {
      command: "pnpm dev --port 3000",
      env: {
        BACKEND_API_ORIGIN: backendUrl,
        NEXT_PUBLIC_E2E_MODE: "true",
        NEXT_PUBLIC_E2E_RECAPTCHA_TOKEN: recaptchaToken,
        NEXT_PUBLIC_NEST_DOMAINS: "profile,accounts,categories,transactions",
      },
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
