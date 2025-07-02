import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { Investment, InvestmentSummary } from "@/lib/types/investments";

// Helper para converter centavos para reais
const convertFromCents = (cents: number): number => {
  return cents / 100;
};

// Helper para converter investment do banco (centavos) para interface (reais)
const convertInvestmentFromDB = (investment: any): Investment => ({
  ...investment,
  initial_amount: convertFromCents(investment.initial_amount),
  current_amount: convertFromCents(investment.current_amount),
  target_amount: investment.target_amount
    ? convertFromCents(investment.target_amount)
    : undefined,
});

export async function GET() {
  try {
    const supabase = createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          total_invested: 0,
          current_value: 0,
          total_return: 0,
          return_percentage: 0,
          monthly_contributions: 0,
          active_investments: 0,
        },
      });
    }

    // Buscar investimentos
    const { data: investmentsData, error: investmentsError } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (investmentsError) {
      logger.error("Error fetching investments:", investmentsError as Error);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar investimentos" },
        { status: 500 }
      );
    }

    const investments = (investmentsData || []).map(convertInvestmentFromDB);
    const activeInvestments = investments.filter((inv) => inv.is_active);

    const totalInvested = activeInvestments.reduce(
      (sum, inv) => sum + inv.initial_amount,
      0
    );
    const currentValue = activeInvestments.reduce(
      (sum, inv) => sum + inv.current_amount,
      0
    );
    const totalReturn = currentValue - totalInvested;
    const returnPercentage =
      totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Calcular aportes mensais (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentTransactions } = await supabase
      .from("investment_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "aporte")
      .gte("transaction_date", thirtyDaysAgo.toISOString().split("T")[0]);

    const monthlyContributions =
      recentTransactions?.reduce(
        (sum, t) => sum + convertFromCents(t.amount),
        0
      ) || 0;

    const summary: InvestmentSummary = {
      total_invested: totalInvested,
      current_value: currentValue,
      total_return: totalReturn,
      return_percentage: returnPercentage,
      monthly_contributions: monthlyContributions,
      active_investments: activeInvestments.length,
    };

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error("Error in investments/summary route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
