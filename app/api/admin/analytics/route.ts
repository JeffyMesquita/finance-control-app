import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    // Usar temporariamente o server action até migrar completamente
    const { getUsageAnalytics } = await import("@/app/actions/admin");
    const result = await getUsageAnalytics();

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
    logger.error("Error in admin analytics route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
