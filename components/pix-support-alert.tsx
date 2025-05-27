"use client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";

export function PixSupportAlert() {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const { user, loading: userLoading } = useCurrentUser();

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("pixSupportAlertDismissed", "true");
  };

  useEffect(() => {
    const sessionKey = localStorage.getItem("supabase.auth.token");
    const isDismissed =
      localStorage.getItem("pixSupportAlertDismissed") === "true";
    setIsVisible(!!sessionKey && !isDismissed);
  }, []);

  if (!isVisible || userLoading) return null;

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
