import { useQuery } from "@tanstack/react-query";
import { GoalData } from "@/lib/types/actions";

interface GoalsResponse {
  success: boolean;
  data?: GoalData[];
  error?: string;
}

async function fetchGoals(): Promise<GoalData[]> {
  const response = await fetch("/api/goals/list");
  const result: GoalsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch goals");
  }

  return result.data || [];
}

export function useGoalsQuery() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
