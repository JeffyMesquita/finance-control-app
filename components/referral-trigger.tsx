"use client";

import { useProcessReferral } from "@/useCases/useProcessReferral";
import { useEffect } from "react";

export function ReferralTrigger() {
  const { mutate } = useProcessReferral();

  useEffect(() => {
    const referralId = localStorage.getItem("referral_id");
    if (!referralId) return;

    // Aguarda 2 segundos para garantir que o usuário está autenticado
    const timer = setTimeout(() => {
      mutate(referralId, {
        onSuccess: () => {
          localStorage.removeItem("referral_id");
        },
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [mutate]);

  return null; // Componente invisível
}
