import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UserSettings } from "@/lib/types";

interface UserSettingsResponse {
  success: boolean;
  data: UserSettings;
  error?: string;
}

async function fetchUserSettings(): Promise<UserSettings> {
  const response = await fetch("/api/user-settings");
  const result: UserSettingsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch user settings");
  }

  return result.data;
}

async function updateUserSettings(
  settingsData: UserSettings
): Promise<UserSettings> {
  const response = await fetch("/api/user-settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settingsData),
  });

  const result: UserSettingsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update user settings");
  }

  return result.data;
}

export function useUserSettingsQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchUserSettings, []);

  const query = useQuery<UserSettings, Error>({
    queryKey: ["user-settings"],
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar configurações",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}

interface UpdateUserSettingsOptions {
  onSuccess?: (data: UserSettings) => void;
  onError?: (error: Error) => void;
}

export function useUpdateUserSettingsMutation(
  options: UpdateUserSettingsOptions = {}
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      // Invalidate and refetch user settings
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });

      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências foram atualizadas com sucesso",
        variant: "success",
      });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description:
          error.message || "Não foi possível atualizar suas configurações",
        variant: "destructive",
      });

      options.onError?.(error);
    },
  });
}
