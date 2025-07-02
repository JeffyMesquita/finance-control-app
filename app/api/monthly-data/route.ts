import { getMonthlyData } from "@/app/actions/dashboard";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const result = await getMonthlyData();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar dados mensais" },
      { status: 500 }
    );
  }
}
