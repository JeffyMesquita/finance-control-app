import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { GoalData } from "@/lib/types/actions";

export async function PUT(request: NextRequest) {
  try {
    const { id, amount }: { id: string; amount: number } = await request.json();

    if (!id || amount === undefined) {
      return NextResponse.json(
        { success: false, error: "ID and amount are required" },
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

    // Get the current goal
    const { data: goal, error: fetchError } = await supabase
      .from("financial_goals")
      .select("current_amount, target_amount")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      logger.error("Error fetching goal:", fetchError);
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // Convert contribution amount to cents
    const amountInCents = Math.round(amount * 100);

    // Calculate new amount (both values are already in cents)
    const newAmount = (goal.current_amount || 0) + amountInCents;
    const isCompleted = newAmount >= goal.target_amount;

    // Update the goal
    const { data, error } = await supabase
      .from("financial_goals")
      .update({
        current_amount: newAmount,
        is_completed: isCompleted,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating goal progress:", error as Error);
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
    logger.error("Error in goals/update-progress route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
