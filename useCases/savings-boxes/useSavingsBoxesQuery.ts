import { useQuery } from "@tanstack/react-query";
import { apiPaginatedRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { SavingsBoxData } from "@/lib/types/actions";

async function fetchSavingsBoxes(): Promise<SavingsBoxData[]> {
  if (isNestDomainEnabled("savings-boxes")) {
    const result = await apiPaginatedRequest<SavingsBoxData>("/savings-boxes/list?limit=100");
    return result.data ?? [];
  }
  const response = await fetch("/api/savings-boxes/list");
  const result = (await response.json()) as {
    success: boolean;
    data?: SavingsBoxData[];
    error?: string;
  };
  if (!result.success) throw new Error(result.error || "Falha ao buscar cofrinhos");
  return result.data || [];
}

export function useSavingsBoxesQuery() {
  return useQuery({
    queryKey: queryKeys.savingsBoxes.all,
    queryFn: fetchSavingsBoxes,
    staleTime: 5 * 60 * 1000,
  });
}
