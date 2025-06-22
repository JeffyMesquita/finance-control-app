import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReferralStats } from "@/app/actions/referrals";
import { supabaseCache } from "@/lib/supabase/cache";
import { logger } from "@/lib/utils/logger";

const CACHE_KEY = "referral-stats";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function ReferralStats() {
  const [stats, setStats] = useState<{
    referralCount: number;
    badges: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStats = async () => {
    try {
      // Check cache first
      const cachedStats = supabaseCache.get<{
        referralCount: number;
        badges: any[];
      }>(CACHE_KEY);

      if (cachedStats) {
        setStats(cachedStats);
        setLoading(false);
        return;
      }

      const data = await getReferralStats();

      if (!data) {
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchStats();
          }, RETRY_DELAY);
          return;
        }
        throw new Error("Failed to fetch referral stats");
      }

      setStats(data);
      // Cache the stats
      supabaseCache.set(CACHE_KEY, data);
    } catch (error) {
      logger.error("Error fetching referral stats:", error );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Indicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.referralCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Badges Conquistados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.badges.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}

