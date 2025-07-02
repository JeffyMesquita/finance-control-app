"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
// Hook TanStack Query
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAdminUsersQuery } from "@/useCases/admin/useAdminUsersQuery";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  Mail,
  MessageSquare,
  PiggyBank,
  RefreshCw,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Menos usuarios por pagina para melhor visualizacao

  // Hook TanStack Query
  const {
    data,
    isLoading: loading,
    refetch,
  } = useAdminUsersQuery(currentPage, pageSize);

  const users = data?.users || [];
  const pagination = data?.pagination;

  // Função para obter badge de categoria
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "EXPERT":
        return (
          <Badge className="bg-purple-600 text-white">
            <Star className="h-3 w-3 mr-1" />
            Expert
          </Badge>
        );
      case "AVANCADO":
        return (
          <Badge className="bg-blue-600 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Avançado
          </Badge>
        );
      case "ATIVO":
        return (
          <Badge className="bg-green-600 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case "NOVO":
        return (
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            Novo
          </Badge>
        );
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  // Função para obter badge de atividade
  const getActivityBadge = (days: number) => {
    if (days === 0)
      return <Badge className="bg-green-400 text-white">Ativo Hoje</Badge>;
    if (days <= 7)
      return <Badge className="bg-green-600 text-white">Ativo Semana</Badge>;
    if (days <= 30)
      return <Badge className="bg-yellow-600 text-white">Ativo</Badge>;
    if (days <= 90)
      return (
        <Badge variant="outline" className="text-orange-600">
          Inativo
        </Badge>
      );
    return <Badge variant="destructive">Abandonou</Badge>;
  };

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
            Analise detalhada do comportamento e performance dos usuarios
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
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
      <div className="space-y-6">
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
          users.map((user: any) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header do Usuario */}
                <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {user.full_name || "Nome nao informado"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          Cadastrado em{" "}
                          {new Date(user.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                          <span className="text-xs">
                            ({user.stats?.accountAge || 0} dias atrás)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getCategoryBadge(user.stats?.userCategory)}
                      {getActivityBadge(
                        user.stats?.daysSinceLastActivity ?? 999
                      )}
                    </div>
                  </div>

                  {/* Badges Principais */}
                  <div className="flex flex-wrap gap-2">
                    {(user.stats?.transactionsCount || 0) > 0 && (
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-200"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        {user.stats.transactionsCount} Transações
                      </Badge>
                    )}
                    {(user.stats?.completedGoals || 0) > 0 && (
                      <Badge
                        variant="outline"
                        className="text-purple-600 border-purple-200"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        {user.stats.completedGoals} Metas Concluídas
                      </Badge>
                    )}
                    {(user.stats?.activeSavingsBoxes || 0) > 0 && (
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                      >
                        <PiggyBank className="h-3 w-3 mr-1" />
                        {user.stats.activeSavingsBoxes} Cofrinhos Ativos
                      </Badge>
                    )}
                    {(user.stats?.feedbacksCount || 0) > 0 && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {user.stats.feedbacksCount} Feedbacks
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Seção: Movimentação Financeira */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-semibold">
                        Movimentação Financeira
                      </h4>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {/* 1. Receitas */}
                      <Card className="border-green-500 dark:bg-green-200/10 bg-green-300/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <ArrowUpCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Receitas
                              </span>
                            </div>
                            <Badge className="bg-green-600 text-white text-xs">
                              {user.stats?.income?.count || 0}x
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-green-700">
                            R${" "}
                            {(user.stats?.income?.total || 0).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                          <div className="text-xs text-green-600 mt-1">
                            <span>
                              Este mês: R${" "}
                              {(
                                user.stats?.income?.thisMonth || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <br />
                            <span>
                              Média: R${" "}
                              {(
                                user.stats?.income?.average || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 2. Despesas Passadas */}
                      <Card className="border-red-500 dark:bg-red-200/10 bg-red-300/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <ArrowDownCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">
                                Despesas Passadas
                              </span>
                            </div>
                            <Badge className="bg-red-600 text-white text-xs">
                              {user.stats?.expenses?.count || 0}x
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-red-700">
                            R${" "}
                            {(user.stats?.expenses?.total || 0).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                          <div className="text-xs text-red-600 mt-1">
                            <span>
                              Este mês: R${" "}
                              {(
                                user.stats?.expenses?.thisMonth || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <br />
                            <span>
                              Média: R${" "}
                              {(
                                user.stats?.expenses?.average || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 3. Saldo Líquido Real */}
                      <Card
                        className={`border-2 ${
                          (user.stats?.netBalance || 0) >= 0
                            ? "border-blue-500 dark:bg-blue-200/10 bg-blue-300/50"
                            : "border-orange-500 dark:bg-orange-200/10 bg-orange-300/50"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <DollarSign
                                className={`h-4 w-4 ${
                                  (user.stats?.netBalance || 0) >= 0
                                    ? "text-blue-600"
                                    : "text-orange-600"
                                }`}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  (user.stats?.netBalance || 0) >= 0
                                    ? "text-blue-800"
                                    : "text-orange-800"
                                }`}
                              >
                                Saldo Líquido Real
                              </span>
                            </div>
                            <Badge
                              className={`text-white text-xs ${
                                (user.stats?.netBalance || 0) >= 0
                                  ? "bg-blue-600"
                                  : "bg-orange-600"
                              }`}
                            >
                              {(user.stats?.netBalance || 0) >= 0
                                ? "Positivo"
                                : "Negativo"}
                            </Badge>
                          </div>
                          <p
                            className={`text-xl font-bold ${
                              (user.stats?.netBalance || 0) >= 0
                                ? "text-blue-700"
                                : "text-orange-700"
                            }`}
                          >
                            R${" "}
                            {(user.stats?.netBalance || 0).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                          <div
                            className={`text-xs mt-1 ${
                              (user.stats?.netBalance || 0) >= 0
                                ? "text-blue-600"
                                : "text-orange-600"
                            }`}
                          >
                            <span>Apenas transações passadas</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 4. Despesas Futuras */}
                      <Card className="border-purple-500 dark:bg-purple-200/10 bg-purple-300/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-800">
                                Despesas Futuras
                              </span>
                            </div>
                            <Badge className="bg-purple-600 text-white text-xs">
                              {user.stats?.futureExpenses?.count || 0}x
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-purple-700">
                            R${" "}
                            {(
                              user.stats?.futureExpenses?.total || 0
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <div className="text-xs text-purple-600 mt-1">
                            <span>
                              Este mês: R${" "}
                              {(
                                user.stats?.futureExpenses?.thisMonth || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <br />
                            <span>
                              Média: R${" "}
                              {(
                                user.stats?.futureExpenses?.average || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 5. Balanço Mensal */}
                      <Card
                        className={`border-2 ${
                          (user.stats?.thisMonthBalance || 0) >= 0
                            ? "border-cyan-500 dark:bg-cyan-200/10 bg-cyan-300/50"
                            : "border-yellow-500 dark:bg-yellow-200/10 bg-yellow-300/50"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp
                                className={`h-4 w-4 ${
                                  (user.stats?.thisMonthBalance || 0) >= 0
                                    ? "text-cyan-600"
                                    : "text-yellow-600"
                                }`}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  (user.stats?.thisMonthBalance || 0) >= 0
                                    ? "text-cyan-800"
                                    : "text-yellow-800"
                                }`}
                              >
                                Balanço Mensal
                              </span>
                            </div>
                            <Badge
                              className={`text-white text-xs ${
                                (user.stats?.thisMonthBalance || 0) >= 0
                                  ? "bg-cyan-600"
                                  : "bg-yellow-600"
                              }`}
                            >
                              {(user.stats?.thisMonthBalance || 0) >= 0
                                ? "Positivo"
                                : "Negativo"}
                            </Badge>
                          </div>
                          <p
                            className={`text-xl font-bold ${
                              (user.stats?.thisMonthBalance || 0) >= 0
                                ? "text-cyan-700"
                                : "text-yellow-700"
                            }`}
                          >
                            R${" "}
                            {(user.stats?.thisMonthBalance || 0).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                          <div
                            className={`text-xs mt-1 ${
                              (user.stats?.thisMonthBalance || 0) >= 0
                                ? "text-cyan-600"
                                : "text-yellow-600"
                            }`}
                          >
                            <span>Performance deste mês</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 6. Categoria Principal */}
                      <Card className="border-indigo-500 dark:bg-indigo-200/10 bg-indigo-300/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-indigo-600" />
                              <span className="text-sm font-medium text-indigo-800">
                                Categoria Principal
                              </span>
                            </div>
                            <Badge className="bg-indigo-600 text-white text-xs">
                              {user.stats?.mainCategory?.count || 0}x
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-indigo-700 truncate">
                            {user.stats?.mainCategory?.name || "Nenhuma"}
                          </p>
                          <div className="text-xs text-indigo-600 mt-1">
                            <span>
                              Total: R${" "}
                              {(
                                user.stats?.mainCategory?.total || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <br />
                            <span>Onde mais gasta dinheiro</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* Seção: Metas e Objetivos */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-purple-600" />
                      <h4 className="text-lg font-semibold">
                        Metas e Objetivos
                      </h4>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="border-purple-500 dark:bg-purple-200/10 bg-purple-300/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-purple-800">
                              Progresso das Metas
                            </span>
                            <Badge className="bg-purple-600 text-white text-xs">
                              {user.stats?.completedGoals || 0}/
                              {user.stats?.goalsCount || 0}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Progress
                              value={user.stats?.goalProgress || 0}
                              className="h-2"
                            />
                            <p className="text-sm text-purple-600">
                              {user.stats?.goalProgress || 0}% concluído
                            </p>
                          </div>
                          <div className="mt-3 text-xs text-purple-600">
                            <p>
                              Objetivo: R${" "}
                              {(
                                user.stats?.totalGoalTarget || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                            <p>
                              Atual: R${" "}
                              {(
                                user.stats?.totalGoalCurrent || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-orange-500 dark:bg-orange-200/10 bg-orange-300/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-orange-800">
                              Cofrinhos
                            </span>
                            <Badge className="bg-orange-600 text-white text-xs">
                              {user.stats?.activeSavingsBoxes || 0}/
                              {user.stats?.savingsBoxesCount || 0}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-orange-700">
                            R${" "}
                            {(user.stats?.totalSaved || 0).toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </p>
                          <div className="text-xs text-orange-600 mt-1">
                            <p>
                              Meta Total: R${" "}
                              {(
                                user.stats?.totalSavingsTarget || 0
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                            <p>
                              Cofrinhos Ativos:{" "}
                              {user.stats?.activeSavingsBoxes || 0}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* Seção: Atividade e Engajamento */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <h4 className="text-lg font-semibold">
                        Atividade e Engajamento
                      </h4>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <Card className="border-blue-500 dark:bg-blue-200/10 bg-blue-300/50">
                        <CardContent className="p-4 text-center">
                          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {user.stats?.daysSinceLastActivity ?? 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dias desde última atividade
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-green-500 dark:bg-green-200/10 bg-green-300/50">
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {user.stats?.recentActivityCount || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Transações (30 dias)
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-500 dark:bg-blue-200/10 bg-blue-300/50">
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {user.stats?.feedbacksCount || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Feedbacks enviados
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-500 dark:bg-purple-200/10 bg-purple-300/50">
                        <CardContent className="p-4 text-center">
                          <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {user.stats?.accountAge || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dias de conta
                          </p>
                        </CardContent>
                      </Card>
                    </div>
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
