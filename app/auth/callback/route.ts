import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // Se houver um erro no callback, redirecione para a página de login com o erro
  if (error) {
    console.error("Auth error:", error, error_description);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error_description || "Falha na autenticação"
        )}`,
        request.url
      )
    );
  }

  // Se não houver código, redirecione para a página de login
  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Troque o código por uma sessão
    await supabase.auth.exchangeCodeForSession(code);

    // Verificar se a sessão foi criada com sucesso
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Falha ao criar sessão");
    }

    // Verificar se o usuário existe na tabela public.users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // Se o usuário não existir na tabela public.users, insira-o manualmente
    if (userError && userError.code === "PGRST116") {
      // Usuário não encontrado, inserir manualmente
      await supabase.from("users").upsert({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || null,
        avatar_url: session.user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("pixAlertDismissed", "false");
    }
    // Redirecione para o dashboard após o login bem-sucedido
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=Falha+ao+processar+autenticação", request.url)
    );
  }
}
