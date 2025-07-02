import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Função para gerar dados de metas por mês
function generateGoalsByMonth(goals: any[]) {
  if (!goals || goals.length === 0) return [];

  const monthNames = [
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
  const monthsData: {
    [key: string]: { created: number; completed: number; target: number };
  } = {};

  // Inicializar últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthName = monthNames[date.getMonth()];

    monthsData[monthKey] = {
      created: 0,
      completed: 0,
      target: 0,
    };
  }

  // Processar metas
  goals.forEach((goal: any) => {
    // Contar metas criadas por mês
    if (goal.created_at) {
      const createdDate = new Date(goal.created_at);
      const monthKey = `${createdDate.getFullYear()}-${String(
        createdDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthsData[monthKey]) {
        monthsData[monthKey].created++;
        monthsData[monthKey].target += goal.target_amount || 0;
      }
    }

    // Contar metas completadas por mês (se tiver data de conclusão)
    if (goal.is_completed && goal.updated_at) {
      const completedDate = new Date(goal.updated_at);
      const monthKey = `${completedDate.getFullYear()}-${String(
        completedDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthsData[monthKey]) {
        monthsData[monthKey].completed++;
      }
    }
  });

  // Converter para formato do gráfico
  return Object.entries(monthsData).map(([monthKey, data]) => {
    const [year, month] = monthKey.split("-");
    const monthIndex = parseInt(month) - 1;

    return {
      name: monthNames[monthIndex],
      goals_created: data.created,
      goals_completed: data.completed,
      target_amount: data.target / 100, // Converter de centavos
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
  try {
    const [monthlyRes, expenseRes, goalsRes, savingsRes] = await Promise.all([
      fetch("/api/monthly-data").then((r) => r.json()),
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
        goals_by_month: generateGoalsByMonth(goals),
      };
    }

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
