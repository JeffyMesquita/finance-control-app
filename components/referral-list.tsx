import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCache } from "@/lib/supabase/cache";

const CACHE_KEY = "referral-list";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function ReferralList() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const fetchReferrals = async () => {
    try {
      // Check cache first
      const cachedReferrals = supabaseCache.get<any[]>(CACHE_KEY);
      if (cachedReferrals) {
        setReferrals(cachedReferrals);
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        if (error.status === 429 && retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchReferrals();
          }, RETRY_DELAY);
          return;
        }
        throw error;
      }

      if (user) {
        const { data, error: referralsError } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        if (referralsError) throw referralsError;

        setReferrals(data || []);
        // Cache the referrals
        supabaseCache.set(CACHE_KEY, data || []);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as indicações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Indicações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma indicação realizada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {referrals.map((referral) => (
          <div key={referral.id} className="space-y-1">
            <p className="text-sm font-medium">{referral.referred_email}</p>
            <p className="text-sm text-muted-foreground">
              Status: {referral.status}
            </p>
            <p className="text-xs text-muted-foreground">
              Indicado em {new Date(referral.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
