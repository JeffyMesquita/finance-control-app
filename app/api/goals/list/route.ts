import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { GoalData } from "@/lib/types/actions";

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

    const { data, error } = await supabase
      .from("financial_goals")
      .select(
        `
        *,
        category:categories(*),
        account:financial_accounts(*),
        savings_box:savings_boxes(
          id,
          name,
          color,
          current_amount
        )
      `
      )
      .eq("user_id", user.id)
      .order("target_date", { ascending: true });

    if (error) {
      logger.error("Error fetching goals:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as GoalData[],
    });
  } catch (error) {
    logger.error("Error in goals/list route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
