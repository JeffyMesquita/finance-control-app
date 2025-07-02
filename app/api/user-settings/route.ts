import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { UserSettings } from "@/lib/types";

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

    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Error fetching user settings:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Se não há configurações, retorna padrões
    const defaultSettings: UserSettings = {
      id: user.id,
      default_currency: "BRL",
      date_format: "DD/MM/YYYY",
      budget_alerts: true,
      due_date_alerts: true,
      email_notifications: true,
      app_notifications: true,
      language: "pt-BR",
      theme: "system",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: (settings || defaultSettings) as UserSettings,
    });
  } catch (error) {
    logger.error("Error in user settings route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settingsData: UserSettings = await request.json();
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

    // Ensure the settings belong to the authenticated user
    settingsData.id = user.id;
    settingsData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(settingsData, {
        onConflict: "id",
      })
      .select()
      .single();

    if (error) {
      logger.error("Error updating user settings:", error as Error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as UserSettings,
    });
  } catch (error) {
    logger.error("Error in user settings update route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
