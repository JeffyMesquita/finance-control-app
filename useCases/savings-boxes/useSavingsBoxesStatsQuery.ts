import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";

interface SavingsBoxesStatsResponse {
  success: boolean;
  data?: {
    total_boxes: number;
    total_amount: number;
    total_with_goals: number;
    completed_goals: number;
    average_completion: number;
  };
  error?: string;
}

async function fetchSavingsBoxesStats() {
  if (isNestDomainEnabled("savings-boxes"))
    return apiRequest<NonNullable<SavingsBoxesStatsResponse["data"]>>("/savings-boxes/stats");
  const response = await fetch("/api/savings-boxes/stats");
  const result: SavingsBoxesStatsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch savings boxes stats");
  }

  return (
    result.data || {
      total_boxes: 0,
      total_amount: 0,
      total_with_goals: 0,
      completed_goals: 0,
      average_completion: 0,
    }
  );
}

export function useSavingsBoxesStatsQuery() {
  return useQuery({
    queryKey: queryKeys.savingsBoxes.stats,
    queryFn: fetchSavingsBoxesStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
