import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { GoalData, UpdateGoalData } from "@/lib/types/actions";

export async function PUT(request: NextRequest) {
  try {
    const { id, ...goal }: { id: string } & UpdateGoalData =
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

    // Converter valores de reais para centavos se estiverem presentes
    const updateData = { ...goal };
    if (updateData.target_amount !== undefined) {
      updateData.target_amount = Math.round(updateData.target_amount * 100);
    }
    if (updateData.current_amount !== undefined) {
      updateData.current_amount = Math.round(updateData.current_amount * 100);
    }

    const { data, error } = await supabase
      .from("financial_goals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating goal:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as GoalData,
    });
  } catch (error) {
    logger.error("Error in goals/update route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
