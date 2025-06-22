"use server";

import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  CategoryData,
  CreateCategoryData,
  UpdateCategoryData,
  BaseActionResult,
} from "@/lib/types/actions";

export async function getCategories(): Promise<
  BaseActionResult<CategoryData[]>
> {
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
    logger.error("Error fetching categories:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as CategoryData[],
  };
}

export async function createCategory(
  category: CreateCategoryData
): Promise<BaseActionResult<CategoryData>> {
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
    .select()
    .single();

  if (error) {
    logger.error("Error creating category:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard/categories");

  return {
    success: true,
    data: data as CategoryData,
  };
}

export async function updateCategory(
  id: string,
  category: UpdateCategoryData
): Promise<BaseActionResult<CategoryData>> {
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
    .select()
    .single();

  if (error) {
    logger.error("Error updating category:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard/categories");

  return {
    success: true,
    data: data as CategoryData,
  };
}

export async function deleteCategory(
  id: string
): Promise<BaseActionResult<void>> {
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
    logger.error("Error deleting category:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard/categories");

  return {
    success: true,
  };
}
