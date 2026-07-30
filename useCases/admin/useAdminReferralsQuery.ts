import { useQuery } from "@tanstack/react-query";
import { apiPaginatedRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import { adminQueryKeys } from "./useAdminStatsQuery";

interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  created_at: string;
}

interface ReferralDashboard {
  stats: {
    totalInvites: number;
    successfulReferrals: number;
    pendingInvites: number;
    conversionRate: number;
  };
  topReferrers: Array<{ referrer_id: string; count: number; email?: string; name?: string }>;
  timeline: Array<{ date: string; invites: number; conversions: number }>;
  badges: { gold: number; silver: number; bronze: number; starter: number };
  recentInvites: ReferralRow[];
}

function formatReferralDashboard(invites: ReferralRow[]): ReferralDashboard {
  const successfulReferrals = invites.filter((invite) => Boolean(invite.referred_id)).length;
  const counts = new Map<string, number>();
  for (const invite of invites)
    counts.set(invite.referrer_id, (counts.get(invite.referrer_id) ?? 0) + 1);
  const topReferrers = [...counts.entries()]
    .map(([referrer_id, count]) => ({ referrer_id, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
  const today = new Date();
  const timeline = Array.from({ length: 7 }, (_, index) => {
    const distance = 6 - index;
    const day = new Date(today);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - distance);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const rows = invites.filter((invite) => {
      const createdAt = new Date(invite.created_at);
      return createdAt >= day && createdAt < nextDay;
    });
    return {
      date: distance === 0 ? "Hoje" : distance === 1 ? "Ontem" : `${distance} dias atrás`,
      invites: rows.length,
      conversions: rows.filter((invite) => Boolean(invite.referred_id)).length,
    };
  });

  return {
    stats: {
      totalInvites: invites.length,
      successfulReferrals,
      pendingInvites: invites.length - successfulReferrals,
      conversionRate: invites.length
        ? Number(((successfulReferrals / invites.length) * 100).toFixed(1))
        : 0,
    },
    topReferrers,
    timeline,
    badges: {
      gold: topReferrers.filter((row) => row.count >= 10).length,
      silver: topReferrers.filter((row) => row.count >= 5 && row.count < 10).length,
      bronze: topReferrers.filter((row) => row.count >= 2 && row.count < 5).length,
      starter: topReferrers.filter((row) => row.count === 1).length,
    },
    recentInvites: invites.slice(0, 10),
  };
}

async function fetchAdminReferrals(): Promise<ReferralDashboard> {
  if (isNestDomainEnabled("admin")) {
    const result = await apiPaginatedRequest<ReferralRow>("/admin/referrals?limit=100&offset=0");
    return formatReferralDashboard(result.data ?? []);
  }

  const response = await fetch("/api/admin/referrals");
  const result = (await response.json()) as {
    success: boolean;
    data?: ReferralDashboard;
    error?: string;
  };
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch admin referrals");
  }
  return result.data;
}

export function useAdminReferralsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.referrals,
    queryFn: fetchAdminReferrals,
    staleTime: 1000 * 60 * 2,
  });
}
