"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function handleReferral(referralId: string) {
  if (!referralId) return;

  const supabase = createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Prevenir auto-referência
  if (user.id === referralId) {
    console.log("Usuário tentou se auto-referenciar");
    return;
  }

  try {
    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from("user_invites")
      .select("id")
      .eq("referred_id", user.id)
      .single();

    if (existingReferral) return;

    // Create referral
    const { error: referralError }: { error: unknown } = await supabase
      .from("user_invites")
      .insert({
        referrer_id: referralId,
        referred_id: user.id,
      });

    if (referralError) {
      console.error("Failed to create referral:", referralError);
      return;
    }

    // Get total referrals for the referrer
    const { count: totalReferrals } = await supabase
      .from("user_invites")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", referralId);

    // Award badges based on referral count
    const badgeThresholds = [5, 10, 25, 50, 100];
    for (const threshold of badgeThresholds) {
      if (totalReferrals && totalReferrals >= threshold) {
        const { error: badgeError } = await supabase
          .from("user_badges")
          .insert({
            user_id: referralId,
            badge_type: `REFERRAL_${threshold}`,
          });

        if (badgeError) {
          console.error("Failed to create badge:", badgeError);
        }
      }
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error handling referral:", error);
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
