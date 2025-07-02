import { NextRequest, NextResponse } from "next/server";
import {
  deleteTransaction,
  deleteTransactions,
} from "@/app/actions/transactions";

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data || (!data.id && !data.ids)) {
      return NextResponse.json(
        { error: "ID(s) obrigatório(s) para exclusão" },
        { status: 400 }
      );
    }
    let result;
    if (data.id) {
      result = await deleteTransaction(data.id);
    } else if (data.ids) {
      result = await deleteTransactions(data.ids);
    }
    if (!result) {
      return NextResponse.json(
        { error: "Erro interno: resultado indefinido" },
        { status: 500 }
      );
    }
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
      { error: "Erro ao deletar transação(ões)" },
      { status: 500 }
    );
  }
}
