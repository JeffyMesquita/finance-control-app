"use client";

import { logger } from "@/lib/utils/logger";

import { useEffect, useState } from "react";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminStats, AdminStats } from "@/app/actions/admin";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefreshToast = false) => {
    try {
      setRefreshing(true);

      const statsResult = await getAdminStats();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
        if (showRefreshToast) {
          toast.success("Dados atualizados com sucesso!");
        }
      } else {
        toast.error("Erro ao carregar estatísticas");
      }
    } catch (error) {
      logger.error("Erro ao carregar dados:", error as Error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            Carregando dashboard administrativo...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar as estatísticas do dashboard.
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground">
            Visão geral das métricas e atividades do sistema
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} />

      {/* Quick Actions & System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/dashboard/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Usuários
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </Link>

              <Link href="/dashboard/admin/feedbacks">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ver Feedbacks
                  {stats.feedbacks.byStatus?.OPEN > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {stats.feedbacks.byStatus.OPEN} novos
                    </Badge>
                  )}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>

              <Link href="/dashboard/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Analytics
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Usuários ativos este mês
                </span>
                <span className="font-medium">
                  {stats.users.activeThisMonth}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Novos feedbacks</span>
                <span className="font-medium">{stats.feedbacks.thisMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de conversão</span>
                <span className="font-medium">
                  {stats.referrals.conversionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Banco de Dados</p>
                  <p className="text-xs text-muted-foreground">Operacional</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Sistema de Feedback</p>
                  <p className="text-xs text-muted-foreground">Funcionando</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">
                    Dados simulados
                  </p>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Resumo Rápido</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• {stats.users.total} usuários registrados</p>
                  <p>
                    • R${" "}
                    {stats.transactions.totalAmount.toLocaleString("pt-BR")} em
                    transações
                  </p>
                  <p>
                    • {stats.goals.averageProgress}% progresso médio das metas
                  </p>
                  <p>
                    • R$ {stats.savingsBoxes.totalSaved.toLocaleString("pt-BR")}{" "}
                    poupados
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2 text-green-600">
                📈 Crescimento
              </h3>
              <div className="space-y-1 text-sm">
                <p>+{stats.users.newThisMonth} usuários este mês</p>
                <p>+{stats.users.newThisWeek} usuários esta semana</p>
                <p>{stats.transactions.thisMonth} transações este mês</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-blue-600">
                👥 Engajamento
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  {(
                    (stats.users.activeThisMonth / stats.users.total) *
                    100
                  ).toFixed(1)}
                  % usuários ativos
                </p>
                <p>{stats.feedbacks.total} feedbacks enviados</p>
                <p>{stats.goals.completed} metas concluídas</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-purple-600">
                💰 Financeiro
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  R${" "}
                  {(
                    stats.transactions.byType.income.amount -
                    stats.transactions.byType.expense.amount
                  ).toLocaleString("pt-BR")}{" "}
                  saldo líquido
                </p>
                <p>{stats.savingsBoxes.activeBoxes} cofrinhos ativos</p>
                <p>
                  R$ {stats.savingsBoxes.averageAmount.toLocaleString("pt-BR")}{" "}
                  média por cofrinho
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
