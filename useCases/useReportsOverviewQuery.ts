import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
  try {
    const [monthlyRes, expenseRes, goalsRes, savingsRes] = await Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/expense-breakdown").then((r) => r.json()),
      fetch("/api/goals/list").then((r) => r.json()),
      fetch("/api/savings-boxes/stats").then((r) => r.json()),
    ]);

    // Processar dados das metas para estatísticas
    let goalsStats: GoalsStats | null = null;
    if (goalsRes.success && goalsRes.data) {
      const goals = goalsRes.data;
      const now = new Date();

      goalsStats = {
        total_goals: goals.length,
        completed_goals: goals.filter((g: any) => g.is_completed).length,
        overdue_goals: goals.filter(
          (g: any) => !g.is_completed && new Date(g.target_date) < now
        ).length,
        linked_to_savings_boxes: goals.filter((g: any) => g.savings_box_id)
          .length,
        average_progress:
          goals.length > 0
            ? Math.round(
                goals.reduce(
                  (sum: number, g: any) =>
                    sum + (g.current_amount / g.target_amount) * 100,
                  0
                ) / goals.length
              )
            : 0,
        total_target_amount: goals.reduce(
          (sum: number, g: any) => sum + g.target_amount,
          0
        ),
        total_current_amount: goals.reduce(
          (sum: number, g: any) => sum + g.current_amount,
          0
        ),
        goals_by_month: [], // Pode ser implementado futuramente se necessário
      };
    }

    return {
      monthlyData: monthlyRes.success ? monthlyRes.data || [] : [],
      expenseData: expenseRes.success ? expenseRes.data || [] : [],
      goalsStats,
      savingsBoxStats: savingsRes.success ? savingsRes.data : null,
    };
  } catch (error) {
    throw new Error("Failed to fetch reports overview data");
  }
}

export function useReportsOverviewQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchReportsOverview, []);

  const query = useQuery<ReportsOverviewData, Error>({
    queryKey: ["reports-overview"],
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
