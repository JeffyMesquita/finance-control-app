"use client";

import { useEffect, useState } from "react";
import { ReferralProcessor } from "./referral-processor";

export function ReferralTrigger() {
  const [referralId, setReferralId] = useState<string | null>(null);
  const [shouldProcess, setShouldProcess] = useState(false);

  useEffect(() => {
    // Verifica se há referral_id no localStorage
    const storedReferralId = localStorage.getItem("referral_id");
    if (storedReferralId) {
      setReferralId(storedReferralId);

      // Aguarda 10 segundos para garantir que o usuário está autenticado
      const timer = setTimeout(() => {
        setShouldProcess(true);
        // Remove do localStorage após processar
        localStorage.removeItem("referral_id");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Só renderiza o ReferralProcessor quando deve processar
  if (!shouldProcess || !referralId) return null;

  return <ReferralProcessor referralId={referralId} />;
}
