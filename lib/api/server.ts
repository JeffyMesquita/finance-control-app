import { cookies } from "next/headers";

import type { ApiResponse, PaginatedApiResponse } from "@/lib/api/contracts";
import type { QueryApi } from "@/lib/api/query-options";

const BACKEND_API_ORIGIN = process.env.BACKEND_API_ORIGIN?.replace(/\/$/u, "");

export class ServerApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

async function request(path: string): Promise<Response> {
  if (!BACKEND_API_ORIGIN) {
    throw new ServerApiError(500, "BACKEND_API_ORIGIN nao configurado");
  }
  const cookieHeader = (await cookies()).toString();
  return fetch(`${BACKEND_API_ORIGIN}/api/v1${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
}

export async function serverBackendRequest<T>(path: string): Promise<T> {
  const response = await request(path);
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new ServerApiError(
      response.status,
      payload.success ? "Falha na API backend" : payload.error
    );
  }
  return payload.data as T;
}

export async function serverBackendPaginatedRequest<T>(
  path: string
): Promise<Extract<PaginatedApiResponse<T>, { success: true }>> {
  const response = await request(path);
  const payload = (await response.json()) as PaginatedApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new ServerApiError(
      response.status,
      payload.success ? "Falha na API backend" : payload.error
    );
  }
  return payload as Extract<PaginatedApiResponse<T>, { success: true }>;
}

export const serverQueryApi: QueryApi = {
  data: <T>(path: string) => serverBackendRequest<T>(path),
  paginated: <T>(path: string) => serverBackendPaginatedRequest<T>(path),
};
