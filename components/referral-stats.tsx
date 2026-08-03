"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReferralStatsQuery } from "@/lib/api/referrals";

export function ReferralStats() {
  const { data: stats, isPending } = useReferralStatsQuery();

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {["count", "badges"].map((key) => (
          <Card className="animate-pulse" key={key}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de indicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.referralCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Badges conquistados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.badges.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}
