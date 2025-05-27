import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCache } from "@/lib/supabase/cache";
import { useCurrentUser } from "@/hooks/use-current-user";

const CACHE_KEY = "user-settings";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function SettingsForm() {
  const { user, loading: userLoading } = useCurrentUser();
  const [settings, setSettings] = useState<{
    emailNotifications: boolean;
    darkMode: boolean;
    language: string;
  }>({
    emailNotifications: false,
    darkMode: false,
    language: "pt-BR",
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const fetchSettings = async () => {
    try {
      if (!user) return;
      const cachedSettings = supabaseCache.get(CACHE_KEY);
      if (cachedSettings) {
        setSettings(cachedSettings as any);
        setLoading(false);
        return;
      }
      const { data: settings, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (settingsError) throw settingsError;
      const formattedSettings = {
        emailNotifications: settings?.email_notifications || false,
        darkMode: settings?.dark_mode || false,
        language: settings?.language || "pt-BR",
      };
      setSettings(formattedSettings);
      supabaseCache.set(CACHE_KEY, formattedSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (key: string, value: any) => {
    try {
      if (!user) throw new Error("User not found");
      const { error: updateError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          [key]: value,
        });
      if (updateError) throw updateError;
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        supabaseCache.set(CACHE_KEY, newSettings);
        return newSettings;
      });
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && !userLoading) {
      fetchSettings();
    }
  }, [user, userLoading]);

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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications">Notificações por Email</Label>
          <Switch
            id="email-notifications"
            checked={settings.emailNotifications}
            onCheckedChange={(checked) =>
              updateSettings("emailNotifications", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Modo Escuro</Label>
          <Switch
            id="dark-mode"
            checked={settings.darkMode}
            onCheckedChange={(checked) => updateSettings("darkMode", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
