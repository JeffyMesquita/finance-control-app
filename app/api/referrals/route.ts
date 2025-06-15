import { NextRequest, NextResponse } from "next/server";
import { handleReferral } from "@/app/actions/referrals";

export async function POST(req: NextRequest) {
  try {
    const { referralId } = await req.json();
    if (!referralId) {
      return NextResponse.json(
        { success: false, message: "referralId obrigatório" },
        { status: 400 }
      );
    }
    const result = await handleReferral(referralId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar referral",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
