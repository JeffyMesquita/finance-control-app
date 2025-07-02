import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { SavingsBoxData, CreateSavingsBoxData } from "@/lib/types/actions";

export async function POST(request: NextRequest) {
  try {
    const savingsBox: CreateSavingsBoxData = await request.json();

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

    // Validações básicas
    if (!savingsBox.name || savingsBox.name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Nome do cofrinho é obrigatório" },
        { status: 400 }
      );
    }

    if (savingsBox.target_amount && savingsBox.target_amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Meta deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Converter valores de reais para centavos
    const savingsBoxData = {
      name: savingsBox.name,
      description: savingsBox.description || null,
      current_amount: savingsBox.current_amount
        ? Math.round(savingsBox.current_amount * 100)
        : 0,
      target_amount: savingsBox.target_amount
        ? Math.round(savingsBox.target_amount * 100)
        : null,
      color: savingsBox.color || "#3B82F6",
      icon: savingsBox.icon || "piggy-bank",
      is_active: savingsBox.is_active !== false,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("savings_boxes")
      .insert(savingsBoxData)
      .select()
      .single();

    if (error) {
      logger.error("Error creating savings box:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as SavingsBoxData,
    });
  } catch (error) {
    logger.error("Error in savings-boxes/create route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
