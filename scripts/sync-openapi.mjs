import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendSpec = resolve(root, "..", "finance-control-backend", "openapi", "openapi.json");
const localSpec = resolve(root, "openapi", "backend.json");
const generatedTypes = resolve(root, "lib", "api", "generated", "schema.ts");
const pnpmEntrypoint = process.env.npm_execpath;

if (!pnpmEntrypoint) {
  throw new Error("contracts:sync must run through pnpm.");
}

await mkdir(dirname(localSpec), { recursive: true });
await copyFile(backendSpec, localSpec);

const result = spawnSync(
  process.execPath,
  [pnpmEntrypoint, "exec", "openapi-typescript", localSpec, "-o", generatedTypes],
  { cwd: root, stdio: "inherit" },
);

if (result.status !== 0) {
  process.exitCode = result.status ?? 1;
}
