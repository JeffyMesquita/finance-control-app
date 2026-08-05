import { queryOptions } from "@tanstack/react-query";

import { apiPaginatedRequest, apiRequest } from "@/lib/api/client";
import type { ApiResponse, PaginatedApiResponse } from "@/lib/api/contracts";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type {
  BaseActionResult,
  DashboardData,
  ExpenseBreakdownItem,
  TransactionData,
} from "@/lib/types/actions";

export interface DashboardOverviewData {
  cards: DashboardData;
  expenseBreakdown: ExpenseBreakdownItem[];
}

export interface QueryApi {
  data<T>(path: string): Promise<T>;
  paginated<T>(path: string): Promise<Extract<PaginatedApiResponse<T>, { success: true }>>;
}

export const clientQueryApi: QueryApi = {
  data: <T>(path: string) => apiRequest<T>(path),
  paginated: <T>(path: string) => apiPaginatedRequest<T>(path),
};

export interface TransactionQueryParams {
  page?: number;
  pageSize?: number;
  month?: string;
  type?: string;
  category?: string;
  search?: string;
}

export interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

export interface GoalsStats {
  total_goals: number;
  completed_goals: number;
  overdue_goals: number;
  linked_to_savings_boxes: number;
  average_progress: number;
  total_target_amount: number;
  total_current_amount: number;
  goals_by_month: Array<{
    name: string;
    goals_created: number;
    goals_completed: number;
    target_amount: number;
  }>;
}

export interface SavingsBoxStats {
  total_boxes: number;
  total_amount: number;
  total_with_goals: number;
  total_completed_goals: number;
  average_completion: number;
}

export interface ReportsOverviewData {
  monthlyData: MonthlyData[];
  expenseData: ExpenseData[];
  goalsStats: GoalsStats | null;
  savingsBoxStats: SavingsBoxStats | null;
}

async function fetchDashboardData(api: QueryApi): Promise<DashboardData> {
  if (isNestDomainEnabled("dashboard")) {
    return api.data<DashboardData>("/dashboard/data");
  }

  const response = await fetch("/api/dashboard");
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  const result = (await response.json()) as BaseActionResult<DashboardData>;
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch dashboard data");
  }
  return result.data;
}

export function dashboardOverviewQueryOptions(api: QueryApi = clientQueryApi) {
  return queryOptions({
    queryKey: queryKeys.dashboard.overview,
    queryFn: async (): Promise<DashboardOverviewData> => {
      if (isNestDomainEnabled("dashboard")) {
        return api.data<DashboardOverviewData>("/dashboard/overview");
      }
      const [cards, expenseBreakdown] = await Promise.all([
        fetchDashboardData(api),
        fetchExpenseBreakdown("current", api),
      ]);
      return { cards, expenseBreakdown };
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function dashboardDataQueryOptions(api: QueryApi = clientQueryApi) {
  return queryOptions({
    queryKey: queryKeys.dashboard.cards,
    queryFn: () => fetchDashboardData(api),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

async function fetchExpenseBreakdown(
  month: "current" | "previous",
  api: QueryApi
): Promise<ExpenseBreakdownItem[]> {
  if (isNestDomainEnabled("dashboard")) {
    return api.data<ExpenseBreakdownItem[]>(`/dashboard/expense-breakdown?month=${month}`);
  }

  const response = await fetch(`/api/expense-breakdown?month=${month}`);
  if (!response.ok) throw new Error("Failed to fetch expense breakdown data");
  const result = (await response.json()) as BaseActionResult<ExpenseBreakdownItem[]>;
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch expense breakdown data");
  }
  return result.data;
}

export function expenseBreakdownQueryOptions(
  month: "current" | "previous" = "current",
  api: QueryApi = clientQueryApi
) {
  return queryOptions({
    queryKey: queryKeys.dashboard.expenseBreakdown(month),
    queryFn: () => fetchExpenseBreakdown(month, api),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

type LegacyGoal = {
  created_at?: string;
  updated_at?: string;
  is_completed: boolean;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
  savings_box_id?: string | null;
};

function generateGoalsByMonth(goals: LegacyGoal[]) {
  const monthLabels = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const now = new Date();
  const monthsData: Record<string, { created: number; completed: number; target: number }> = {};

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthsData[monthKey] = { created: 0, completed: 0, target: 0 };
  }

  for (const goal of goals) {
    if (goal.created_at) {
      const createdDate = new Date(goal.created_at);
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
      const month = monthsData[monthKey];
      if (month) {
        month.created += 1;
        month.target += goal.target_amount || 0;
      }
    }
    if (goal.is_completed && goal.updated_at) {
      const completedDate = new Date(goal.updated_at);
      const monthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, "0")}`;
      const month = monthsData[monthKey];
      if (month) month.completed += 1;
    }
  }

  return Object.entries(monthsData).map(([monthKey, data]) => {
    const [, month] = monthKey.split("-");
    const monthIndex = Number.parseInt(month, 10) - 1;
    return {
      name: monthLabels[monthIndex] ?? month,
      goals_created: data.created,
      goals_completed: data.completed,
      target_amount: data.target / 100,
    };
  });
}

async function fetchReportsOverview(api: QueryApi): Promise<ReportsOverviewData> {
  if (isNestDomainEnabled("reports")) {
    return api.data<ReportsOverviewData>("/reports/overview");
  }

  const useNestDashboard = isNestDomainEnabled("dashboard");
  const [monthlyRes, expenseRes, goalsRes, savingsRes] = await Promise.all([
    useNestDashboard
      ? api.data<MonthlyData[]>("/dashboard/monthly")
      : fetch("/api/monthly-data").then((response) => response.json()),
    useNestDashboard
      ? api.data<ExpenseData[]>("/dashboard/expense-breakdown")
      : fetch("/api/expense-breakdown").then((response) => response.json()),
    fetch("/api/goals/list").then((response) => response.json()),
    fetch("/api/savings-boxes/stats").then((response) => response.json()),
  ]);

  const goalsStats: GoalsStats | null =
    goalsRes.success && Array.isArray(goalsRes.data)
      ? (() => {
          const goals = goalsRes.data as LegacyGoal[];
          const now = new Date();
          const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
          const totalCurrentAmount = goals.reduce(
            (sum, goal) => sum + (Number(goal.current_amount) || 0),
            0
          );
          return {
            total_goals: goals.length,
            completed_goals: goals.filter((goal) => goal.is_completed).length,
            overdue_goals: goals.filter(
              (goal) =>
                !goal.is_completed &&
                Boolean(goal.target_date) &&
                new Date(goal.target_date as string) < now
            ).length,
            linked_to_savings_boxes: goals.filter((goal) => Boolean(goal.savings_box_id)).length,
            average_progress:
              goals.length > 0
                ? Math.round(
                    goals.reduce(
                      (sum, goal) =>
                        sum + ((Number(goal.current_amount) || 0) / goal.target_amount) * 100,
                      0
                    ) / goals.length
                  )
                : 0,
            total_target_amount: totalTargetAmount,
            total_current_amount: totalCurrentAmount,
            goals_by_month: generateGoalsByMonth(goals),
          };
        })()
      : null;

  return {
    monthlyData: Array.isArray(monthlyRes)
      ? monthlyRes
      : monthlyRes.success
        ? monthlyRes.data || []
        : [],
    expenseData: Array.isArray(expenseRes)
      ? expenseRes
      : expenseRes.success
        ? expenseRes.data || []
        : [],
    goalsStats,
    savingsBoxStats: savingsRes.success ? savingsRes.data : null,
  };
}

export function reportsOverviewQueryOptions(api: QueryApi = clientQueryApi) {
  return queryOptions({
    queryKey: queryKeys.reports.overview,
    queryFn: () => fetchReportsOverview(api),
    staleTime: 5 * 60 * 1000,
  });
}

function transactionSearchParams(params: TransactionQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
  if (params.month) searchParams.set("month", params.month);
  if (params.type) searchParams.set("type", params.type);
  if (params.category) searchParams.set("category", params.category);
  if (params.search) searchParams.set("search", params.search);
  return searchParams.toString();
}

export function transactionListQueryOptions(
  params: TransactionQueryParams,
  api: QueryApi = clientQueryApi
) {
  return queryOptions({
    queryKey: queryKeys.transactions.list(params),
    queryFn: async () => {
      const suffix = transactionSearchParams(params);
      const path = `/transactions/list${suffix ? `?${suffix}` : ""}`;
      if (isNestDomainEnabled("transactions")) {
        return api.paginated<TransactionData>(path);
      }

      const response = await fetch(`/api/transactions/list${suffix ? `?${suffix}` : ""}`);
      if (!response.ok) throw new Error("Erro ao buscar transacoes");
      const result = (await response.json()) as ApiResponse<TransactionData[]> & {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      };
      if (!result.success) throw new Error(result.error);
      return result;
    },
  });
}
