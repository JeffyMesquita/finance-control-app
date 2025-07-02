import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    // Usar temporariamente o server action até migrar completamente
    const { getReferralsData } = await import("@/app/actions/admin");
    const result = await getReferralsData();

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
    logger.error("Error in admin referrals route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
