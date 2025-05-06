"use server"

import { revalidatePath } from "next/cache"
import { createActionClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { InsertTables, UpdateTables } from "@/lib/supabase/database.types"

export async function getGoals() {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .select(`
      *,
      category:categories(*),
      account:financial_accounts(*)
    `)
    .eq("user_id", user.id)
    .order("target_date", { ascending: true })

  if (error) {
    console.error("Error fetching goals:", error)
    return []
  }

  return data
}

export async function getGoalById(id: string) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .select(`
      *,
      category:categories(*),
      account:financial_accounts(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching goal:", error)
    return null
  }

  return data
}

export async function createGoal(goal: Omit<InsertTables<"financial_goals">, "user_id">) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .insert({
      ...goal,
      user_id: user.id,
    })
    .select()

  if (error) {
    console.error("Error creating goal:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/goals")

  return { success: true, data }
}

export async function updateGoal(id: string, goal: UpdateTables<"financial_goals">) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .update(goal)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()

  if (error) {
    console.error("Error updating goal:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/goals")

  return { success: true, data }
}

export async function deleteGoal(id: string) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase.from("financial_goals").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting goal:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/goals")

  return { success: true }
}

export async function updateGoalProgress(id: string, amount: number) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the current goal
  const { data: goal, error: fetchError } = await supabase
    .from("financial_goals")
    .select("current_amount, target_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError) {
    console.error("Error fetching goal:", fetchError)
    return { success: false, error: fetchError.message }
  }

  // Calculate new amount
  const newAmount = goal.current_amount + amount
  const isCompleted = newAmount >= goal.target_amount

  // Update the goal
  const { data, error } = await supabase
    .from("financial_goals")
    .update({
      current_amount: newAmount,
      is_completed: isCompleted,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()

  if (error) {
    console.error("Error updating goal progress:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/goals")

  return { success: true, data }
}
