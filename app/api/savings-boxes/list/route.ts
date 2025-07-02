import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { SavingsBoxData } from "@/lib/types/actions";

export async function GET() {
  try {
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

    try {
      // Primeiro, tentar a query completa com relacionamentos
      const { data, error } = await supabase
        .from("savings_boxes")
        .select(
          `
          *,
          savings_transactions(
            id,
            amount,
            type,
            description,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(
          "Error fetching savings boxes with transactions:",
          error as Error
        );

        // Fallback: buscar sem relacionamentos se houver erro
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("savings_boxes")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (fallbackError) {
          logger.error(
            "Error fetching savings boxes (fallback):",
            fallbackError
          );
          return NextResponse.json(
            { success: false, error: fallbackError.message },
            { status: 500 }
          );
        }

        // Adicionar array vazio de transações para manter compatibilidade
        const dataWithEmptyTransactions = fallbackData.map((box) => ({
          ...box,
          savings_transactions: [],
        }));

        logger.info(
          "✅ Fallback successful, returning data without transactions"
        );
        return NextResponse.json({
          success: true,
          data: dataWithEmptyTransactions as SavingsBoxData[],
        });
      }

      logger.info("✅ Successfully fetched savings boxes with transactions");
      return NextResponse.json({
        success: true,
        data: data as unknown as SavingsBoxData[],
      });
    } catch (err) {
      logger.error("Unexpected error in getSavingsBoxes:", err as Error);
      return NextResponse.json(
        { success: false, error: "Erro inesperado ao buscar cofrinhos" },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Error in savings-boxes/list route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
