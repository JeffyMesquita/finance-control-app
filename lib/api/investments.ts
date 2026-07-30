import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPaginatedRequest, apiRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type {
  CreateInvestmentData,
  CreateInvestmentTransactionData,
  Investment,
  InvestmentCategoryStats,
  InvestmentSummary,
  InvestmentTransaction,
  UpdateInvestmentData,
} from "@/lib/types/investments";

export const investmentQueryKeys = {
  all: ["investments"] as const,
  list: (params: { search?: string; category?: string; limit?: number; offset?: number } = {}) =>
    ["investments", "list", params] as const,
  detail: (id: string) => ["investments", "detail", id] as const,
  summary: ["investments", "summary"] as const,
  categoryStats: ["investments", "category-stats"] as const,
  transactions: (params: { investment_id?: string; limit?: number; offset?: number } = {}) =>
    ["investments", "transactions", params] as const,
};

type InvestmentListParams = Parameters<typeof investmentQueryKeys.list>[0];

async function legacyRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers ?? {}) },
  });
  const payload = (await response.json()) as { success: boolean; data?: T; error?: string };
  if (!response.ok || !payload.success)
    throw new Error(payload.error ?? "Não foi possível concluir a requisição");
  return payload.data as T;
}

export async function fetchInvestments(params: InvestmentListParams = {}): Promise<Investment[]> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== "") query.set(key, String(value));
  if (isNestDomainEnabled("investments")) {
    const result = await apiPaginatedRequest<Investment>(
      `/investments/list${query.size ? `?${query}` : ""}`
    );
    return result.data ?? [];
  }
  return legacyRequest<Investment[]>(`/investments/list${query.size ? `?${query}` : ""}`);
}

export function useInvestmentsQuery(params: InvestmentListParams = {}) {
  return useQuery({
    queryKey: investmentQueryKeys.list(params),
    queryFn: () => fetchInvestments(params),
    staleTime: 300_000,
  });
}

export function useInvestmentSummaryQuery() {
  return useQuery({
    queryKey: investmentQueryKeys.summary,
    queryFn: () =>
      isNestDomainEnabled("investments")
        ? apiRequest<InvestmentSummary>("/investments/summary")
        : legacyRequest<InvestmentSummary>("/investments/summary"),
    staleTime: 300_000,
  });
}

export function useInvestmentCategoryStatsQuery() {
  return useQuery({
    queryKey: investmentQueryKeys.categoryStats,
    queryFn: () =>
      isNestDomainEnabled("investments")
        ? apiRequest<InvestmentCategoryStats[]>("/investments/category-stats")
        : legacyRequest<InvestmentCategoryStats[]>("/investments/category-stats"),
    staleTime: 300_000,
  });
}

async function mutateInvestment<T>(path: string, method: string, body: unknown): Promise<T> {
  return isNestDomainEnabled("investments")
    ? apiRequest<T>(path, { method: method as "POST" | "PUT" | "DELETE", body })
    : legacyRequest<T>(path, { method, body: JSON.stringify(body) });
}

function invalidateInvestmentQueries(client: ReturnType<typeof useQueryClient>) {
  void client.invalidateQueries({ queryKey: investmentQueryKeys.all });
  void client.invalidateQueries({ queryKey: ["dashboard"] });
  void client.invalidateQueries({ queryKey: ["reports"] });
}

export function useCreateInvestmentMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvestmentData) =>
      mutateInvestment<Investment>("/investments/create", "POST", data),
    onSuccess: () => invalidateInvestmentQueries(client),
  });
}

export function useUpdateInvestmentMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateInvestmentData & { id: string }) =>
      mutateInvestment<Investment>("/investments/update", "PUT", data),
    onSuccess: (_data, variables) => {
      invalidateInvestmentQueries(client);
      void client.invalidateQueries({ queryKey: investmentQueryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteInvestmentMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateInvestment<void>("/investments/delete", "DELETE", { id }),
    onSuccess: () => invalidateInvestmentQueries(client),
  });
}

export function useCreateInvestmentTransactionMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvestmentTransactionData) =>
      mutateInvestment<InvestmentTransaction>("/investment-transactions", "POST", data),
    onSuccess: (_data, variables) => {
      invalidateInvestmentQueries(client);
      void client.invalidateQueries({
        queryKey: investmentQueryKeys.transactions({ investment_id: variables.investment_id }),
      });
    },
  });
}

export function useInvestmentTransactionsQuery(
  params: { investment_id?: string; limit?: number; offset?: number } = {}
) {
  return useQuery({
    queryKey: investmentQueryKeys.transactions(params),
    queryFn: async () => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params))
        if (value !== undefined) query.set(key, String(value));
      if (isNestDomainEnabled("investments"))
        return (
          await apiPaginatedRequest<InvestmentTransaction>(
            `/investment-transactions${query.size ? `?${query}` : ""}`
          )
        ).data;
      return legacyRequest<InvestmentTransaction[]>(
        `/investment-transactions${query.size ? `?${query}` : ""}`
      );
    },
    staleTime: 60_000,
  });
}
