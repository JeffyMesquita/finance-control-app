"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AddTransactionDialog } from "./add-transaction-dialog";

export function WelcomeCard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Tentar obter o nome do perfil do usuário
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (profile?.full_name) {
            setUserName(profile.full_name);
          } else if (user.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name);
          } else {
            setUserName("usuário");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [supabase]);

  const handleAddTransaction = () => {
    router.push("/dashboard/transactions");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-none shadow-md">
        <CardContent className="p-6">
          <div className="h-24 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
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
            Bem-vindo ao seu painel financeiro. Comece a acompanhar suas
            finanças agora mesmo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Registre suas transações, defina metas e acompanhe seu progresso
            financeiro em um só lugar.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/transactions")}
          >
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
  );
}
