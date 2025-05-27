export function middleware() {
  // Middleware vazio: autenticação agora é client-side
  return;
}

// Especifique quais caminhos devem invocar este middleware
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/auth/callback"],
};
