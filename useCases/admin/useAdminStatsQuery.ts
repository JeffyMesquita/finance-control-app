import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { AdminStats } from "@/lib/types/admin";

export const adminQueryKeys = {
  all: ["admin"] as const,
  analytics: ["admin", "analytics"] as const,
  feedbacks: (filters: object) => ["admin", "feedbacks", filters] as const,
  referrals: ["admin", "referrals"] as const,
  stats: ["admin", "stats"] as const,
  users: (page: number, limit: number) => ["admin", "users", page, limit] as const,
};

async function fetchAdminStats(): Promise<AdminStats> {
  if (isNestDomainEnabled("admin")) {
    return apiRequest<AdminStats>("/admin/stats");
  }

  const { getAdminStats } = await import("@/app/actions/admin");
  const result = await getAdminStats();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch admin stats");
  }
  return result.data;
}

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: fetchAdminStats,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}
