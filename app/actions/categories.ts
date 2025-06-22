"use server";

import { logger } from "@/lib/utils/logger";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { InsertTables, UpdateTables } from "@/lib/supabase/database.types";

export async function getCategories() {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    logger.error("Error fetching categories:", error);
    return [];
  }

  return data;
}

export async function createCategory(
  category: Omit<InsertTables<"categories">, "user_id">
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      ...category,
      user_id: user.id,
    })
    .select();

  if (error) {
    logger.error("Error creating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/categories");

  return { success: true, data };
}

export async function updateCategory(
  id: string,
  category: Omit<
    UpdateTables<"categories">,
    "user_id" | "created_at" | "updated_at"
  >
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    logger.error("Error updating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/categories");

  return { success: true, data };
}

export async function deleteCategory(id: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/categories");

  return { success: true };
}
