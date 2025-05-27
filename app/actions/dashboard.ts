"use server";

import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Category = {
  id: string;
  icon: string;
  name: string;
  type: string;
  color: string;
  user_id: string;
};

export type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
};

// type Transaction = {

type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  account: Account;
  account_id: string;
  amount: number;
  category: Category;
  category_id: string;
  date: string;
  description: string;
  id: string;
  type: TransactionType;
  is_recurring: boolean;
  installment_number: number | null;
  total_installments: number | null;
  notes: string;
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
    .select("id, balance")
    .eq("user_id", user.id);

  if (accountsError) {
    console.error("Error fetching accounts:", accountsError);
    return {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlySavings: 0,
      gastosFuturos: 0,
      incomeCount: 0,
      maxIncome: 0,
      expenseCount: 0,
      maxExpense: 0,
      savings: 0,
      nextMonthExpenses: 0,
      nextMonthIncome: 0,
    };
  }

  // Calcular o primeiro e último dia do mês atual
  const now = new Date();
  const lastDayOfCurrentMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  ).toISOString();

  let totalBalance = 0;

  for (const account of accounts) {
    // Buscar todas as transações até o final do mês atual
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("account_id", account.id)
      .eq("user_id", user.id)
      .lte("date", lastDayOfCurrentMonth);

    let accountBalance = account.balance;

    if (!transactionsError && transactions) {
      // Somar todas as entradas
      const totalIncome = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      // Subtrair todas as despesas
      const totalExpenses = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      accountBalance = totalIncome - totalExpenses;
    }

    totalBalance += accountBalance;
  }

  // Calcular o primeiro dia do próximo mês
  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  ).toISOString();

  const lastDayOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 2,
    0,
    23,
    59,
    59,
    999
  ).toISOString();

  // Buscar todas as despesas futuras (a partir do próximo mês, sem limite superior)
  const { data: allFutureExpenses, error: allFutureExpensesError } =
    await supabase
      .from("transactions")
      .select("amount, type, date")
      .eq("user_id", user.id)
      .eq("type", "EXPENSE")
      .gte("date", nextMonth);

  let gastosFuturos = 0;
  if (!allFutureExpensesError && allFutureExpenses) {
    gastosFuturos = allFutureExpenses.reduce((sum, t) => sum + t.amount, 0);
  }

  let nextMonthExpenses = 0;
  let nextMonthIncome = 0;

  for (const account of accounts) {
    const { data: futureExpenses, error: futureExpensesError } = await supabase
      .from("transactions")
      .select("amount, type, date")
      .eq("account_id", account.id)
      .eq("user_id", user.id)
      .gte("date", nextMonth)
      .lte("date", lastDayOfNextMonth);

    if (!futureExpensesError && futureExpenses) {
      // Calcular despesas do próximo mês
      nextMonthExpenses += futureExpenses
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      // Calcular receitas do próximo mês
      nextMonthIncome += futureExpenses
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);
    }
  }

  // Buscar transações do mês atual
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  ).toISOString();
  const { data: monthlyTransactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", firstDayOfMonth)
    .lte("date", lastDayOfMonth);

  let incomeCount = 0;
  let maxIncome = 0;
  let expenseCount = 0;
  let maxExpense = 0;

  if (!transactionsError && monthlyTransactions) {
    const incomes = monthlyTransactions.filter((t) => t.type === "INCOME");
    const expenses = monthlyTransactions.filter((t) => t.type === "EXPENSE");
    incomeCount = incomes.length;
    maxIncome = incomes.reduce(
      (max, t) => (t.amount > max ? t.amount : max),
      0
    );
    expenseCount = expenses.length;
    maxExpense = expenses.reduce(
      (max, t) => (t.amount > max ? t.amount : max),
      0
    );
  }

  // Get current month's income and expenses
  const monthlyIncome = (monthlyTransactions || [])
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = (monthlyTransactions || [])
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    gastosFuturos,
    incomeCount,
    maxIncome,
    expenseCount,
    maxExpense,
    savings: 0, // Placeholder para poupança
    nextMonthExpenses,
    nextMonthIncome,
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

export async function getExpenseBreakdown(
  month: "current" | "previous" = "current"
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get current month's expenses by category
  const now = new Date();
  const monthOffset = month === "previous" ? -1 : 0;

  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset,
    1
  ).toISOString();
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset + 1,
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
