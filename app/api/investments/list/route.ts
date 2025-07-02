import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { Investment } from "@/lib/types/investments";

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
        data: [],
      });
    }

    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching investments:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map(convertInvestmentFromDB),
    });
  } catch (error) {
    logger.error("Error in investments/list route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
