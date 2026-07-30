import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import { adminQueryKeys } from "./useAdminStatsQuery";

interface AdminAnalytics {
  deprecated?: boolean;
  message?: string;
  events?: unknown[];
}

async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  if (isNestDomainEnabled("admin")) {
    return apiRequest<AdminAnalytics>("/admin/analytics");
  }

  const response = await fetch("/api/admin/analytics");
  const result = (await response.json()) as {
    success: boolean;
    data?: AdminAnalytics;
    error?: string;
  };
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch admin analytics");
  }
  return result.data;
}

export function useAdminAnalyticsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.analytics,
    queryFn: fetchAdminAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}
