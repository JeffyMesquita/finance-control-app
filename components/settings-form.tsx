import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCache } from "@/lib/supabase/cache";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { UserSettings } from "@/lib/types";

const CACHE_KEY = "user-settings";

export function SettingsForm() {
  const { user, loading: userLoading } = useCurrentUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  // Configurações padrão
  const defaultSettings = useMemo(
    (): UserSettings => ({
      id: user?.id || "",
      default_currency: "BRL",
      date_format: "DD/MM/YYYY",
      theme: "light",
      email_notifications: true,
      app_notifications: true,
      budget_alerts: true,
      due_date_alerts: true,
      language: "pt-BR",
      created_at: null,
      updated_at: null,
    }),
    [user?.id]
  );

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Verifica cache primeiro
      const cachedSettings = supabaseCache.get(CACHE_KEY);
      if (cachedSettings) {
        setSettings(cachedSettings as UserSettings);
        setLoading(false);
        return;
      }

      // Busca no banco usando o ID do usuário
      const { data: settingsData, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Não existe configuração, usa padrão
          setSettings(defaultSettings);
        } else {
          throw error;
        }
      } else {
        setSettings(settingsData);
        supabaseCache.set(CACHE_KEY, settingsData);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Em caso de erro, usa configurações padrão
      setSettings(defaultSettings);
      toast({
        title: "Aviso",
        description:
          "Configurações não encontradas. Usando configurações padrão.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  }, [user, supabase, defaultSettings, toast]);

  const updateSettings = useCallback(
    async (field: keyof UserSettings, value: any) => {
      if (!user || !settings) return;

      try {
        setUpdating(true);

        // Atualiza no banco de dados
        const { error } = await supabase.from("user_settings").upsert({
          ...settings,
          [field]: value,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          throw error;
        }

        // Atualiza estado local
        const updatedSettings = { ...settings, [field]: value };
        setSettings(updatedSettings);

        // Atualiza cache
        supabaseCache.set(CACHE_KEY, updatedSettings);

        toast({
          title: "Sucesso",
          description: "Configuração atualizada com sucesso.",
          variant: "success",
        });
      } catch (error) {
        console.error("Error updating settings:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a configuração.",
          variant: "destructive",
        });
      } finally {
        setUpdating(false);
      }
    },
    [user, settings, supabase, toast]
  );

  const handleSwitchChange = useCallback(
    (field: keyof UserSettings) => {
      if (!settings) return;
      updateSettings(field, !settings[field]);
    },
    [settings, updateSettings]
  );

  const handleSelectChange = useCallback(
    (field: keyof UserSettings, value: string) => {
      updateSettings(field, value);
    },
    [updateSettings]
  );

  useEffect(() => {
    if (user && !userLoading) {
      fetchSettings();
    }
  }, [user, userLoading, fetchSettings]);

  if (loading || userLoading) {
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

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar as configurações.
          </p>
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
              onValueChange={(value) =>
                handleSelectChange("default_currency", value)
              }
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
              onValueChange={(value) =>
                handleSelectChange("date_format", value)
              }
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
