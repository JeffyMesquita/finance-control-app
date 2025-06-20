"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Target,
  PiggyBank,
  MessageSquare,
  UserPlus,
  Activity,
  DollarSign,
} from "lucide-react";
import { AdminStats } from "@/app/actions/admin";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Usuários */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Total</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users.total}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span>+{stats.users.newThisMonth} este mês</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Esta semana: {stats.users.newThisWeek}</span>
              <span>Ativos: {stats.users.activeThisMonth}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transações</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.transactions.total}</div>
          <div className="text-xs text-muted-foreground">
            Volume total: {formatCurrency(stats.transactions.totalAmount)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-600">
                ↗ {stats.transactions.byType.income.count} receitas
              </span>
              <span className="text-red-600">
                ↙ {stats.transactions.byType.expense.count} despesas
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Este mês: {stats.transactions.thisMonth} (
              {formatCurrency(stats.transactions.thisMonthAmount)})
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metas Financeiras */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Metas Financeiras
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.goals.total}</div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progresso médio</span>
              <span>{formatPercentage(stats.goals.averageProgress)}</span>
            </div>
            <Progress value={stats.goals.averageProgress} className="h-2" />
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <Badge variant="outline" className="text-green-600">
              ✓ {stats.goals.completed} concluídas
            </Badge>
            <Badge variant="outline">⏳ {stats.goals.inProgress} ativas</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cofrinhos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cofrinhos</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.savingsBoxes.total}</div>
          <div className="text-xs text-muted-foreground">
            Total poupado: {formatCurrency(stats.savingsBoxes.totalSaved)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Ativos: {stats.savingsBoxes.activeBoxes}</span>
              <span>
                Média: {formatCurrency(stats.savingsBoxes.averageAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Feedbacks</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.feedbacks.total}</div>
          <div className="text-xs text-muted-foreground">
            +{stats.feedbacks.thisMonth} este mês
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(stats.feedbacks.byStatus).map(([status, count]) => (
              <Badge key={status} variant="outline" className="text-xs">
                {status}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Referência */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referências</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.referrals.totalInvites}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.referrals.successfulReferrals} conversões
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Taxa de conversão</span>
              <span>{formatPercentage(stats.referrals.conversionRate)}</span>
            </div>
            <Progress value={stats.referrals.conversionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Receitas vs Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Balanço Financeiro
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Receitas</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(stats.transactions.byType.income.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Despesas</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(stats.transactions.byType.expense.amount)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Saldo</span>
                <span className="font-bold">
                  {formatCurrency(
                    stats.transactions.byType.income.amount -
                      stats.transactions.byType.expense.amount
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Utilização */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Análise de Uso</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Usuários ativos</span>
              <span className="font-semibold">
                {formatPercentage(
                  (stats.users.activeThisMonth / stats.users.total) * 100
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Metas c/ cofrinho</span>
              <span className="font-semibold">Em breve</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Feedback rate</span>
              <span className="font-semibold">
                {formatPercentage(
                  (stats.feedbacks.total / stats.users.total) * 100
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
