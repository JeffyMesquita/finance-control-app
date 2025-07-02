import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface SavingsBoxSummaryItem {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number | null;
  color: string;
  icon: string;
  progress_percentage: number;
  is_goal_linked: boolean;
  linked_goal: any;
}

export interface SavingsStats {
  total_boxes: number;
  total_amount: number;
  total_with_goals: number;
  total_completed_goals: number;
  average_completion: number;
}

export interface SavingsSummaryData {
  summary: SavingsBoxSummaryItem[];
  stats: SavingsStats | null;
  totalAmount: number;
}

async function fetchSavingsSummary(): Promise<SavingsSummaryData> {
  const [summaryRes, statsRes, totalRes] = await Promise.all([
    fetch("/api/savings-boxes-summary").then((r) => r.json()),
    fetch("/api/savings-boxes-stats").then((r) => r.json()),
    fetch("/api/savings-boxes-total").then((r) => r.json()),
  ]);
  return {
    summary: summaryRes || [],
    stats: statsRes || null,
    totalAmount: totalRes || 0,
  };
}

export function useSavingsSummaryQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchSavingsSummary, []);

  const query = useQuery<SavingsSummaryData, Error>({
    queryKey: ["savings-summary"],
    queryFn,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar dados dos cofrinhos",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
