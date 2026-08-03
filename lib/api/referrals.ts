import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/generated/schema";
import { isNestDomainEnabled } from "@/lib/api/rollout";

type ReferralStatsDto = components["schemas"]["ReferralStatsDto"];
type LegacyReferralStats = {
  referralCount?: number;
  badges?: Array<{ badge_type?: string; earned_at?: string }>;
  referrer?: { id: string; email?: string } | null;
};

export type ReferralStats = {
  referralCount: number;
  badges: Array<{ badge_type: string; earned_at: string }>;
  referrer: { id: string; email?: string } | null;
  referrals: ReferralStatsDto["referrals"];
};

export const referralQueryKeys = {
  all: ["referrals"] as const,
  stats: ["referrals", "stats"] as const,
};

function normalizeLegacyStats(value: LegacyReferralStats): ReferralStats {
  return {
    referralCount: value.referralCount ?? 0,
    badges: (value.badges ?? []).map((badge) => ({
      badge_type: badge.badge_type ?? "",
      earned_at: badge.earned_at ?? "",
    })),
    referrer: value.referrer ?? null,
    referrals: [],
  };
}

async function fetchReferralStats(): Promise<ReferralStats> {
  if (isNestDomainEnabled("referrals")) {
    const data = await apiRequest<ReferralStatsDto>("/referrals/stats");
    return {
      referralCount: data.total_referrals,
      badges: data.badges,
      referrer: null,
      referrals: data.referrals,
    };
  }

  const { getReferralStats } = await import("@/app/actions/referrals");
  const result = await getReferralStats();
  if (!result.success || !result.data)
    throw new Error(result.error ?? "Falha ao carregar indicações");
  return normalizeLegacyStats(result.data as LegacyReferralStats);
}

export const referralStatsQueryOptions = () =>
  queryOptions({
    queryKey: referralQueryKeys.stats,
    queryFn: fetchReferralStats,
    staleTime: 60_000,
  });

export function useReferralStatsQuery() {
  return useQuery(referralStatsQueryOptions());
}
