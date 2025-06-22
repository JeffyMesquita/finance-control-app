"use server";

import { logger } from "@/lib/utils/logger";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { InsertTables, UpdateTables } from "@/lib/supabase/database.types";

export async function getAccounts() {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    logger.error("Error fetching accounts:", error as Error);
    return [];
  }

  return data;
}

export async function createAccount(
  account: Omit<InsertTables<"financial_accounts">, "user_id">
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .insert({
      ...account,
      user_id: user.id,
    })
    .select();

  if (error) {
    logger.error("Error creating account:", error as Error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");

  return { success: true, data };
}

export async function updateAccount(
  id: string,
  account: UpdateTables<"financial_accounts">
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .update(account)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    logger.error("Error updating account:", error as Error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");

  return { success: true, data };
}

export async function deleteAccount(id: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("financial_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error deleting account:", error as Error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");

  return { success: true };
}

