"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function WelcomeCard() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Tentar obter o nome do perfil do usuário
          const { data: profile } = await supabase.from("user_profiles").select("full_name").eq("id", user.id).single()

          if (profile?.full_name) {
            setUserName(profile.full_name)
          } else if (user.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name)
          } else {
            setUserName("usuário")
          }
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [supabase])

  const handleAddTransaction = () => {
    router.push("/dashboard/transactions")
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-none shadow-md">
        <CardContent className="p-6">
          <div className="h-24 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full lg:col-span-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-none shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {userName}!
            </h2>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel financeiro. Acompanhe suas finanças, estabeleça metas e tome decisões financeiras
              inteligentes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAddTransaction} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Transação
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/goals")} className="whitespace-nowrap">
              Criar Meta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
