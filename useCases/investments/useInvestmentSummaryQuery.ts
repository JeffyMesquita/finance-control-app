import { useQuery } from "@tanstack/react-query";
import { InvestmentSummary } from "@/lib/types/investments";

interface InvestmentSummaryResponse {
  success: boolean;
  data?: InvestmentSummary;
  error?: string;
}

async function fetchInvestmentSummary(): Promise<InvestmentSummary> {
  const response = await fetch("/api/investments/summary");
  const result: InvestmentSummaryResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch investment summary");
  }

  return (
    result.data || {
      total_invested: 0,
      current_value: 0,
      total_return: 0,
      return_percentage: 0,
      monthly_contributions: 0,
      active_investments: 0,
    }
  );
}

export function useInvestmentSummaryQuery() {
  return useQuery({
    queryKey: ["investment-summary"],
    queryFn: fetchInvestmentSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
