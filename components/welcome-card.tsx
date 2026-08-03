"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUserProfileQuery } from "@/useCases/useUserProfileQuery";
import { AddTransactionDialog } from "./add-transaction-dialog";

const SESSION_KEY = "welcomeCardDismissed";

export function WelcomeCard() {
  const { user, loading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfileQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, _setExiting] = useState(false);

  const router = useRouter();

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(SESSION_KEY, "true");
  };

  useEffect(() => {
    const isDismissed = localStorage.getItem(SESSION_KEY) === "true";
    setVisible(!isDismissed);
  }, []);

  const handleAddTransaction = () => {
    router.push("/dashboard/transactions");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Não renderiza se não está visível, se não tem usuário ou está carregando
  if (!visible || !user || profileLoading || userLoading) {
    return null;
  }

  const userName = profile?.full_name || user.user_metadata?.full_name || "usuário";

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="w-full max-w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 w-full relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 text-muted-foreground hover:bg-muted"
              onClick={handleClose}
              aria-label="Fechar card de boas-vindas"
            >
              <X className="w-4 h-4" />
            </Button>
            <CardHeader className="pr-12">
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
                Registre suas transações, defina metas e acompanhe seu progresso financeiro em um só
                lugar.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 justify-between md:flex-row">
              <Button variant="outline" onClick={handleAddTransaction} className="w-full md:w-auto">
                Ver Transações
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
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
      )}
    </AnimatePresence>
  );
}
