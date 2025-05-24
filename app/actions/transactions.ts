"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { InsertTables, UpdateTables } from "@/lib/supabase/database.types";

export async function getTransactions(
  page = 1,
  pageSize = 10,
  month?: string,
  type?: string,
  category?: string,
  search?: string
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Calculate offset
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Apply month filter if provided
  if (month && month !== "all") {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, parseInt(month), 1).toISOString();
    const endDate = new Date(currentYear, parseInt(month) + 1, 0).toISOString();
    query = query.gte("date", startDate).lte("date", endDate);
  }

  // Apply type filter if provided
  if (type && type !== "all") {
    query = query.eq("type", type.toUpperCase());
  }

  // Apply category filter if provided
  if (category && category !== "all") {
    query = query.eq("category_id", category);
  }

  // Apply search filter if provided
  if (search) {
    query = query.or(
      `description.ilike.%${search}%,categories.name.ilike.%${search}%,financial_accounts.name.ilike.%${search}%`
    );
  }

  const { count } = await query;

  let dataQuery = supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(*),
      account:financial_accounts(*)
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  // Apply the same filters to the data query
  if (month && month !== "all") {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, parseInt(month), 1).toISOString();
    const endDate = new Date(currentYear, parseInt(month) + 1, 0).toISOString();
    dataQuery = dataQuery.gte("date", startDate).lte("date", endDate);
  }

  if (type && type !== "all") {
    dataQuery = dataQuery.eq("type", type.toUpperCase());
  }

  if (category && category !== "all") {
    dataQuery = dataQuery.eq("category_id", category);
  }

  if (search) {
    dataQuery = dataQuery.or(
      `description.ilike.%${search}%,categories.name.ilike.%${search}%,financial_accounts.name.ilike.%${search}%`
    );
  }

  const { data, error } = await dataQuery.range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching transactions:", error);
    return { data: [], total: 0 };
  }

  return { data, total: count || 0 };
}

export async function getRecentTransactions(limit = 5) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(*),
      account:financial_accounts(*)
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }

  return data;
}

export async function createTransaction(
  transaction: Omit<InsertTables<"transactions">, "user_id">
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      ...transaction,
      user_id: user.id,
    })
    .select();

  if (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: error.message };
  }

  // Update account balance
  await updateAccountBalance(transaction.account_id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return { success: true, data };
}

export async function updateTransaction(
  id: string,
  transaction: UpdateTables<"transactions">
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get the original transaction to check if account changed
  const { data: originalTransaction } = await supabase
    .from("transactions")
    .select("account_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { data, error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: error.message };
  }

  // Update account balances if the account changed
  if (
    originalTransaction &&
    transaction.account_id &&
    originalTransaction.account_id !== transaction.account_id
  ) {
    await updateAccountBalance(originalTransaction.account_id);
    await updateAccountBalance(transaction.account_id);
  } else {
    // Update the current account balance
    await updateAccountBalance(originalTransaction?.account_id || "");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return { success: true, data };
}

export async function deleteTransaction(id: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get the account_id before deleting
  const { data: transaction } = await supabase
    .from("transactions")
    .select("account_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }

  // Update account balance
  if (transaction) {
    await updateAccountBalance(transaction.account_id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return { success: true };
}

// Helper function to update account balance based on transactions
async function updateAccountBalance(accountId: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !accountId) return;

  // Get current date in UTC
  const now = new Date();
  const currentDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0)
  ).toISOString();

  // Calculate the balance from all transactions up to current date
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("account_id", accountId)
    .eq("user_id", user.id)
    .lte("date", currentDate);

  if (transactionsError) {
    console.error("Error calculating balance:", transactionsError);
    return;
  }

  const balance = transactions.reduce((total, t) => {
    return total + (t.type === "INCOME" ? t.amount : -t.amount);
  }, 0);

  // Update the account balance
  const { error: updateError } = await supabase
    .from("financial_accounts")
    .update({ balance })
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error updating account balance:", updateError);
  }
}
