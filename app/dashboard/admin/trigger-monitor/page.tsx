"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { monitorUserInsertion } from "@/lib/utils/trigger-monitor";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function TriggerMonitorPage() {
  useProtectedRoute();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchAuthUsers();
  }, []);

  // Buscar usuários da tabela auth.users (apenas para administradores)
  const fetchAuthUsers = async () => {
    setIsLoading(true);
    try {
      // Na prática, você precisaria de uma função serverless ou API para isso
      // pois usuários comuns não têm acesso à tabela auth.users

      // Simulação: buscar o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const result = await monitorUserInsertion(user.id);
        setUsers(result.data ? [result.data] : []);
      }

      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar usuários:", err);
      setError(err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Monitor de Trigger de Usuários
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status do Trigger</CardTitle>
          <CardDescription>
            Verifique se o trigger está funcionando corretamente para todos os
            usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="rounded-md border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">{user.email || user.id}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID: </span>
                      <span className="font-mono">{user.id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Criado em: </span>
                      <span>{new Date(user.created_at).toLocaleString()}</span>
                    </div>
                    {user.full_name && (
                      <div>
                        <span className="text-muted-foreground">Nome: </span>
                        <span>{user.full_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Nenhum usuário encontrado ou trigger não funcionou
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={fetchAuthUsers}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Atualizando..." : "Atualizar"}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Solução de Problemas</h2>
        <div className="space-y-2">
          <h3 className="font-medium">Se o trigger não estiver funcionando:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Verifique se a função <code>handle_new_user</code> foi criada
              corretamente
            </li>
            <li>
              Verifique se o trigger <code>on_auth_user_created</code> foi
              criado corretamente
            </li>
            <li>
              Verifique se a tabela <code>users</code> existe e tem a estrutura
              correta
            </li>
            <li>
              Verifique os logs do Supabase para erros relacionados ao trigger
            </li>
            <li>Tente criar um novo usuário para testar o trigger</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
