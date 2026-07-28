import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "./client";

const success = (data: unknown, status = 200) =>
  new Response(JSON.stringify({ success: true, data }), { status });

const failure = (error: string, status: number) =>
  new Response(JSON.stringify({ success: false, error }), { status });

describe("apiRequest", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    document.cookie = "ft_csrf=; Max-Age=0; path=/";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("bootstraps CSRF before an unsafe request", async () => {
    fetchMock
      .mockResolvedValueOnce(success({ token: "csrf-token" }))
      .mockResolvedValueOnce(success({ id: "account-1" }));

    await expect(
      apiRequest<{ id: string }>("/accounts", {
        body: { name: "Conta principal" },
        method: "POST",
      })
    ).resolves.toEqual({ id: "account-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/backend/auth/csrf",
      expect.objectContaining({ credentials: "include", method: "GET" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/backend/accounts",
      expect.objectContaining({ method: "POST" })
    );
    const headers = new Headers(fetchMock.mock.calls[1][1].headers);
    expect(headers.get("x-csrf-token")).toBe("csrf-token");
  });

  it("refreshes a shared session only once for concurrent 401 responses", async () => {
    document.cookie = "ft_csrf=csrf-token; path=/";
    fetchMock
      .mockResolvedValueOnce(failure("Sess?o expirada", 401))
      .mockResolvedValueOnce(failure("Sess?o expirada", 401))
      .mockResolvedValueOnce(success(undefined))
      .mockResolvedValueOnce(success({ id: "first" }))
      .mockResolvedValueOnce(success({ id: "second" }));

    await expect(
      Promise.all([
        apiRequest<{ id: string }>("/accounts/first"),
        apiRequest<{ id: string }>("/accounts/second"),
      ])
    ).resolves.toEqual([{ id: "first" }, { id: "second" }]);

    expect(
      fetchMock.mock.calls.filter(([url]) => url === "/api/backend/auth/refresh")
    ).toHaveLength(1);
  });
});
