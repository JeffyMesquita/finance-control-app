"use client"

import { motion } from "framer-motion"
import { ArrowRight, PlusCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"

export function WelcomeCard() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userName, setUserName] = useState("")

  // Obter a hora do dia para personalizar a saudação
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <motion.div
      className="col-span-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">
            {getGreeting()}
            {userName ? `, ${userName}` : ""}!
          </CardTitle>
          <CardDescription>
            Bem-vindo ao seu painel financeiro. Comece a acompanhar suas finanças agora mesmo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Registre suas transações, defina metas e acompanhe seu progresso financeiro em um só lugar.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard/transactions")}>
            Ver Transações
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </CardFooter>
      </Card>

      <AddTransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => router.push("/dashboard/transactions")}
      />
    </motion.div>
  )
}
