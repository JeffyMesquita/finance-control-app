import { handleReferral } from "@/app/actions/referrals";

interface ReferralProcessorProps {
  referralId: string;
}

export async function ReferralProcessor({
  referralId,
}: ReferralProcessorProps) {
  if (!referralId) return null;

  // Processa o referral no servidor
  const result = await handleReferral(referralId);
  console.log("[ReferralProcessor] Resultado:", result);

  // Componente invisível - não renderiza nada
  return null;
}
