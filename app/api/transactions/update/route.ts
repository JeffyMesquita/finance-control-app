import { NextRequest, NextResponse } from "next/server";
import { updateTransaction } from "@/app/actions/transactions";

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data || !data.id) {
      return NextResponse.json(
        { error: "ID obrigatório para atualização" },
        { status: 400 }
      );
    }
    const { id, ...updateData } = data;
    const result = await updateTransaction(id, updateData);
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
      { error: "Erro ao atualizar transação" },
      { status: 500 }
    );
  }
}
