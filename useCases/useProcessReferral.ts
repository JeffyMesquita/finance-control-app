import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/generated/schema";
import { referralQueryKeys } from "@/lib/api/referrals";
import { isNestDomainEnabled } from "@/lib/api/rollout";

type ReferralProcess = components["schemas"]["ReferralProcessDto"];

async function processReferral(referrerId: string): Promise<ReferralProcess> {
  if (isNestDomainEnabled("referrals")) {
    const result = await apiRequest<ReferralProcess>("/referrals/process", {
      method: "POST",
      body: { referrer_id: referrerId },
    });
    if (typeof window !== "undefined") window.localStorage.removeItem("referral_id");
    return result;
  }

  const response = await fetch("/api/referrals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referralId: referrerId }),
  });
  if (!response.ok) throw new Error("Erro ao processar referral");
  return (await response.json()) as ReferralProcess;
}

export function useProcessReferral() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processReferral,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: referralQueryKeys.stats });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao processar referral",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
