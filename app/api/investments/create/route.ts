import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import {
  Investment,
  CreateInvestmentData,
  INVESTMENT_CATEGORY_COLORS,
} from "@/lib/types/investments";

// Helper para converter reais para centavos
const convertToCents = (reais: number): number => {
  return Math.round(reais * 100);
};

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

export async function POST(request: NextRequest) {
  try {
    const data: CreateInvestmentData = await request.json();

    const supabase = createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const investmentData = {
      ...data,
      user_id: user.id,
      initial_amount: convertToCents(data.initial_amount),
      current_amount: convertToCents(data.initial_amount),
      target_amount: data.target_amount
        ? convertToCents(data.target_amount)
        : undefined,
      color: data.color || INVESTMENT_CATEGORY_COLORS[data.category],
    };

    const { data: investment, error } = await supabase
      .from("investments")
      .insert(investmentData)
      .select()
      .single();

    if (error) {
      logger.error("Error creating investment:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Criar transação inicial de aporte
    await supabase.from("investment_transactions").insert({
      investment_id: investment.id,
      user_id: user.id,
      type: "aporte",
      amount: convertToCents(data.initial_amount),
      description: "Investimento inicial",
      transaction_date: data.investment_date,
    });

    return NextResponse.json({
      success: true,
      data: convertInvestmentFromDB(investment),
    });
  } catch (error) {
    logger.error("Error in investments/create route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
