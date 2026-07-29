import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useToast } from "@/hooks/use-toast";
import {
  type ExpenseData,
  type GoalsStats,
  type MonthlyData,
  type ReportsOverviewData,
  reportsOverviewQueryOptions,
  type SavingsBoxStats,
} from "@/lib/api/query-options";

export type { ExpenseData, GoalsStats, MonthlyData, ReportsOverviewData, SavingsBoxStats };

export function useReportsOverviewQuery() {
  const { toast } = useToast();
  const query = useQuery(reportsOverviewQueryOptions());

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar relatorios",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
