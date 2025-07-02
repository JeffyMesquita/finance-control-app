import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/app/actions/transactions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const month = searchParams.get("month") || undefined;
  const type = searchParams.get("type") || undefined;
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  const result = await getTransactions(
    page,
    pageSize,
    month,
    type,
    category,
    search
  );
  if (!result.success && result.error?.toLowerCase().includes("unauthorized")) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}
