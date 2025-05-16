import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    // Se não houver código, redirecione para a página de login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Troque o código por uma sessão e aguarde a conclusão
    await supabase.auth.exchangeCodeForSession(code)

    // Verifique se a sessão foi criada com sucesso
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("Falha ao criar sessão")
    }

    // Redirecione para o dashboard após o login bem-sucedido
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Erro no callback:", error)
    // Em caso de erro, redirecione para a página de login com uma mensagem de erro
    return NextResponse.redirect(new URL("/login?error=Falha+na+autenticação", request.url))
  }
}
