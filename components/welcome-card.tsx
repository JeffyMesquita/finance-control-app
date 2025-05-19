import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus } from "lucide-react"

interface WelcomeCardProps {
  userName: string
}

export function WelcomeCard({ userName }: WelcomeCardProps) {
  const firstName = userName?.split(" ")[0] || "Usuário"

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Bem-vindo(a), {firstName}!</CardTitle>
        <CardDescription>
          Acompanhe suas finanças, gerencie despesas e alcance seus objetivos financeiros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/transactions">
            <Button variant="outline" className="w-full sm:w-auto">
              Ver transações
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/transactions?new=true">
            <Button className="w-full sm:w-auto">
              Nova Transação
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
