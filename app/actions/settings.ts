"use server"

import { revalidatePath } from "next/cache"
import { createActionClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { UserSettings } from "@/lib/types"

export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase.from("user_settings").select("*").eq("id", user.id).single()

  if (error && error.code !== "PGRST116") {
    console.error("Erro ao buscar configurações do usuário:", error)
    return null
  }

  return data
}

export async function updateUserSettings(settings: UserSettings) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase.from("user_settings").upsert({
    ...settings,
    id: user.id,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Erro ao atualizar configurações do usuário:", error)
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/configuracoes")
  return { success: true }
}

export async function updateTheme(theme: string) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ theme, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) {
    console.error("Erro ao atualizar tema:", error)
    throw new Error(error.message)
  }

  revalidatePath("/dashboard")
  return { success: true }
}
