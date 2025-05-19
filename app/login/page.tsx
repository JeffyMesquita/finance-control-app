"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          throw error
        }

        toast({
          title: "Verifique seu email",
          description: "Enviamos um link de confirmação para o seu email.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Erro de autenticação:", error)
      toast({
        title: "Erro de autenticação",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar para a página inicial
            </Link>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{isSignUp ? "Criar conta" : "Entrar"}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isSignUp
                ? "Crie sua conta para começar a gerenciar suas finanças"
                : "Entre com seu email e senha para acessar sua conta"}
            </p>
          </div>
          <div className="mt-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="seu@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processando..." : isSignUp ? "Criar conta" : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSignUp ? (
                <p>
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    Entrar
                  </button>
                </p>
              ) : (
                <p>
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="font-medium text-primary hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              )}
            </div>
            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              Ao continuar, você concorda com nossos{" "}
              <Link href="/termos-de-servico" className="underline">
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link href="/politica-de-privacidade" className="underline">
                Política de Privacidade
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
