"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Verificar se há um erro na URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
      }
    }

    checkSession()
  }, [router, supabase.auth])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      // O redirecionamento será tratado pelo Supabase
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      setError("Falha ao fazer login com Google. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <DollarSign className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao FinanceTrack</CardTitle>
          <CardDescription>Entre na sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Entrar com Google"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Política de Privacidade
            </Link>
            .
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
