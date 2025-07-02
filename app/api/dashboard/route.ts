import { getSavingsBoxesTotal } from "@/app/actions/savings-boxes";
import { createActionClient } from "@/lib/supabase/server";
import type { DashboardData } from "@/lib/types/actions";
import { logger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createActionClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get total balance across all accounts
    const { data: accounts, error: accountsError } = await supabase
      .from("financial_accounts")
      .select("id, balance")
      .eq("user_id", user.id);

    if (accountsError) {
      logger.error("Error fetching accounts:", accountsError as Error);
      return NextResponse.json({
        success: true,
        data: {
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
        },
      });
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

      totalBalance += accountBalance || 0;
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
      const { data: futureExpenses, error: futureExpensesError } =
        await supabase
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
    const { data: monthlyTransactions, error: transactionsError } =
      await supabase
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

    // Buscar total dos cofrinhos
    let savingsBoxesTotal = 0;
    try {
      const savingsBoxesTotalResult = await getSavingsBoxesTotal();
      if (savingsBoxesTotalResult) {
        savingsBoxesTotal = savingsBoxesTotalResult;
      }
    } catch (error) {
      logger.error("Erro ao buscar total dos cofrinhos:", error as Error);
      savingsBoxesTotal = 0;
    }

    const dashboardData: DashboardData = {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      gastosFuturos,
      incomeCount,
      maxIncome,
      expenseCount,
      maxExpense,
      savings: savingsBoxesTotal, // Total dos cofrinhos digitais
      nextMonthExpenses,
      nextMonthIncome,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error("Error in dashboard API:", error as Error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar dados do dashboard" },
      { status: 500 }
    );
  }
}
