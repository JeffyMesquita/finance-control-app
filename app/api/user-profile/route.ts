import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { UserProfile } from "@/lib/types";

export async function GET() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Error fetching user profile:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile as UserProfile | null,
    });
  } catch (error) {
    logger.error("Error in user profile route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profileData: UserProfile = await request.json();
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ensure the profile belongs to the authenticated user
    profileData.id = user.id;

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(profileData, {
        onConflict: "id",
      })
      .select()
      .single();

    if (error) {
      logger.error("Error updating user profile:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as UserProfile,
    });
  } catch (error) {
    logger.error("Error in user profile update route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
