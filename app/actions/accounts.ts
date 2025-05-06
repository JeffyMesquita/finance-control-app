"use server"

import { revalidatePath } from "next/cache"
import { createActionClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { InsertTables, UpdateTables } from "@/lib/supabase/database.types"

export async function getAccounts() {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase.from("financial_accounts").select("*").eq("user_id", user.id).order("name")

  if (error) {
    console.error("Error fetching accounts:", error)
    return []
  }

  return data
}

export async function createAccount(account: Omit<InsertTables<"financial_accounts">, "user_id">) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .insert({
      ...account,
      user_id: user.id,
    })
    .select()

  if (error) {
    console.error("Error creating account:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")

  return { success: true, data }
}

export async function updateAccount(id: string, account: UpdateTables<"financial_accounts">) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .update(account)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()

  if (error) {
    console.error("Error updating account:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")

  return { success: true, data }
}

export async function deleteAccount(id: string) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase.from("financial_accounts").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting account:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")

  return { success: true }
}
