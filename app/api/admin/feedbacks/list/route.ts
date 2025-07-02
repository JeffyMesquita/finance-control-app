import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    // Usar temporariamente o server action até migrar completamente
    const { getAdminFeedbacks } = await import("@/app/actions/admin");
    const result = await getAdminFeedbacks(filters);

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
    logger.error("Error in admin feedbacks route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
