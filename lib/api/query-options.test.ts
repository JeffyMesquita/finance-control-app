const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: cookiesMock }));

import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QueryApi } from "./query-options";

describe("server-compatible query options", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_NEST_DOMAINS", "dashboard,reports,transactions");
  });

  it("uses identical keys and injectable fetchers for dashboard, reports and transactions", async () => {
    const {
      dashboardDataQueryOptions,
      expenseBreakdownQueryOptions,
      reportsOverviewQueryOptions,
      transactionListQueryOptions,
    } = await import("./query-options");
    const data = vi.fn(<T>(path: string) => {
      const values: Record<string, unknown> = {
        "/dashboard/data": { totalBalance: 100 },
        "/dashboard/expense-breakdown?month=current": [{ name: "Food", color: "#fff", value: 10 }],
        "/reports/overview": {
          monthlyData: [],
          expenseData: [],
          goalsStats: null,
          savingsBoxStats: null,
        },
      };
      return Promise.resolve(values[path] as T);
    });
    const paginated = vi.fn(<T>(_path: string) =>
      Promise.resolve({
        success: true as const,
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        hasMore: false,
      } as T)
    );
    const api = { data, paginated } as unknown as QueryApi;
    const queryClient = new QueryClient();

    await queryClient.fetchQuery(dashboardDataQueryOptions(api));
    await queryClient.fetchQuery(expenseBreakdownQueryOptions("current", api));
    await queryClient.fetchQuery(reportsOverviewQueryOptions(api));
    await queryClient.fetchQuery(transactionListQueryOptions({ page: 1, pageSize: 10 }, api));

    expect(data).toHaveBeenCalledWith("/dashboard/data");
    expect(data).toHaveBeenCalledWith("/dashboard/expense-breakdown?month=current");
    expect(data).toHaveBeenCalledWith("/reports/overview");
    expect(paginated).toHaveBeenCalledWith("/transactions/list?page=1&pageSize=10");
    expect(queryClient.getQueryCache().find({ queryKey: ["dashboard", "cards"] })).toBeDefined();
    expect(queryClient.getQueryCache().find({ queryKey: ["reports", "overview"] })).toBeDefined();
  });
});

describe("server backend fetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    cookiesMock.mockReset();
  });

  it("forwards request cookies and leaves 401 recovery to the browser client", async () => {
    vi.resetModules();
    vi.stubEnv("BACKEND_API_ORIGIN", "http://127.0.0.1:3001");
    cookiesMock.mockResolvedValue({ toString: () => "ft_access=token" });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const { serverBackendRequest } = await import("./server");
    await expect(serverBackendRequest("/dashboard/data")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3001/api/v1/dashboard/data",
      expect.objectContaining({
        cache: "no-store",
        headers: { cookie: "ft_access=token" },
      })
    );
  });
});
