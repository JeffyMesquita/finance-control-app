"use client";

import { logger } from "@/lib/utils/logger";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  TrendingUp,
  Award,
  Calendar,
  Mail,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Target,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { getReferralsData } from "@/app/actions/admin";

export default function AdminReferralsPage() {
  useAdminGuard();

  const [loading, setLoading] = useState(true);
  const [referralsData, setReferralsData] = useState<any>(null);

  const loadReferralsData = async () => {
    try {
      setLoading(true);
      const result = await getReferralsData();
      if (result.success && result.data) {
        setReferralsData(result.data);
      } else {
        toast.error("Erro ao carregar dados de referências");
      }
    } catch (error) {
      logger.error("Error loading referrals:", error as Error);
      toast.error("Erro ao carregar dados de referências");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferralsData();
  }, []);

  const getBadgeInfo = (count: number) => {
    if (count >= 10)
      return {
        level: "Ouro",
        emoji: "🥇",
        color: "text-yellow-600",
        bg: "bg-yellow-100 dark:bg-yellow-900",
      };
    if (count >= 5)
      return {
        level: "Prata",
        emoji: "🥈",
        color: "text-gray-600",
        bg: "bg-gray-100 dark:bg-gray-900",
      };
    if (count >= 2)
      return {
        level: "Bronze",
        emoji: "🥉",
        color: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-900",
      };
    return {
      level: "Iniciante",
      emoji: "⭐",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900",
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div>
            <h1 className="text-3xl font-bold">Sistema de Referências</h1>
            <p className="text-muted-foreground">
              Carregando dados reais do sistema...
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!referralsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Erro ao carregar dados de referências
        </p>
        <Button onClick={loadReferralsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Referências</h1>
          <p className="text-muted-foreground">
            Análise do sistema de convites e gamificação
          </p>
        </div>
        <Button onClick={loadReferralsData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Convites
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralsData.stats.totalInvites}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os convites enviados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {referralsData.stats.successfulReferrals}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários que se cadastraram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {referralsData.stats.conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Eficiência dos convites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {referralsData.stats.pendingInvites}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando cadastro</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Referenciadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Top Referenciadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referralsData.topReferrers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum referenciador encontrado
              </p>
            ) : (
              <div className="space-y-4">
                {referralsData.topReferrers.map(
                  (referrer: any, index: number) => {
                    const badge = getBadgeInfo(referrer.count);
                    return (
                      <div
                        key={referrer.referrer_id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{badge.emoji}</div>
                          <div>
                            <p className="font-medium">
                              {referrer.name || `Usuario ${index + 1}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {referrer.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={`${badge.bg} ${badge.color} border-0`}
                          >
                            {badge.level}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {referrer.count} convites
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sistema de Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Sistema de Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🥇</div>
                <p className="font-medium">Ouro</p>
                <p className="text-xs text-muted-foreground mb-2">
                  10+ convites
                </p>
                <p className="text-lg font-bold text-yellow-600">
                  {referralsData.badges.gold}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🥈</div>
                <p className="font-medium">Prata</p>
                <p className="text-xs text-muted-foreground mb-2">
                  5-9 convites
                </p>
                <p className="text-lg font-bold text-gray-600">
                  {referralsData.badges.silver}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🥉</div>
                <p className="font-medium">Bronze</p>
                <p className="text-xs text-muted-foreground mb-2">
                  2-4 convites
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {referralsData.badges.bronze}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">⭐</div>
                <p className="font-medium">Iniciante</p>
                <p className="text-xs text-muted-foreground mb-2">1 convite</p>
                <p className="text-lg font-bold text-blue-600">
                  {referralsData.badges.starter}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Timeline de Atividades (Últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referralsData.timeline.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma atividade nos últimos 7 dias
            </p>
          ) : (
            <div className="space-y-3">
              {referralsData.timeline.map((day: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-muted-foreground w-20 inline-block">
                      {day.date}
                    </span>
                  </div>
                  <div className="flex-grow flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        {day.invites} convites enviados
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">
                        {day.conversions} conversões
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta de Status */}
      <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
        <p className="text-sm text-green-800 dark:text-green-200">
          ✅ Sistema de referências ativo! Dados em tempo real da tabela
          `user_invites`.
        </p>
      </div>
    </div>
  );
}
