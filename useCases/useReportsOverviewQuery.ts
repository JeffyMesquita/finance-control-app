import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";

type LegacyGoal = {
  created_at?: string;
  updated_at?: string;
  is_completed: boolean;
  target_amount: number;
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

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
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
    const monthIndex = parseInt(month, 10) - 1;
    return {
      name: monthLabels[monthIndex] ?? month,
      goals_created: data.created,
      goals_completed: data.completed,
      target_amount: data.target / 100,
    };
  });
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

async function fetchReportsOverview(): Promise<ReportsOverviewData> {
  if (isNestDomainEnabled("reports")) {
    return apiRequest<ReportsOverviewData>("/reports/overview");
  }

  const useNestDashboard = isNestDomainEnabled("dashboard");
  const [monthlyRes, expenseRes, goalsRes, savingsRes] = await Promise.all([
    useNestDashboard
      ? apiRequest<MonthlyData[]>("/dashboard/monthly")
      : fetch("/api/monthly-data").then((response) => response.json()),
    useNestDashboard
      ? apiRequest<ExpenseData[]>("/dashboard/expense-breakdown")
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
            (sum, goal) =>
              sum +
              (Number((goal as LegacyGoal & { current_amount?: number }).current_amount) || 0),
            0
          );
          return {
            total_goals: goals.length,
            completed_goals: goals.filter((goal) => goal.is_completed).length,
            overdue_goals: goals.filter(
              (goal) =>
                !goal.is_completed &&
                Boolean((goal as LegacyGoal & { target_date?: string }).target_date) &&
                new Date((goal as LegacyGoal & { target_date: string }).target_date) < now
            ).length,
            linked_to_savings_boxes: goals.filter((goal) =>
              Boolean((goal as LegacyGoal & { savings_box_id?: string | null }).savings_box_id)
            ).length,
            average_progress:
              goals.length > 0
                ? Math.round(
                    goals.reduce((sum, goal) => {
                      const current =
                        Number((goal as LegacyGoal & { current_amount?: number }).current_amount) ||
                        0;
                      return sum + (current / goal.target_amount) * 100;
                    }, 0) / goals.length
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
export function useReportsOverviewQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchReportsOverview, []);

  const query = useQuery<ReportsOverviewData, Error>({
    queryKey: queryKeys.reports.overview,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar relatórios",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
