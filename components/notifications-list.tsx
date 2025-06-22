import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCache } from "@/lib/supabase/cache";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logger } from "@/lib/utils/logger";

const CACHE_KEY = "notifications-list";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function NotificationsList() {
  const { user, loading: userLoading } = useCurrentUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const cachedNotifications = supabaseCache.get<any[]>(CACHE_KEY);
      if (cachedNotifications) {
        setNotifications(cachedNotifications);
        setLoading(false);
        return;
      }
      const { data, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (notificationsError) throw notificationsError;
      setNotifications(data || []);
      supabaseCache.set(CACHE_KEY, data || []);
    } catch (error) {
      logger.error("Error fetching notifications:", error );
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !userLoading) {
      fetchNotifications();
    }
  }, [user, userLoading]);

  if (loading || userLoading) {
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

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma notificação no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="space-y-1">
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

