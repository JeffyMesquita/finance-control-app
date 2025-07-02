import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { Investment, UpdateInvestmentData } from "@/lib/types/investments";

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

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data }: { id: string } & UpdateInvestmentData =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

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

    // Converter valores monetários para centavos
    const updateData = {
      ...data,
      current_amount: data.current_amount
        ? convertToCents(data.current_amount)
        : undefined,
      target_amount: data.target_amount
        ? convertToCents(data.target_amount)
        : undefined,
    };

    const { data: investment, error } = await supabase
      .from("investments")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating investment:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convertInvestmentFromDB(investment),
    });
  } catch (error) {
    logger.error("Error in investments/update route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
