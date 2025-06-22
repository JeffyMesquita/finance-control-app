"use server";

import { logger } from "@/lib/utils/logger";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserProfile } from "@/lib/types";
import type { BaseActionResult } from "@/lib/types/actions";

export async function getUserProfile(): Promise<BaseActionResult<UserProfile>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    logger.error("Erro ao buscar perfil do usuário:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as UserProfile,
  };
}

export async function updateUserProfile(
  profile: UserProfile
): Promise<BaseActionResult<void>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("user_profiles").upsert({
    ...profile,
    id: user.id,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    logger.error("Erro ao atualizar perfil do usuário:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard/perfil");
  return {
    success: true,
  };
}

export async function updateProfileImage(
  imageUrl: string
): Promise<BaseActionResult<void>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ profile_image: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    logger.error("Erro ao atualizar imagem de perfil:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard/perfil");
  return {
    success: true,
  };
}
