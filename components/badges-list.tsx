import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCache } from "@/lib/supabase/cache";

const CACHE_KEY = "badges-list";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function BadgesList() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const fetchBadges = async () => {
    try {
      // Check cache first
      const cachedBadges = supabaseCache.get<any[]>(CACHE_KEY);
      if (cachedBadges) {
        setBadges(cachedBadges);
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
            fetchBadges();
          }, RETRY_DELAY);
          return;
        }
        throw error;
      }

      if (user) {
        const { data, error: badgesError } = await supabase
          .from("badges")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (badgesError) throw badgesError;

        setBadges(data || []);
        // Cache the badges
        supabaseCache.set(CACHE_KEY, data || []);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as badges.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
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

  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma badge conquistada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {badges.map((badge) => (
          <div key={badge.id} className="space-y-1">
            <p className="text-sm font-medium">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            <p className="text-xs text-muted-foreground">
              Conquistada em {new Date(badge.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
