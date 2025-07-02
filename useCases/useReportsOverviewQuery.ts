import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const [monthlyRes, expenseRes, goalsRes, savingsRes] = await Promise.all([
    fetch("/api/dashboard").then((r) => r.json()),
    fetch("/api/expense-breakdown").then((r) => r.json()),
    fetch("/api/goals").then((r) => r.json()),
    fetch("/api/savings-boxes-stats").then((r) => r.json()),
  ]);
  return {
    monthlyData: monthlyRes.data || [],
    expenseData: expenseRes.data || [],
    goalsStats: goalsRes.data || null,
    savingsBoxStats: savingsRes || null,
  };
}

export function useReportsOverviewQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchReportsOverview, []);

  const query = useQuery<ReportsOverviewData, Error>({
    queryKey: ["reports-overview"],
    queryFn,
    staleTime: 1000 * 60 * 5,
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
