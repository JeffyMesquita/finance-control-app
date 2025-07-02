import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

async function processReferral(referralId: string) {
  const response = await fetch("/api/referrals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referralId }),
  });
  if (!response.ok) {
    throw new Error("Erro ao processar referral");
  }
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
