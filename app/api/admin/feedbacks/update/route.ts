import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export async function PUT(request: NextRequest) {
  try {
    const { feedbackId, updates } = await request.json();

    // Usar temporariamente o server action até migrar completamente
    const { updateFeedbackStatus } = await import("@/app/actions/admin");
    const result = await updateFeedbackStatus(feedbackId, updates);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "error" in result ? result.error : "Unknown error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: "data" in result ? result.data : null,
    });
  } catch (error) {
    logger.error("Error in update feedback route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
