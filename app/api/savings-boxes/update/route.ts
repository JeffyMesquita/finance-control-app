import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { SavingsBoxData, UpdateSavingsBoxData } from "@/lib/types/actions";

export async function PUT(request: NextRequest) {
  try {
    const { id, ...savingsBox }: { id: string } & UpdateSavingsBoxData =
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

    // Validações básicas
    if (
      savingsBox.name !== undefined &&
      (!savingsBox.name || savingsBox.name.trim() === "")
    ) {
      return NextResponse.json(
        { success: false, error: "Nome do cofrinho é obrigatório" },
        { status: 400 }
      );
    }

    if (
      savingsBox.target_amount !== undefined &&
      savingsBox.target_amount !== null &&
      savingsBox.target_amount <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Meta deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Converter valores de reais para centavos se estiverem presentes
    const updateData: any = { ...savingsBox };
    if (updateData.current_amount !== undefined) {
      updateData.current_amount = updateData.current_amount
        ? Math.round(updateData.current_amount * 100)
        : 0;
    }
    if (
      updateData.target_amount !== undefined &&
      updateData.target_amount !== null
    ) {
      updateData.target_amount = Math.round(updateData.target_amount * 100);
    }

    const { data, error } = await supabase
      .from("savings_boxes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating savings box:", error as Error);
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
    logger.error("Error in savings-boxes/update route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
