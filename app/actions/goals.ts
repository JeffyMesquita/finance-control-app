"use server";

import { logger } from "@/lib/utils/logger";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { InsertTables, UpdateTables } from "@/lib/supabase/database.types";

export async function getGoals() {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .select(
      `
      *,
      category:categories(*),
      account:financial_accounts(*),
      savings_box:savings_boxes(
        id,
        name,
        color,
        current_amount
      )
    `
    )
    .eq("user_id", user.id)
    .order("target_date", { ascending: true });

  if (error) {
    logger.error("Error fetching goals:", error as Error);
    return [];
  }

  return data;
}

export async function getGoalById(id: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .select(
      `
      *,
      category:categories(*),
      account:financial_accounts(*),
      savings_box:savings_boxes(
        id,
        name,
        color,
        current_amount
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    logger.error("Error fetching goal:", error as Error);
    return null;
  }

  return data;
}

export async function createGoal(
  goal: Omit<InsertTables<"financial_goals">, "user_id">
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Converter valores de reais para centavos
  const goalData = {
    ...goal,
    target_amount: Math.round(goal.target_amount * 100),
    current_amount: goal.current_amount
      ? Math.round(goal.current_amount * 100)
      : 0,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("financial_goals")
    .insert(goalData)
    .select();

  if (error) {
    logger.error("Error creating goal:", error as Error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/goals");

  return { success: true, data };
}

export async function updateGoal(
  id: string,
  goal: UpdateTables<"financial_goals">
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Converter valores de reais para centavos se estiverem presentes
  const updateData = { ...goal };
  if (updateData.target_amount !== undefined) {
    updateData.target_amount = Math.round(updateData.target_amount * 100);
  }
  if (updateData.current_amount !== undefined) {
    updateData.current_amount = Math.round(updateData.current_amount * 100);
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    logger.error("Error updating goal:", error as Error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/goals");

  return { success: true, data };
}

export async function deleteGoal(id: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("financial_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error deleting goal:", error as Error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/goals");

  return { success: true };
}

export async function updateGoalProgress(id: string, amount: number) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get the current goal
  const { data: goal, error: fetchError } = await supabase
    .from("financial_goals")
    .select("current_amount, target_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    logger.error("Error fetching goal:", fetchError);
    return { success: false, error: fetchError.message };
  }

  // Convert contribution amount to cents
  const amountInCents = Math.round(amount * 100);

  // Calculate new amount (both values are already in cents)
  const newAmount = goal.current_amount + amountInCents;
  const isCompleted = newAmount >= goal.target_amount;

  // Update the goal
  const { data, error } = await supabase
    .from("financial_goals")
    .update({
      current_amount: newAmount,
      is_completed: isCompleted,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    logger.error("Error updating goal progress:", error as Error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/goals");

  return { success: true, data };
}

