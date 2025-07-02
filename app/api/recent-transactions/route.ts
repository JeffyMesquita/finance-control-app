import { NextRequest, NextResponse } from "next/server";
import { getRecentTransactions } from "@/app/actions/transactions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "7", 10);
    const result = await getRecentTransactions(limit);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar transações recentes" },
      { status: 500 }
    );
  }
}
