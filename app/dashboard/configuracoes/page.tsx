"use client";

import { logger } from "@/lib/utils/logger";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Save,
  Bell,
  Moon,
  Sun,
  Globe,
  DollarSign,
} from "lucide-react";
import type { UserSettings } from "@/lib/types";
import { useProtectedRoute } from "@/hooks/use-protected-route";

// Hooks TanStack Query
import {
  useUserSettingsQuery,
  useUpdateUserSettingsMutation,
} from "@/useCases/useUserSettingsQuery";

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const user = useProtectedRoute();

  // Hooks TanStack Query
  const { data: settingsData, isLoading } = useUserSettingsQuery();
  const updateSettingsMutation = useUpdateUserSettingsMutation();

  // Sincronizar dados do hook com estado local
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  const handleSettingsUpdate = async () => {
    if (!settings) return;

    try {
      await updateSettingsMutation.mutateAsync(settings);
    } catch (error) {
      // Error handling is done in the mutation hook
      logger.error("Erro ao atualizar configurações:", error as Error);
    }
  };

  const handleSwitchChange = (name: keyof UserSettings) => {
    setSettings((prev) => (prev ? { ...prev, [name]: !prev[name] } : null));
  };

  const handleSelectChange = (name: keyof UserSettings, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência no FinanceTrack
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Preferências Financeiras
            </CardTitle>
            <CardDescription>
              Configure suas preferências para exibição de valores e moedas.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default_currency">Moeda padrão</Label>
              <Select
                value={settings?.default_currency || "BRL"}
                onValueChange={(value) =>
                  handleSelectChange("default_currency", value)
                }
              >
                <SelectTrigger id="default_currency">
                  <SelectValue placeholder="Selecione uma moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">Libra Esterlina (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_format">Formato de data</Label>
              <Select
                value={settings?.date_format || "DD/MM/YYYY"}
                onValueChange={(value) =>
                  handleSelectChange("date_format", value)
                }
              >
                <SelectTrigger id="date_format">
                  <SelectValue placeholder="Selecione um formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">
                    DD/MM/AAAA (31/12/2023)
                  </SelectItem>
                  <SelectItem value="MM/DD/YYYY">
                    MM/DD/AAAA (12/31/2023)
                  </SelectItem>
                  <SelectItem value="YYYY-MM-DD">
                    AAAA-MM-DD (2023-12-31)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget_alerts">Alertas de orçamento</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas quando estiver próximo de atingir seu limite de
                  orçamento.
                </p>
              </div>
              <Switch
                id="budget_alerts"
                checked={settings?.budget_alerts || false}
                onCheckedChange={() => handleSwitchChange("budget_alerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="due_date_alerts">Alertas de vencimento</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas sobre contas próximas do vencimento.
                </p>
              </div>
              <Switch
                id="due_date_alerts"
                checked={settings?.due_date_alerts || false}
                onCheckedChange={() => handleSwitchChange("due_date_alerts")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como e quando deseja receber notificações.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications">
                  Notificações por email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações importantes por email.
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={settings?.email_notifications || false}
                onCheckedChange={() =>
                  handleSwitchChange("email_notifications")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="app_notifications">
                  Notificações no aplicativo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações dentro do aplicativo.
                </p>
              </div>
              <Switch
                id="app_notifications"
                checked={settings?.app_notifications || false}
                onCheckedChange={() => handleSwitchChange("app_notifications")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Idioma e Região
            </CardTitle>
            <CardDescription>
              Configure suas preferências de idioma e região.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={settings?.language || "pt-BR"}
                onValueChange={(value) => handleSelectChange("language", value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecione um idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <Moon className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência do aplicativo.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={settings?.theme || "system"}
                onValueChange={(value) => handleSelectChange("theme", value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSettingsUpdate}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
