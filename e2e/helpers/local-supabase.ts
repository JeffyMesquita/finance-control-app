import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const loopbackHosts = new Set(["127.0.0.1", "localhost", "::1"]);

function readLocalE2eEnvironment(): Record<string, string> {
  const path = resolve("../finance-control-backend/.env.e2e");
  if (!existsSync(path)) {
    throw new Error("Missing ../finance-control-backend/.env.e2e for local browser tests.");
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/u)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/u))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1], match[2].replace(/^['"]|['"]$/gu, "")])
  );
}

function createLocalAdminClient() {
  const environment = readLocalE2eEnvironment();
  const url = new URL(environment.SUPABASE_URL ?? "");

  if (!loopbackHosts.has(url.hostname) || !environment.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Browser-test cleanup is restricted to a local Supabase service role.");
  }

  return createClient(url.origin, environment.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function deleteLocalUserByEmail(email: string): Promise<void> {
  const client = createLocalAdminClient();
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1_000 });

  if (error) {
    throw error;
  }

  const user = data.users.find((candidate) => candidate.email === email);
  if (!user) {
    return;
  }

  const { error: deleteError } = await client.auth.admin.deleteUser(user.id);
  if (deleteError) {
    throw deleteError;
  }
}
