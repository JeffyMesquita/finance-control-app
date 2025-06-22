"use server";

import { logger } from "@/lib/utils/logger";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserSettings } from "@/lib/types";
import type { BaseActionResult } from "@/lib/types/actions";

export async function getUserSettings(): Promise<
  BaseActionResult<UserSettings>
> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    logger.error("Erro ao buscar configurações do usuário:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as UserSettings,
  };
}

export async function updateUserSettings(
  settings: UserSettings
): Promise<BaseActionResult<void>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("user_settings").upsert({
    ...settings,
    id: user.id,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    logger.error("Erro ao atualizar configurações do usuário:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard/configuracoes");
  return {
    success: true,
  };
}

export async function updateTheme(
  theme: string
): Promise<BaseActionResult<void>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ theme, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    logger.error("Erro ao atualizar tema:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
  };
}
