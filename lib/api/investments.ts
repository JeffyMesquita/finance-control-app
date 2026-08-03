import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvestmentTransactions } from "@/app/actions/investments";
import { apiPaginatedRequest, apiRequest } from "@/lib/api/client";
import type { components, paths } from "@/lib/api/generated/schema";
import { isNestDomainEnabled } from "@/lib/api/rollout";

type ApiInvestment = components["schemas"]["InvestmentResponseDto"];
type Investment = Omit<ApiInvestment, "description" | "target_amount" | "color"> & {
  description?: string;
  target_amount?: number;
  color: string;
};
type ApiInvestmentTransaction = components["schemas"]["InvestmentTransactionResponseDto"];
type InvestmentTransaction = Omit<ApiInvestmentTransaction, "description"> & {
  description?: string;
};
type InvestmentSummary = components["schemas"]["InvestmentSummaryResponseDto"];
type InvestmentCategoryStats = components["schemas"]["InvestmentCategoryStatsResponseDto"];
type CreateInvestmentData = components["schemas"]["CreateInvestmentDto"];
type UpdateInvestmentData = components["schemas"]["UpdateInvestmentDto"];
type CreateInvestmentTransactionData = components["schemas"]["CreateInvestmentTransactionDto"];
type InvestmentListParams = NonNullable<paths["/investments/list"]["get"]["parameters"]["query"]>;
function normalizeInvestment(value: ApiInvestment): Investment {
  return {
    ...value,
    description: value.description ?? undefined,
    target_amount: value.target_amount ?? undefined,
    color: value.color ?? "#6366F1",
  };
}

function normalizeInvestmentTransaction(value: ApiInvestmentTransaction): InvestmentTransaction {
  return { ...value, description: value.description ?? undefined };
}
type InvestmentTransactionParams = NonNullable<
  paths["/investment-transactions"]["get"]["parameters"]["query"]
>;

export const investmentQueryKeys = {
  all: ["investments"] as const,
  list: (params: InvestmentListParams = {}) => ["investments", "list", params] as const,
  detail: (id: string) => ["investments", "detail", id] as const,
  summary: ["investments", "summary"] as const,
  categoryStats: ["investments", "category-stats"] as const,
  transactions: (params: InvestmentTransactionParams = {}) =>
    ["investments", "transactions", params] as const,
};

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

function toQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.toString();
}

export async function fetchInvestments(params: InvestmentListParams = {}): Promise<Investment[]> {
  const query = toQuery(params);
  if (isNestDomainEnabled("investments")) {
    const result = await apiPaginatedRequest<ApiInvestment>(
      `/investments/list${query ? `?${query}` : ""}`
    );
    return (result.data ?? []).map(normalizeInvestment);
  }
  return legacyRequest<Investment[]>(`/investments/list${query ? `?${query}` : ""}`);
}

export const investmentsQueryOptions = (params: InvestmentListParams = {}) =>
  queryOptions({
    queryKey: investmentQueryKeys.list(params),
    queryFn: () => fetchInvestments(params),
    staleTime: 300_000,
  });

export function useInvestmentsQuery(params: InvestmentListParams = {}) {
  return useQuery(investmentsQueryOptions(params));
}

async function fetchInvestmentSummary(): Promise<InvestmentSummary> {
  return isNestDomainEnabled("investments")
    ? apiRequest<InvestmentSummary>("/investments/summary")
    : legacyRequest<InvestmentSummary>("/investments/summary");
}

export const investmentSummaryQueryOptions = () =>
  queryOptions({
    queryKey: investmentQueryKeys.summary,
    queryFn: fetchInvestmentSummary,
    staleTime: 300_000,
  });

export function useInvestmentSummaryQuery() {
  return useQuery(investmentSummaryQueryOptions());
}

async function fetchInvestmentCategoryStats(): Promise<InvestmentCategoryStats[]> {
  return isNestDomainEnabled("investments")
    ? apiRequest<InvestmentCategoryStats[]>("/investments/category-stats")
    : legacyRequest<InvestmentCategoryStats[]>("/investments/category-stats");
}

export const investmentCategoryStatsQueryOptions = () =>
  queryOptions({
    queryKey: investmentQueryKeys.categoryStats,
    queryFn: fetchInvestmentCategoryStats,
    staleTime: 300_000,
  });

export function useInvestmentCategoryStatsQuery() {
  return useQuery(investmentCategoryStatsQueryOptions());
}

async function mutateInvestment<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body: unknown
): Promise<T> {
  return isNestDomainEnabled("investments")
    ? apiRequest<T>(path, { method, body })
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
    mutationFn: (data: UpdateInvestmentData) =>
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

export async function fetchInvestmentTransactions(
  params: InvestmentTransactionParams = {}
): Promise<InvestmentTransaction[]> {
  const query = toQuery(params);
  if (isNestDomainEnabled("investments")) {
    const result = await apiPaginatedRequest<ApiInvestmentTransaction>(
      `/investment-transactions${query ? `?${query}` : ""}`
    );
    return (result.data ?? []).map(normalizeInvestmentTransaction);
  }
  const result = await getInvestmentTransactions(params.investment_id);
  if (!result.success) {
    throw new Error(result.error ?? "Não foi possível carregar as movimentações");
  }
  return (result.data ?? []).map((value) => ({
    ...value,
    description: value.description ?? undefined,
  }));
}
export const investmentTransactionsQueryOptions = (params: InvestmentTransactionParams = {}) =>
  queryOptions({
    queryKey: investmentQueryKeys.transactions(params),
    queryFn: () => fetchInvestmentTransactions(params),
    staleTime: 60_000,
  });

export function useInvestmentTransactionsQuery(params: InvestmentTransactionParams = {}) {
  return useQuery(investmentTransactionsQueryOptions(params));
}
