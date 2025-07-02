import { NextRequest, NextResponse } from "next/server";
import { getSavingsBoxesTotal } from "@/app/actions/savings-boxes";

export async function GET(req: NextRequest) {
  try {
    const result = await getSavingsBoxesTotal();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar total dos cofrinhos" },
      { status: 500 }
    );
  }
}
