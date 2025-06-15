"use server";

import { createActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ReferralResult = {
  success: boolean;
  message: string;
};

export async function handleReferral(
  referralId: string
): Promise<ReferralResult> {
  console.log("[Referral] handleReferral chamada", { referralId });
  if (!referralId) {
    console.log("[Referral] ID de referência não encontrado");
    return {
      success: false,
      message: "ID de referência não encontrado",
    };
  }

  const supabase = createActionClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("[Referral] Usuário autenticado:", user);
  if (!user) {
    console.log("[Referral] Usuário não autenticado");
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  // Prevenir auto-referência
  if (user.id === referralId) {
    console.log("[Referral] Tentativa de auto-referência");
    return {
      success: false,
      message: "Você não pode se auto-referenciar",
    };
  }

  try {
    // Verificar se o usuário que está referenciando existe e está ativo
    const { data: referrer, error: referrerError } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", referralId)
      .single();
    console.log("[Referral] Referrer encontrado:", referrer, referrerError);

    if (referrerError || !referrer) {
      console.log("[Referral] Usuário que está referenciando não encontrado");
      return {
        success: false,
        message: "Usuário que está referenciando não encontrado",
      };
    }

    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from("user_invites")
      .select("id")
      .eq("referred_id", user.id)
      .single();
    console.log("[Referral] existingReferral:", existingReferral);

    if (existingReferral) {
      console.log("[Referral] Usuário já foi referenciado anteriormente");
      return {
        success: false,
        message: "Você já foi referenciado anteriormente",
      };
    }

    // Create referral
    console.log("[Referral] Inserindo referral na tabela user_invites...");
    const { error: referralError }: { error: unknown } = await supabase
      .from("user_invites")
      .insert({
        referrer_id: referralId,
        referred_id: user.id,
      });
    console.log("[Referral] Resultado insert:", referralError);

    if (referralError) {
      console.error("[Referral] Failed to create referral:", referralError);
      return {
        success: false,
        message: "Erro ao processar referência",
      };
    }

    // Get total referrals for the referrer
    const { count: totalReferrals } = await supabase
      .from("user_invites")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", referralId);
    console.log("[Referral] totalReferrals:", totalReferrals);

    // Award badges based on referral count
    const badgeThresholds = [5, 10, 25, 50, 100];
    let newBadges = 0;

    for (const threshold of badgeThresholds) {
      if (totalReferrals && totalReferrals >= threshold) {
        const { error: badgeError } = await supabase
          .from("user_badges")
          .insert({
            user_id: referralId,
            badge_type: `REFERRAL_${threshold}`,
          });
        console.log(
          `[Referral] Badge para threshold ${threshold}:`,
          badgeError
        );
        if (!badgeError) {
          newBadges++;
        }
      }
    }

    revalidatePath("/");
    console.log("[Referral] Referral processado com sucesso!", { newBadges });

    return {
      success: true,
      message: `Referência processada com sucesso! ${
        newBadges > 0 ? `Novas badges conquistadas: ${newBadges}` : ""
      }`,
    };
  } catch (error) {
    console.error("[Referral] Error handling referral:", error);
    return {
      success: false,
      message: "Erro ao processar referência",
    };
  }
}

export async function getReferralStats() {
  const supabase = createActionClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { referralCount: 0, badges: [], referrer: null };

  try {
    // Get referral count
    const { count: referralCount } = await supabase
      .from("user_invites")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id);

    // Get badges
    const { data: badges } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", user.id);

    // Buscar quem foi o referrer deste usuário (se houver)
    const { data: referralRecord } = await supabase
      .from("user_invites")
      .select("referrer_id")
      .eq("referred_id", user.id)
      .single();

    let referrer = null;
    if (referralRecord && referralRecord.referrer_id) {
      // Buscar email do referrer
      const { data: referrerUser } = await supabase
        .from("users")
        .select("id, email")
        .eq("id", referralRecord.referrer_id)
        .single();
      referrer = referrerUser || { id: referralRecord.referrer_id };
    }

    return {
      referralCount: referralCount ?? 0,
      badges: badges ?? [],
      referrer,
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return { referralCount: 0, badges: [], referrer: null };
  }
}
