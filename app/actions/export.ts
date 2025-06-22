"use server";

import { logger } from "@/lib/utils/logger";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  TransactionData,
  AccountData,
  CategoryData,
  GoalData,
  BaseActionResult,
} from "@/lib/types/actions";

// Export transactions
export async function getTransactionsForExport(
  dateFrom?: string,
  dateTo?: string,
  type?: string,
  categoryId?: string,
  accountId?: string
): Promise<BaseActionResult<TransactionData[]>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let query = supabase
    .from("transactions")
    .select(
      `
      id,
      amount,
      description,
      date,
      type,
      notes,
      is_recurring,
      category:categories(id, name),
      account:financial_accounts(id, name, type)
    `
    )
    .eq("user_id", user.id);

  // Apply filters
  if (dateFrom) {
    query = query.gte("date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("date", dateTo);
  }
  if (type && (type === "INCOME" || type === "EXPENSE")) {
    query = query.eq("type", type);
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (accountId) {
    query = query.eq("account_id", accountId);
  }

  // Order by date
  query = query.order("date", { ascending: false });

  const { data, error } = await query;

  if (error) {
    logger.error("Error fetching transactions for export:", error as Error);
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

// Export accounts
export async function getAccountsForExport(): Promise<
  BaseActionResult<AccountData[]>
> {
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
    logger.error("Error fetching accounts for export:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as AccountData[],
  };
}

// Export categories
export async function getCategoriesForExport(): Promise<
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
    logger.error("Error fetching categories for export:", error as Error);
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

// Export goals
export async function getGoalsForExport(): Promise<
  BaseActionResult<GoalData[]>
> {
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
      category:categories(id, name),
      account:financial_accounts(id, name)
    `
    )
    .eq("user_id", user.id)
    .order("target_date");

  if (error) {
    logger.error("Error fetching goals for export:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as GoalData[],
  };
}

// Get monthly summary for export
export async function getMonthlySummaryForExport(
  year?: number
): Promise<BaseActionResult<any[]>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const currentYear = year || new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1).toISOString();
  const endDate = new Date(currentYear, 11, 31).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, date")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    logger.error("Error fetching monthly summary for export:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  // Group by month
  const monthlyData = Array(12)
    .fill(0)
    .map((_, index) => {
      return {
        month: new Date(currentYear, index, 1).toLocaleString("default", {
          month: "long",
        }),
        income: 0,
        expenses: 0,
        savings: 0,
      };
    });

  data.forEach((transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth();

    if (transaction.type === "INCOME") {
      monthlyData[month].income += transaction.amount || 0;
    } else {
      monthlyData[month].expenses += transaction.amount || 0;
    }
  });

  // Calculate savings
  monthlyData.forEach((month) => {
    month.savings = month.income - month.expenses;
  });

  return {
    success: true,
    data: monthlyData,
  };
}
