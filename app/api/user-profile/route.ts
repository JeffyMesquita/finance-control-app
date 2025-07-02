import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/app/actions/profile";

export async function GET(req: NextRequest) {
  try {
    const result = await getUserProfile();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar perfil do usuário" },
      { status: 500 }
    );
  }
}
