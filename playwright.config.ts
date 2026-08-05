import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const configDir = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(configDir, "../finance-control-backend");
const frontendUrl = "http://127.0.0.1:3000";
const backendUrl = "http://127.0.0.1:3001";
const recaptchaToken = process.env.E2E_RECAPTCHA_TEST_TOKEN ?? "local-e2e-recaptcha-token";

function loadLocalE2eEnv(): Record<string, string> {
  const envPath = resolve(backendDir, ".env.e2e");
  try {
    return Object.fromEntries(
      readFileSync(envPath, "utf8")
        .split(/\r?\n/u)
        .filter((line) => line.trim() && !line.trim().startsWith("#"))
        .map((line) => {
          const separator = line.indexOf("=");
          if (separator < 1) throw new Error(`Entrada inválida em ${envPath}`);
          const key = line.slice(0, separator).trim();
          const value = line
            .slice(separator + 1)
            .trim()
            .replace(/^['"]|['"]$/gu, "");
          return [key, value];
        })
        .filter(([key]) => key.length > 0)
    );
  } catch (error) {
    throw new Error(`Nao foi possivel carregar ${envPath}`, { cause: error });
  }
}

const localE2eEnv = loadLocalE2eEnv();

const requiredLocalKeys = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "REFERRAL_COOKIE_SECRET",
] as const;
for (const key of requiredLocalKeys) {
  if (!localE2eEnv[key]) {
    throw new Error(`Variável ${key} ausente em ${resolve(backendDir, ".env.e2e")}`);
  }
}

for (const key of ["SUPABASE_URL", "PUBLIC_APP_URL", "CORS_ORIGINS"] as const) {
  const value = localE2eEnv[key];
  if (!value) continue;
  for (const rawUrl of value.split(",")) {
    const url = new URL(rawUrl.trim());
    if (!["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
      throw new Error(`URL não local em ${key}: ${url.origin}`);
    }
  }
}

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
      command: "pnpm start:prod",
      cwd: backendDir,
      env: {
        ...localE2eEnv,
        NODE_ENV: "test",
        PORT: "3001",
        PUBLIC_APP_URL: frontendUrl,
        CORS_ORIGINS: frontendUrl,
        AUTH_REGISTER_RATE_LIMIT: "20",
        AUTH_REGISTER_RATE_LIMIT_TTL_MS: String(60 * 60 * 1000),
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: `${backendUrl}/api/v1/health/live`,
    },
    {
      command: "pnpm start",
      env: {
        BACKEND_API_ORIGIN: backendUrl,
        NEXT_PUBLIC_E2E_MODE: "true",
        NEXT_PUBLIC_E2E_RECAPTCHA_TOKEN: recaptchaToken,
        NEXT_PUBLIC_NEST_DOMAINS:
          "profile,accounts,categories,transactions,goals,savings-boxes,dashboard,reports,export,investments,feedback,referrals,admin,payment-reminders",
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
