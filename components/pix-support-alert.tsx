"use client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCache } from "@/lib/supabase/cache";
import { useCurrentUser } from "@/hooks/use-current-user";

const CACHE_KEY = "pix-support-alert-user";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function PixSupportAlert() {
  const [isVisible, setIsVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const { user, loading: userLoading } = useCurrentUser();

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("pixSupportAlertDismissed", "true");
  };

  const fetchUser = async () => {
    try {
      // Check cache first
      const cachedUser = supabaseCache.get<{ id: string }>(CACHE_KEY);
      if (cachedUser) {
        setUserId(cachedUser.id);
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
            fetchUser();
          }, RETRY_DELAY);
          return;
        }
        throw error;
      }

      if (user) {
        setUserId(user.id);
        // Cache the user data
        supabaseCache.set(CACHE_KEY, { id: user.id });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const sessionKey = localStorage.getItem("supabase.auth.token");
    const isDismissed =
      localStorage.getItem("pixSupportAlertDismissed") === "true";
    setIsVisible(!!sessionKey && !isDismissed);
  }, []);

  useEffect(() => {
    if (isVisible && user && !userLoading) {
      setUserId(user.id);
    }
  }, [isVisible, user, userLoading]);

  if (!isVisible) return null;

  return (
    <Alert className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <AlertTitle className="text-green-900">
            Suporte ao PIX Agora Disponível!
          </AlertTitle>
          <AlertDescription className="text-green-700 mt-2">
            <p>
              Agora você pode gerenciar suas transações PIX diretamente no app.
              Experimente esta nova funcionalidade e simplifique seus
              pagamentos!
            </p>
          </AlertDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-green-700 border-green-200 hover:bg-green-100"
              onClick={() => {
                window.location.href = "/pix";
              }}
            >
              Experimentar PIX
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-green-700 hover:bg-green-100"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
