import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";

async function processReferral(referrerId: string) {
  if (isNestDomainEnabled("referrals")) {
    const result = await apiRequest<{ total_referrals: number; processed: boolean }>(
      "/referrals/process",
      {
        method: "POST",
        body: { referrer_id: referrerId },
      }
    );
    if (typeof window !== "undefined") window.localStorage.removeItem("referral_id");
    return { success: true, data: result };
  }
  const response = await fetch("/api/referrals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referralId: referrerId }),
  });
  if (!response.ok) throw new Error("Erro ao processar referral");
  return response.json();
}
export function useProcessReferral() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: processReferral,
    onError: (error: Error) => {
      toast({
        title: "Erro ao processar referral",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
