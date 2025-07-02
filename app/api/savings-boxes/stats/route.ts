import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

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

    const { data: boxes, error } = await supabase
      .from("savings_boxes")
      .select(
        `
        id,
        current_amount,
        target_amount,
        financial_goals!savings_box_id(id)
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) {
      logger.error("Error fetching savings boxes stats:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const totalBoxes = boxes.length;
    const totalAmount = boxes.reduce(
      (sum, box) => sum + (box.current_amount || 0),
      0
    );
    const totalWithGoals = boxes.filter(
      (box) => box.financial_goals && box.financial_goals.length > 0
    ).length;
    const completedGoals = boxes.filter(
      (box) =>
        box.target_amount && (box.current_amount || 0) >= box.target_amount
    ).length;

    const boxesWithTargets = boxes.filter((box) => box.target_amount);
    const averageCompletion =
      boxesWithTargets.length > 0
        ? boxesWithTargets.reduce((sum, box) => {
            const completion = box.target_amount
              ? Math.min(
                  ((box.current_amount || 0) / box.target_amount) * 100,
                  100
                )
              : 0;
            return sum + completion;
          }, 0) / boxesWithTargets.length
        : 0;

    const stats = {
      total_boxes: totalBoxes,
      total_amount: totalAmount,
      total_with_goals: totalWithGoals,
      completed_goals: completedGoals,
      average_completion: Math.round(averageCompletion),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error in savings-boxes/stats route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
