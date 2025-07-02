import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();

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

    // Verificar se o cofrinho tem saldo
    const { data: savingsBox } = await supabase
      .from("savings_boxes")
      .select("current_amount, name")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (savingsBox && (savingsBox.current_amount || 0) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Não é possível excluir o cofrinho "${savingsBox.name}" porque ele possui saldo. Saque todo o dinheiro antes de excluir.`,
        },
        { status: 400 }
      );
    }

    // Verificar se o cofrinho está vinculado a alguma meta
    const { data: linkedGoals } = await supabase
      .from("financial_goals")
      .select("id, name")
      .eq("savings_box_id", id)
      .eq("user_id", user.id);

    if (linkedGoals && linkedGoals.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Não é possível excluir o cofrinho porque ele está vinculado à(s) meta(s): ${linkedGoals
            .map((g) => g.name)
            .join(", ")}. Desvincule primeiro.`,
        },
        { status: 400 }
      );
    }

    // Soft delete: marcar como inativo ao invés de excluir
    const { error } = await supabase
      .from("savings_boxes")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      logger.error("Error deleting savings box:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    logger.error("Error in savings-boxes/delete route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
