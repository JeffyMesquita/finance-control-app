import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  // Se houver um erro no callback, redirecione para a página de login com o erro
  if (error) {
    console.error("Auth error:", error, error_description)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || "Falha na autenticação")}`, request.url),
    )
  }

  // Se não houver código, redirecione para a página de login
  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Troque o código por uma sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Exchange code error:", error)
      throw error
    }

    // Redirecione para o dashboard após o login bem-sucedido
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(new URL("/login?error=Falha+ao+processar+autenticação", request.url))
  }
}
