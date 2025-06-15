"use client";

import { useEffect, useState } from "react";

export function ReferralTrigger() {
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // Evita processamento múltiplo
    if (processed) return;

    const processReferral = async () => {
      const referralId = localStorage.getItem("referral_id");
      if (!referralId) return;

      try {
        const response = await fetch("/api/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralId }),
        });

        const result = await response.json();

        // Remove do localStorage após processar
        localStorage.removeItem("referral_id");
        setProcessed(true);
      } catch (error) {
        console.error("Erro ao processar referral:", error);
      }
    };

    // Aguarda 2 segundos para garantir que o usuário está autenticado
    const timer = setTimeout(processReferral, 2000);
    return () => clearTimeout(timer);
  }, [processed]);

  return null; // Componente invisível
}
