import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendSpec = resolve(root, "..", "finance-control-backend", "openapi", "openapi.json");
const localSpec = resolve(root, "openapi", "backend.json");
const generatedTypes = resolve(root, "lib", "api", "generated", "schema.ts");
const pnpmEntrypoint = process.env.npm_execpath;

if (!pnpmEntrypoint) {
  throw new Error("contracts:check must run through pnpm.");
}

const [backendJson, localJson] = await Promise.all([
  readFile(backendSpec, "utf8"),
  readFile(localSpec, "utf8"),
]);

if (backendJson !== localJson) {
  throw new Error("Backend OpenAPI changed. Run pnpm contracts:sync.");
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "finance-control-openapi-"));
const temporaryTypes = join(temporaryDirectory, "schema.ts");

try {
  const result = spawnSync(
    process.execPath,
    [pnpmEntrypoint, "exec", "openapi-typescript", localSpec, "-o", temporaryTypes],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error("Unable to generate OpenAPI types.");
  }

  const [expectedTypes, generatedOutput] = await Promise.all([
    readFile(generatedTypes, "utf8"),
    readFile(temporaryTypes, "utf8"),
  ]);
  if (expectedTypes !== generatedOutput) {
    throw new Error("Generated OpenAPI types are outdated. Run pnpm contracts:sync.");
  }
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
