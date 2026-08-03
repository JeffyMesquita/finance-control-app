import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createActionClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(data.user || null);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuário atual" },
      { status: 500 }
    );
  }
}
