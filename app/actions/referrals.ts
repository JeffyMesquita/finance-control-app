"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ReferralResult = {
  success: boolean;
  message: string;
};

export async function handleReferral(
  referralId: string
): Promise<ReferralResult> {
  if (!referralId) {
    return {
      success: false,
      message: "ID de referência não encontrado",
    };
  }

  const supabase = createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  // Prevenir auto-referência
  if (user.id === referralId) {
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

    if (referrerError || !referrer) {
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

    if (existingReferral) {
      return {
        success: false,
        message: "Você já foi referenciado anteriormente",
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
      console.error("Failed to create referral:", referralError);
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

    return {
      success: true,
      message: `Referência processada com sucesso! ${
        newBadges > 0 ? `Novas badges conquistadas: ${newBadges}` : ""
      }`,
    };
  } catch (error) {
    console.error("Error handling referral:", error);
    return {
      success: false,
      message: "Erro ao processar referência",
    };
  }
}

export async function getReferralStats() {
  const supabase = createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { referralCount: 0, badges: [] };

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

    return {
      referralCount: referralCount ?? 0,
      badges: badges ?? [],
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return { referralCount: 0, badges: [] };
  }
}
