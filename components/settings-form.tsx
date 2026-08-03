import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import type { UserSettings } from "@/lib/types";
import {
  useUpdateUserSettingsMutation,
  useUserSettingsQuery,
} from "@/useCases/useUserSettingsQuery";

export function SettingsForm() {
  const { data: settings, isError, isLoading } = useUserSettingsQuery();
  const { mutate: updateSettings, isPending: updating } = useUpdateUserSettingsMutation();
  const handleSwitchChange = useCallback(
    (field: keyof UserSettings) => {
      if (!settings) return;
      updateSettings({ ...settings, [field]: !settings[field] });
    },
    [settings, updateSettings]
  );

  const handleSelectChange = useCallback(
    (field: keyof UserSettings, value: string) => {
      if (!settings) return;
      updateSettings({ ...settings, [field]: value });
    },
    [settings, updateSettings]
  );

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foi possível carregar as configurações.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Notificações por Email</Label>
            <Switch
              id="email-notifications"
              checked={settings.email_notifications}
              onCheckedChange={() => handleSwitchChange("email_notifications")}
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="app-notifications">Notificações do App</Label>
            <Switch
              id="app-notifications"
              checked={settings.app_notifications}
              onCheckedChange={() => handleSwitchChange("app_notifications")}
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="budget-alerts">Alertas de Orçamento</Label>
            <Switch
              id="budget-alerts"
              checked={settings.budget_alerts}
              onCheckedChange={() => handleSwitchChange("budget_alerts")}
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="due-date-alerts">Alertas de Vencimento</Label>
            <Switch
              id="due-date-alerts"
              checked={settings.due_date_alerts}
              onCheckedChange={() => handleSwitchChange("due_date_alerts")}
              disabled={updating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aparência */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSelectChange("theme", value)}
              disabled={updating}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Selecione o tema" />
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

      {/* Preferências Regionais */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências Regionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleSelectChange("language", value)}
              disabled={updating}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-currency">Moeda Padrão</Label>
            <Select
              value={settings.default_currency}
              onValueChange={(value) => handleSelectChange("default_currency", value)}
              disabled={updating}
            >
              <SelectTrigger id="default-currency">
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                <SelectItem value="USD">Dólar Americano (US$)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Formato de Data</Label>
            <Select
              value={settings.date_format}
              onValueChange={(value) => handleSelectChange("date_format", value)}
              disabled={updating}
            >
              <SelectTrigger id="date-format">
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
