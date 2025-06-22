"use client";

import { logger } from "@/lib/utils/logger";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function TestTrigger() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Função para verificar se um usuário foi inserido na tabela users
  const checkUserInsertion = async () => {
    setIsLoading(true);
    try {
      // Obter o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Nenhum usuário autenticado encontrado",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o usuário existe na tabela users
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setResult(data);

      toast({
        title: "Sucesso",
        description: "Usuário encontrado na tabela users",
        variant: "success",
      });
    } catch (error: any) {
      logger.error("Erro ao verificar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao verificar usuário",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Testar Trigger de Usuário</CardTitle>
          <CardDescription>
            Verifique se o trigger está funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Clique no botão abaixo para verificar se seus dados de usuário foram
            inseridos corretamente na tabela users.
          </p>

          {result && (
            <div className="mt-4 rounded-md bg-muted p-4">
              <h3 className="mb-2 font-medium">Dados do usuário:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={checkUserInsertion}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Verificando..." : "Verificar Usuário"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
