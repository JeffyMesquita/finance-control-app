"use server";

import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Transaction {
  amount: number;
  category: Category;
}

export async function getDashboardData() {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get total balance across all accounts
  const { data: accounts, error: accountsError } = await supabase
    .from("financial_accounts")
    .select("balance")
    .eq("user_id", user.id);

  if (accountsError) {
    console.error("Error fetching accounts:", accountsError);
    return {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlySavings: 0,
    };
  }

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  // Get current month's income and expenses
  const now = new Date();
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).toISOString();

  const { data: monthlyTransactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", firstDayOfMonth)
    .lte("date", lastDayOfMonth);

  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError);
    return {
      totalBalance,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlySavings: 0,
    };
  }

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
  };
}

export async function getMonthlyData() {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get data for the last 6 months
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleString("default", { month: "short" });
    const firstDay = new Date(
      month.getFullYear(),
      month.getMonth(),
      1
    ).toISOString();
    const lastDay = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).toISOString();

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", user.id)
      .gte("date", firstDay)
      .lte("date", lastDay);

    if (error) {
      console.error(`Error fetching transactions for ${monthName}:`, error);
      months.push({
        name: monthName,
        income: 0,
        expenses: 0,
        savings: 0,
      });
      continue;
    }

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    months.push({
      name: monthName,
      income,
      expenses,
      savings: income - expenses,
    });
  }

  return months;
}

export async function getExpenseBreakdown() {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get current month's expenses by category
  const now = new Date();
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      amount,
      category:categories(id, name, color)
    `
    )
    .eq("user_id", user.id)
    .eq("type", "EXPENSE")
    .gte("date", firstDayOfMonth)
    .lte("date", lastDayOfMonth);

  if (error) {
    console.error("Error fetching expense breakdown:", error);
    return [];
  }

  // Group by category
  const categoryMap = new Map();

  const typedData = data as unknown as Transaction[];

  typedData.forEach((transaction: Transaction) => {
    if (!transaction.category) return;

    const categoryId = transaction.category.id;
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        name: transaction.category.name,
        color: transaction.category.color || "#64748b",
        value: 0,
      });
    }

    categoryMap.get(categoryId).value += transaction.amount;
  });

  return Array.from(categoryMap.values());
}
