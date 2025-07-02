import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { GoalData, CreateGoalData } from "@/lib/types/actions";

export async function POST(request: NextRequest) {
  try {
    const goal: CreateGoalData = await request.json();

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

    // Converter valores de reais para centavos
    const goalData = {
      ...goal,
      target_amount: Math.round(goal.target_amount * 100),
      current_amount: goal.current_amount
        ? Math.round(goal.current_amount * 100)
        : 0,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("financial_goals")
      .insert(goalData)
      .select()
      .single();

    if (error) {
      logger.error("Error creating goal:", error as Error);
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
    logger.error("Error in goals/create route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
