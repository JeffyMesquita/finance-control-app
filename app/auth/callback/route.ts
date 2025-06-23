import { handleReferral } from "@/app/actions/referrals";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Código+de+autenticação+não+encontrado", request.url)
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange code for session
    const { error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      logger.error("Session error:", sessionError);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(sessionError.message)}`,
          request.url
        )
      );
    }

    // Verify session was created successfully
    const {
      data: { session },
      error: getSessionError,
    } = await supabase.auth.getSession();

    if (getSessionError || !session) {
      logger.error("Get session error:", getSessionError as Error);
      return NextResponse.redirect(
        new URL("/login?error=Falha+ao+obter+sessão", request.url)
      );
    }

    // Validate user data
    if (!session.user?.email) {
      return NextResponse.redirect(
        new URL("/login?error=Email+do+usuário+não+encontrado", request.url)
      );
    }

    // Check if user exists in public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // If user doesn't exist in public.users table, insert them
    if (userError && userError.code === "PGRST116") {
      const { error: insertError } = await supabase.from("users").upsert({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || null,
        avatar_url: session.user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        logger.error("Insert user error:", insertError);
        return NextResponse.redirect(
          new URL("/login?error=Falha+ao+criar+usuário", request.url)
        );
      }
    }

    // Referral processing will be handled on the client side after dashboard loads

    // Redirect to dashboard after successful login
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    logger.error("Callback error:", error as Error);
    return NextResponse.redirect(
      new URL("/login?error=Falha+ao+processar+autenticação", request.url)
    );
  }
}
