"use server";

import { logger } from "@/lib/utils/logger";
import { createActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { BaseActionResult } from "@/lib/types/actions";

export async function handleReferral(
  referralId: string
): Promise<BaseActionResult<string>> {
  if (!referralId) {
    return {
      success: false,
      error: "ID de referência não encontrado",
    };
  }

  const supabase = createActionClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  // Prevenir auto-referência
  if (user.id === referralId) {
    return {
      success: false,
      error: "Você não pode se auto-referenciar",
    };
  }

  try {
    // Verificar se o usuário que está referenciando existe e está ativo
    const { data: referrer, error: referrerError } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", referralId)
      .single();

    if (referrerError || !referrer) {
      return {
        success: false,
        error: "Usuário que está referenciando não encontrado",
      };
    }

    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from("user_invites")
      .select("id")
      .eq("referred_id", user.id)
      .single();

    if (existingReferral) {
      return {
        success: false,
        error: "Você já foi referenciado anteriormente",
      };
    }

    // Create referral
    const { error: referralError }: { error: unknown } = await supabase
      .from("user_invites")
      .insert({
        referrer_id: referralId,
        referred_id: user.id,
      });

    if (referralError) {
      logger.error("Failed to create referral:", referralError as Error);
      return {
        success: false,
        error: "Erro ao processar referência",
      };
    }

    // Get total referrals for the referrer
    const { count: totalReferrals } = await supabase
      .from("user_invites")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", referralId);

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

        if (!badgeError) {
          newBadges++;
        }
      }
    }

    revalidatePath("/");

    const successMessage = `Referência processada com sucesso! ${
      newBadges > 0 ? `Novas badges conquistadas: ${newBadges}` : ""
    }`;

    return {
      success: true,
      data: successMessage,
    };
  } catch (error) {
    logger.error("Error handling referral:", error as Error);
    return {
      success: false,
      error: "Erro ao processar referência",
    };
  }
}

export async function getReferralStats(): Promise<BaseActionResult<any>> {
  const supabase = createActionClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: true,
      data: { referralCount: 0, badges: [], referrer: null },
    };
  }

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
      success: true,
      data: {
        referralCount: referralCount ?? 0,
        badges: badges ?? [],
        referrer,
      },
    };
  } catch (error) {
    logger.error("Error getting referral stats:", error as Error);
    return {
      success: false,
      error: "Erro ao buscar estatísticas de referência",
    };
  }
}
