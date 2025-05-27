import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 5; // 5 tentativas por IP por minuto
const rateLimitMap = new Map<string, { count: number; last: number }>();

async function validateRecaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return false;
  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
    { method: "POST" }
  );
  const data = await res.json();
  return data.success;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const rl = rateLimitMap.get(ip) || { count: 0, last: now };
    if (now - rl.last > RATE_LIMIT_WINDOW) {
      rl.count = 0;
      rl.last = now;
    }
    rl.count++;
    rateLimitMap.set(ip, rl);
    if (rl.count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 1 minuto." },
        { status: 429 }
      );
    }

    const { email, password, recaptchaToken, isRegister } = await req.json();
    if (!email || !password || !recaptchaToken) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    // Validação do reCAPTCHA
    const isHuman = await validateRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "Falha na verificação do reCAPTCHA." },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    let result;
    if (isRegister) {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/auth/callback`,
        },
      });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno." },
      { status: 500 }
    );
  }
}
