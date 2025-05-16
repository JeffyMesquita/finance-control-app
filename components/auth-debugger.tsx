"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebugger() {
  const [session, setSession] = useState<any>(null)
  const [cookies, setCookies] = useState<string[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      // Listar cookies (apenas nomes por segurança)
      setCookies(document.cookie.split(";").map((c) => c.trim().split("=")[0]))
    }

    checkAuth()
  }, [supabase.auth])

  const handleRefresh = async () => {
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Depurador de Autenticação</CardTitle>
        <CardDescription>Informações sobre o estado atual da autenticação</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Status da Sessão:</h3>
          <div className="p-2 bg-muted rounded-md">
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {session ? "Autenticado ✅" : "Não Autenticado ❌"}
            </pre>
          </div>
        </div>

        {session && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Informações do Usuário:</h3>
            <div className="p-2 bg-muted rounded-md">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                Email: {session.user?.email}
                <br />
                ID: {session.user?.id}
                <br />
                Provedor: {session.user?.app_metadata?.provider || "N/A"}
              </pre>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Cookies Presentes:</h3>
          <div className="p-2 bg-muted rounded-md">
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {cookies.length > 0 ? cookies.join(", ") : "Nenhum cookie encontrado"}
            </pre>
          </div>
        </div>

        <Button onClick={handleRefresh} className="w-full">
          Atualizar Informações
        </Button>
      </CardContent>
    </Card>
  )
}
