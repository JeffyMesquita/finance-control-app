"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminUsers } from "@/app/actions/admin";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  PiggyBank,
  MessageSquare,
  Loader2,
  Calendar,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // Menos usuarios por pagina para melhor visualizacao

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getAdminUsers(currentPage, pageSize);
      if (result.success && result.data) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      toast.error("Erro ao carregar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Carregando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestao de Usuarios</h1>
          <p className="text-muted-foreground">
            Lista e gerenciamento de todos os usuarios do sistema
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Resumo */}
      {pagination && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Total de Usuarios</h3>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                  {Math.min(currentPage * pageSize, pagination.total)} de{" "}
                  {pagination.total} usuarios
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles de Paginacao */}
      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-2 sm:gap-0">
          <div className="flex-1 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
            {Math.min(currentPage * pageSize, pagination.total)} de{" "}
            {pagination.total} usuarios
          </div>
          <div className="flex items-center justify-between space-x-2 sm:space-x-6 lg:space-x-8 max-sm:w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium">
              Pagina {currentPage} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Usuarios */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum usuario encontrado
              </h3>
              <p className="text-muted-foreground">
                Nao ha usuarios cadastrados no sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header do Usuario */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {user.full_name || "Nome nao informado"}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Cadastrado em{" "}
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  {/* Estatisticas do Usuario */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Transacoes
                        </p>
                        <p className="font-semibold">
                          {user.stats?.transactionsCount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Volume Total
                        </p>
                        <p className="font-semibold">
                          R${" "}
                          {(
                            user.stats?.totalTransactionAmount || 0
                          ).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Target className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Metas</p>
                        <p className="font-semibold">
                          {user.stats?.completedGoals || 0}/
                          {user.stats?.goalsCount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <PiggyBank className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Poupado</p>
                        <p className="font-semibold">
                          R${" "}
                          {(user.stats?.totalSaved || 0).toLocaleString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Feedbacks
                        </p>
                        <p className="font-semibold">
                          {user.stats?.feedbacksCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges de Status */}
                  <div className="flex items-center gap-2">
                    {(user.stats?.transactionsCount || 0) > 10 && (
                      <Badge variant="outline" className="text-green-600">
                        Usuario Ativo
                      </Badge>
                    )}
                    {(user.stats?.completedGoals || 0) > 0 && (
                      <Badge variant="outline" className="text-purple-600">
                        Meta Concluida
                      </Badge>
                    )}
                    {(user.stats?.feedbacksCount || 0) > 0 && (
                      <Badge variant="outline" className="text-blue-600">
                        Enviou Feedback
                      </Badge>
                    )}
                    {(user.stats?.savingsBoxesCount || 0) > 0 && (
                      <Badge variant="outline" className="text-orange-600">
                        Usa Cofrinhos
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Controles de Paginacao Inferiores */}
      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-2 sm:gap-0">
          <div className="flex-1 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
            {Math.min(currentPage * pageSize, pagination.total)} de{" "}
            {pagination.total} usuarios
          </div>
          <div className="flex items-center justify-between space-x-2 sm:space-x-6 lg:space-x-8 max-sm:w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium">
              Pagina {currentPage} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
