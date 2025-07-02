import { useQuery } from "@tanstack/react-query";

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
    queryKey: ["savings-boxes-stats"],
    queryFn: fetchSavingsBoxesStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
