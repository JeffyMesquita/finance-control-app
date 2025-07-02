import { NextRequest, NextResponse } from "next/server";
import { getSavingsBoxesSummary } from "@/app/actions/savings-boxes";

export async function GET(req: NextRequest) {
  try {
    const result = await getSavingsBoxesSummary();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar resumo dos cofrinhos" },
      { status: 500 }
    );
  }
}
