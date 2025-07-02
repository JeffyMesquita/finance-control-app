import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { CategoryData, CreateCategoryData } from "@/lib/types/actions";

export async function POST(request: NextRequest) {
  try {
    const category: CreateCategoryData = await request.json();

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
      .from("categories")
      .insert({
        ...category,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating category:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as CategoryData,
    });
  } catch (error) {
    logger.error("Error in categories/create route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
