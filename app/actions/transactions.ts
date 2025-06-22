"use server";

import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  TransactionData,
  TransactionFilters,
  TransactionStats,
  CreateTransactionData,
  UpdateTransactionData,
  PaginatedResult,
  BaseActionResult,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/types/actions";

export async function getTransactions(
  page = 1,
  pageSize = 10,
  month?: string,
  type?: string,
  category?: string,
  search?: string
): Promise<PaginatedResult<TransactionData>> {
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
    logger.error("Error fetching transactions:", error as Error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0,
      page,
      limit: pageSize,
      hasMore: false,
    };
  }

  const total = count || 0;
  const hasMore = offset + pageSize < total;

  return {
    success: true,
    data: data as TransactionData[],
    total,
    page,
    limit: pageSize,
    hasMore,
  };
}

export async function getRecentTransactions(
  limit = 5
): Promise<BaseActionResult<TransactionData[]>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get current date in UTC (end of today)
  const now = new Date();
  const endOfToday = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  ).toISOString();

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
    .lte("date", endOfToday) // Only transactions up to today
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Error fetching recent transactions:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as TransactionData[],
  };
}

export async function createTransaction(
  transaction: CreateTransactionData
): Promise<BaseActionResult<TransactionData>> {
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
    .select()
    .single();

  if (error) {
    logger.error("Error creating transaction:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  // Update account balance
  await updateAccountBalance(transaction.account_id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return {
    success: true,
    data: data as unknown as TransactionData,
  };
}

export async function updateTransaction(
  id: string,
  transaction: UpdateTransactionData
): Promise<BaseActionResult<TransactionData>> {
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
    .select()
    .single();

  if (error) {
    logger.error("Error updating transaction:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  // Update account balances if the account changed
  if (
    originalTransaction &&
    transaction.account_id &&
    originalTransaction.account_id !== transaction.account_id
  ) {
    await updateAccountBalance(originalTransaction.account_id || "");
    await updateAccountBalance(transaction.account_id || "");
  } else {
    // Update the current account balance
    await updateAccountBalance(originalTransaction?.account_id || "");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return {
    success: true,
    data: data as unknown as TransactionData,
  };
}

export async function deleteTransaction(
  id: string
): Promise<BaseActionResult<void>> {
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
    logger.error("Error deleting transaction:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  // Update account balance
  if (transaction) {
    await updateAccountBalance(transaction.account_id || "");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return {
    success: true,
  };
}

export async function deleteTransactions(
  ids: string[]
): Promise<BaseActionResult<void>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get all account_ids before deleting
  const { data: transactions } = await supabase
    .from("transactions")
    .select("account_id")
    .in("id", ids)
    .eq("user_id", user.id);

  // Delete all transactions in a single query
  const { error } = await supabase
    .from("transactions")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error deleting transactions:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  // Update account balances for all affected accounts
  if (transactions) {
    const uniqueAccountIds = [
      ...new Set(transactions.map((t) => t.account_id)),
    ];
    await Promise.all(
      uniqueAccountIds.map((id) => updateAccountBalance(id || ""))
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return {
    success: true,
  };
}

export async function getTransactionStats(
  filters?: TransactionFilters
): Promise<BaseActionResult<TransactionStats>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let query = supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id);

  // Apply filters
  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.accountId) {
    query = query.eq("account_id", filters.accountId);
  }
  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("Error fetching transaction stats:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  const totalTransactions = data.length;
  const totalIncome = data
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = data
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const amounts = data.map((t) => t.amount);

  const stats: TransactionStats = {
    totalTransactions,
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses,
    averageTransactionAmount:
      totalTransactions > 0
        ? amounts.reduce((a, b) => a + b, 0) / totalTransactions
        : 0,
    largestTransaction: amounts.length > 0 ? Math.max(...amounts) : 0,
    smallestTransaction: amounts.length > 0 ? Math.min(...amounts) : 0,
  };

  return {
    success: true,
    data: stats,
  };
}

// Helper function to update account balance based on transactions
async function updateAccountBalance(accountId: string): Promise<void> {
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
    logger.error("Error calculating balance:", transactionsError);
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
    logger.error("Error updating account balance:", updateError);
  }
}
