import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/app/actions/transactions";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }
    const result = await createTransaction(data);
    if (
      !result.success &&
      result.error?.toLowerCase().includes("unauthorized")
    ) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}
