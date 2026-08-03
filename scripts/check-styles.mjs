import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(process.cwd(), ".next", "static");
const cssFiles = [];

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.name.endsWith(".css")) cssFiles.push(path);
  }
}

await collect(root);
const css = (await Promise.all(cssFiles.map((path) => readFile(path, "utf8")))).join("\n");
const checks = [
  [/@tailwind\b/u, "raw @tailwind directive", true],
  [/@apply\b/u, "raw @apply directive", true],
  [/\.flex\{/u, "missing .flex utility", false],
  [/\.grid\{/u, "missing .grid utility", false],
  [/\.p-6\{/u, "missing .p-6 utility", false],
];

const failures = checks.filter(([pattern, _message, forbidden]) =>
  forbidden ? pattern.test(css) : !pattern.test(css)
);

if (failures.length > 0) {
  console.error(`styles:check failed: ${failures.map(([, message]) => message).join(", ")}`);
  process.exit(1);
}

console.log(`styles:check passed (${cssFiles.length} CSS files)`);
