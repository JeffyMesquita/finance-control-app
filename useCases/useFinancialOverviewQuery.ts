import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
  savings: number;
}

async function fetchMonthlyData(): Promise<MonthlyData[]> {
  const res = await fetch("/api/monthly-data");
  if (!res.ok) {
    throw new Error("Erro ao carregar dados mensais");
  }
  const result = await res.json();
  if (!result || !Array.isArray(result)) {
    throw new Error("Dados mensais inválidos");
  }
  return result;
}

export function useFinancialOverviewQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchMonthlyData, []);

  const query = useQuery<MonthlyData[], Error>({
    queryKey: ["financial-overview"],
    queryFn,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar visão geral financeira",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
