"use server"

import { revalidatePath } from "next/cache"
import { createActionClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { InsertTables, UpdateTables } from "@/lib/supabase/database.types"

export async function getTransactions() {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      category:categories(*),
      account:financial_accounts(*)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data
}

export async function getRecentTransactions(limit = 5) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      category:categories(*),
      account:financial_accounts(*)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }

  return data
}

export async function createTransaction(transaction: Omit<InsertTables<"transactions">, "user_id">) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      ...transaction,
      user_id: user.id,
    })
    .select()

  if (error) {
    console.error("Error creating transaction:", error)
    return { success: false, error: error.message }
  }

  // Update account balance
  await updateAccountBalance(transaction.account_id)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")

  return { success: true, data }
}

export async function updateTransaction(id: string, transaction: UpdateTables<"transactions">) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the original transaction to check if account changed
  const { data: originalTransaction } = await supabase
    .from("transactions")
    .select("account_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const { data, error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()

  if (error) {
    console.error("Error updating transaction:", error)
    return { success: false, error: error.message }
  }

  // Update account balances if the account changed
  if (originalTransaction && transaction.account_id && originalTransaction.account_id !== transaction.account_id) {
    await updateAccountBalance(originalTransaction.account_id)
    await updateAccountBalance(transaction.account_id)
  } else {
    // Update the current account balance
    await updateAccountBalance(originalTransaction?.account_id || "")
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")

  return { success: true, data }
}

export async function deleteTransaction(id: string) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the account_id before deleting
  const { data: transaction } = await supabase
    .from("transactions")
    .select("account_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting transaction:", error)
    return { success: false, error: error.message }
  }

  // Update account balance
  if (transaction) {
    await updateAccountBalance(transaction.account_id)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")

  return { success: true }
}

// Helper function to update account balance based on transactions
async function updateAccountBalance(accountId: string) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !accountId) return

  // Calculate the balance from all transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("account_id", accountId)
    .eq("user_id", user.id)

  if (transactionsError) {
    console.error("Error calculating balance:", transactionsError)
    return
  }

  const balance = transactions.reduce((total, t) => {
    return total + (t.type === "INCOME" ? t.amount : -t.amount)
  }, 0)

  // Update the account balance
  const { error: updateError } = await supabase
    .from("financial_accounts")
    .update({ balance })
    .eq("id", accountId)
    .eq("user_id", user.id)

  if (updateError) {
    console.error("Error updating account balance:", updateError)
  }
}
