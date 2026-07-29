import { useQuery } from "@tanstack/react-query";
import { apiPaginatedRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { GoalData } from "@/lib/types/actions";

async function fetchGoals(): Promise<GoalData[]> {
  if (isNestDomainEnabled("goals")) {
    const result = await apiPaginatedRequest<GoalData>("/goals/list?limit=100");
    return result.data ?? [];
  }
  const response = await fetch("/api/goals/list");
  const result = (await response.json()) as { success: boolean; data?: GoalData[]; error?: string };
  if (!result.success) throw new Error(result.error || "Falha ao buscar metas");
  return result.data || [];
}

export function useGoalsQuery() {
  return useQuery({ queryKey: queryKeys.goals.all, queryFn: fetchGoals, staleTime: 5 * 60 * 1000 });
}
