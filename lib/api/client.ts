import createClient from "openapi-fetch";
import type { ApiFailure, ApiResponse, PaginatedApiResponse } from "./contracts";
import type { paths } from "./generated/schema";

const API_BASE_PATH = "/api/backend";
const REQUEST_TIMEOUT_MS = 15_000;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const AUTH_CSRF_BOOTSTRAP_PATHS = new Set([
  "/auth/csrf",
  "/auth/email",
  "/auth/login",
  "/auth/register",
]);
const AUTH_REFRESH_EXCLUDED_PATHS = new Set([
  ...AUTH_CSRF_BOOTSTRAP_PATHS,
  "/auth/refresh",
  "/auth/logout",
]);
let refreshPromise: Promise<void> | undefined;

export class ApiError extends Error {
  readonly code?: string;
  readonly requestId?: string;
  readonly retryAfterMs?: number;
  readonly status: number;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      requestId?: string;
      retryAfterMs?: number;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.retryAfterMs = options.retryAfterMs;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body" | "method"> {
  body?: unknown;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  retryAfterRefresh?: boolean;
}

function readCsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("ft_csrf="))
    ?.split("=")
    .slice(1)
    .join("=");
}

function getRequestPath(input: RequestInfo | URL): string {
  const rawInput =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const pathname = rawInput.startsWith("http")
    ? new URL(rawInput).pathname
    : rawInput.split("?", 1)[0];

  return pathname.startsWith(API_BASE_PATH)
    ? pathname.slice(API_BASE_PATH.length) || "/"
    : pathname;
}

function createTimeoutSignal(signal?: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (signal) {
    if (signal.aborted) {
      abort();
    } else {
      signal.addEventListener("abort", abort, { once: true });
    }
  }

  return {
    dispose() {
      window.clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    },
    signal: controller.signal,
  };
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const { signal, ...requestInit } = init;
  const timeout = createTimeoutSignal(signal ?? undefined);

  try {
    return await fetch(input, { ...requestInit, signal: timeout.signal });
  } finally {
    timeout.dispose();
  }
}

async function ensureCsrfToken(): Promise<string> {
  const existingToken = readCsrfToken();
  if (existingToken) return existingToken;

  const response = await fetchWithTimeout(`${API_BASE_PATH}/auth/csrf`, {
    credentials: "include",
    method: "GET",
  });
  const payload = (await response.json()) as ApiResponse<{ token: string }>;

  if (!response.ok || !payload.success) {
    throw toApiError(response, payload);
  }

  if (!payload.data?.token) {
    throw new ApiError("Resposta CSRF inválida", { status: response.status });
  }

  return payload.data.token;
}

async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const csrfToken = await ensureCsrfToken();
      const response = await fetchWithTimeout(`${API_BASE_PATH}/auth/refresh`, {
        credentials: "include",
        headers: { "x-csrf-token": csrfToken },
        method: "POST",
      });
      const payload = (await response.json()) as ApiResponse<void>;

      if (!response.ok || !payload.success) {
        throw toApiError(response, payload);
      }
    })().finally(() => {
      refreshPromise = undefined;
    });
  }

  return refreshPromise;
}

function toApiError(response: Response, payload?: ApiResponse<unknown>): ApiError {
  const failure = payload && !payload.success ? (payload as ApiFailure) : undefined;
  const retryAfter = response.headers.get("retry-after");
  const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : undefined;

  return new ApiError(failure?.error ?? "Não foi possível concluir a requisição", {
    code: failure?.code,
    requestId: failure?.requestId,
    retryAfterMs: Number.isFinite(retryAfterMs) ? retryAfterMs : undefined,
    status: response.status,
  });
}

async function requestWithSession(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retryAfterRefresh = true
): Promise<Response> {
  const path = getRequestPath(input);
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (!SAFE_METHODS.has(method) && !AUTH_CSRF_BOOTSTRAP_PATHS.has(path)) {
    headers.set("x-csrf-token", await ensureCsrfToken());
  }

  const response = await fetchWithTimeout(input, {
    ...init,
    credentials: "include",
    headers,
    method,
  });

  if (response.status === 401 && retryAfterRefresh && !AUTH_REFRESH_EXCLUDED_PATHS.has(path)) {
    await refreshSession();
    return requestWithSession(input, init, false);
  }

  return response;
}

export const authenticatedFetch: typeof fetch = (input, init) => requestWithSession(input, init);

export const backendClient = createClient<paths>({
  baseUrl: API_BASE_PATH,
  fetch: authenticatedFetch,
});

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, method = "GET", retryAfterRefresh = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }

  const response = await requestWithSession(
    `${API_BASE_PATH}${path}`,
    {
      ...fetchOptions,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    },
    retryAfterRefresh
  );
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw toApiError(response, payload);
  }

  return payload.data as T;
}

export async function apiPaginatedRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<Extract<PaginatedApiResponse<T>, { success: true }>> {
  const { body, method = "GET", retryAfterRefresh = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }

  const response = await requestWithSession(
    `${API_BASE_PATH}${path}`,
    {
      ...fetchOptions,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    },
    retryAfterRefresh
  );
  const payload = (await response.json()) as PaginatedApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw toApiError(response, payload);
  }

  return payload as Extract<PaginatedApiResponse<T>, { success: true }>;
}

export function isRetriableApiError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.status === 429 || error.status >= 500;
}
