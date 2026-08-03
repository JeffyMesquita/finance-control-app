const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 15_000);

function normalizeOrigin(value, name) {
  if (!value) {
    throw new Error(`${name} nao configurado`);
  }

  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${name} deve ser uma URL http(s) sem credenciais`);
  }

  return url.origin;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });

  const body = await response.text();
  let json = null;
  try {
    json = body ? JSON.parse(body) : null;
  } catch {
    // Binary or empty response is valid for unrelated endpoints; smoke checks below
    // only inspect JSON where the contract requires it.
  }

  return { response, body, json };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const frontendOrigin = normalizeOrigin(
  process.env.SMOKE_FRONTEND_URL ?? process.env.NEXT_PUBLIC_BASE_URL,
  "SMOKE_FRONTEND_URL/NEXT_PUBLIC_BASE_URL"
);
const backendOrigin = normalizeOrigin(
  process.env.SMOKE_BACKEND_URL ?? process.env.BACKEND_API_ORIGIN,
  "SMOKE_BACKEND_URL/BACKEND_API_ORIGIN"
);

const checks = [
  { name: "frontend", url: `${frontendOrigin}/`, expectedStatus: 200 },
  {
    name: "backend liveness",
    url: `${backendOrigin}/api/v1/health/live`,
    expectedStatus: 200,
  },
  {
    name: "same-origin proxy liveness",
    url: `${frontendOrigin}/api/backend/health/live`,
    expectedStatus: 200,
  },
];

for (const check of checks) {
  const { response } = await request(check.url);
  assert(
    response.status === check.expectedStatus,
    `${check.name}: esperado ${check.expectedStatus}, recebido ${response.status}`
  );
  console.log(`ok ${check.name} (${response.status})`);
}

const csrf = await request(`${frontendOrigin}/api/backend/auth/csrf`);
assert(csrf.response.status === 200, `csrf: esperado 200, recebido ${csrf.response.status}`);
assert(Boolean(csrf.response.headers.get("set-cookie")), "csrf: resposta nao emitiu cookie");
assert(csrf.json?.success === true, "csrf: envelope de sucesso ausente");
console.log("ok csrf (200 + cookie)");

const me = await request(`${frontendOrigin}/api/backend/auth/me`);
assert(me.response.status === 401, `auth/me: esperado 401, recebido ${me.response.status}`);
assert(me.json?.success === false, "auth/me: envelope de erro ausente");
console.log("ok auth/me sem sessao (401)");
