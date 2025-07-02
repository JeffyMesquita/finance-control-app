import { useQuery } from "@tanstack/react-query";
import { SavingsBoxData } from "@/lib/types/actions";

interface SavingsBoxesResponse {
  success: boolean;
  data?: SavingsBoxData[];
  error?: string;
}

async function fetchSavingsBoxes(): Promise<SavingsBoxData[]> {
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
