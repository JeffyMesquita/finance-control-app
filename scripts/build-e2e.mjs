import { spawnSync } from "node:child_process";

const backendOrigin = process.env.BACKEND_API_ORIGIN ?? "http://127.0.0.1:3001";
const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(command, ["build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    BACKEND_API_ORIGIN: backendOrigin,
    NEXT_PUBLIC_E2E_MODE: "true",
    NEXT_PUBLIC_E2E_RECAPTCHA_TOKEN:
      process.env.NEXT_PUBLIC_E2E_RECAPTCHA_TOKEN ?? "local-e2e-recaptcha-token",
    NEXT_PUBLIC_NEST_DOMAINS:
      process.env.NEXT_PUBLIC_NEST_DOMAINS ??
      "profile,accounts,categories,transactions,goals,savings-boxes,dashboard,reports,export,investments,feedback,referrals,admin,payment-reminders",
  },
});

if (result.error) {
  throw result.error;
}
process.exit(result.status ?? 1);
