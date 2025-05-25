"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { HeroVisual } from "@/components/hero-visual";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  // Verificar se há um erro na URL
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        if (typeof window !== "undefined") {
          localStorage.setItem("pixAlertDismissed", "false");
        }
        router.push("/dashboard");
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }

      // O redirecionamento será tratado pelo Supabase
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setError("Falha ao fazer login com Google. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("pixAlertDismissed", "false");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-1 sm:px-4 py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-5xl shadow-lg flex flex-col md:flex-row items-center px-10 overflow-hidden">
        <div className="ml-[20%] md:ml-0 w-full flex justify-center mt-6 mb-2 ">
          <HeroVisual className="max-w-xs sm:max-w-sm md:max-w-md" />
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Logo dark className="h-14 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Bem-vindo ao FinanceTrack
            </CardTitle>
            <CardDescription>Entre na sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>{isLoading ? "Entrando..." : "Entrar com Google"}</span>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Ao continuar, você concorda com nossos{" "}
              <Link
                href="/termos-de-servico"
                className="underline underline-offset-4 hover:text-primary"
              >
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link
                href="/politica-de-privacidade"
                className="underline underline-offset-4 hover:text-primary"
              >
                Política de Privacidade
              </Link>
              .
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
