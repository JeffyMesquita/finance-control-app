import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { SavingsBoxData } from "@/lib/types/actions";

interface SavingsBoxesResponse {
  success: boolean;
  data?: SavingsBoxData[];
  error?: string;
}

async function fetchSavingsBoxes(): Promise<SavingsBoxData[]> {
  if (isNestDomainEnabled("savings-boxes")) {
    return apiRequest<SavingsBoxData[]>("/savings-boxes/list?limit=100");
  }

  const response = await fetch("/api/savings-boxes/list");
  const result: SavingsBoxesResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch savings boxes");
  }

  return result.data || [];
}

export function useSavingsBoxesQuery() {
  return useQuery({
    queryKey: ["savings-boxes"],
    queryFn: fetchSavingsBoxes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
