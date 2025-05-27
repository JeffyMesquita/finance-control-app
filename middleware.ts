import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Verificar se há uma sessão válida
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // URL atual e URL de destino
  const currentPath = req.nextUrl.pathname;
  const url = new URL(req.url);
  const refId = url.searchParams.get("ref");

  // Ignorar a rota de callback para evitar loops de redirecionamento
  if (currentPath.startsWith("/auth/callback")) {
    return res;
  }

  // Se tiver um ref na URL, não redireciona
  if (refId) {
    return res;
  }

  // Se o usuário não estiver autenticado e estiver tentando acessar uma rota protegida
  if (!session && currentPath.startsWith("/dashboard")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", currentPath);
    return NextResponse.redirect(redirectUrl);
  }

  // Se o usuário estiver autenticado e estiver tentando acessar a página de login ou a raiz
  if (session && (currentPath === "/login" || currentPath === "/")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Especifique quais caminhos devem invocar este middleware
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/auth/callback"],
};
