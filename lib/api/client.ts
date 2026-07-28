import type { ApiFailure, ApiResponse, PaginatedApiResponse } from "./contracts";

const API_BASE_PATH = "/api/backend";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
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

interface ApiRequestOptions extends Omit<RequestInit, "body" | "method"> {
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

async function ensureCsrfToken(): Promise<string> {
  const existingToken = readCsrfToken();
  if (existingToken) return existingToken;

  const response = await fetch(`${API_BASE_PATH}/auth/csrf`, {
    credentials: "include",
    method: "POST",
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
      const response = await fetch(`${API_BASE_PATH}/auth/refresh`, {
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

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, method = "GET", retryAfterRefresh = true, ...fetchOptions } = options;
  const isUnsafeMethod = !SAFE_METHODS.has(method);
  const headers = new Headers(fetchOptions.headers);

  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }

  if (isUnsafeMethod && !path.startsWith("/auth/")) {
    headers.set("x-csrf-token", await ensureCsrfToken());
  }

  const response = await fetch(`${API_BASE_PATH}${path}`, {
    ...fetchOptions,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    headers,
    method,
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (response.status === 401 && retryAfterRefresh && !path.startsWith("/auth/")) {
    await refreshSession();
    return apiRequest<T>(path, { ...options, retryAfterRefresh: false });
  }

  if (!response.ok || !payload.success) {
    throw toApiError(response, payload);
  }

  if (payload.data === undefined) {
    return undefined as T;
  }

  return payload.data;
}

export async function apiPaginatedRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<Extract<PaginatedApiResponse<T>, { success: true }>> {
  const { body, method = "GET", retryAfterRefresh = true, ...fetchOptions } = options;
  const isUnsafeMethod = !SAFE_METHODS.has(method);
  const headers = new Headers(fetchOptions.headers);

  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }

  if (isUnsafeMethod && !path.startsWith("/auth/")) {
    headers.set("x-csrf-token", await ensureCsrfToken());
  }

  const response = await fetch(`${API_BASE_PATH}${path}`, {
    ...fetchOptions,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    headers,
    method,
  });
  const payload = (await response.json()) as PaginatedApiResponse<T>;

  if (response.status === 401 && retryAfterRefresh && !path.startsWith("/auth/")) {
    await refreshSession();
    return apiPaginatedRequest<T>(path, {
      ...options,
      retryAfterRefresh: false,
    });
  }

  if (!response.ok || !payload.success) {
    throw toApiError(response, payload);
  }

  return payload as Extract<PaginatedApiResponse<T>, { success: true }>;
}

export function isRetriableApiError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.status === 429 || error.status >= 500;
}
