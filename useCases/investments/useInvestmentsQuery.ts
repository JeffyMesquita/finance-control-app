import { useQuery } from "@tanstack/react-query";
import { Investment } from "@/lib/types/investments";

interface InvestmentsResponse {
  success: boolean;
  data?: Investment[];
  error?: string;
}

async function fetchInvestments(): Promise<Investment[]> {
  const response = await fetch("/api/investments/list");
  const result: InvestmentsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch investments");
  }

  return result.data || [];
}

export function useInvestmentsQuery() {
  return useQuery({
    queryKey: ["investments"],
    queryFn: fetchInvestments,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
