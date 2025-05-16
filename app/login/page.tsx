"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

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
    } catch (error) {
      console.error("Error logging in:", error)
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
          <Button className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Entrar com Google"}
          </Button>
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
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
