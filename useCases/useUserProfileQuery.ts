import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

interface UserProfileResponse {
  success: boolean;
  data: UserProfile | null;
  error?: string;
}

async function fetchUserProfile(): Promise<UserProfile | null> {
  const response = await fetch("/api/user-profile");
  const result: UserProfileResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch user profile");
  }

  return result.data;
}

async function updateUserProfile(
  profileData: UserProfile
): Promise<UserProfile> {
  const response = await fetch("/api/user-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  const result: UserProfileResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update user profile");
  }

  return result.data!;
}

export function useUserProfileQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchUserProfile, []);

  const query = useQuery<UserProfile | null, Error>({
    queryKey: ["user-profile"],
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar perfil",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}

interface UpdateUserProfileOptions {
  onSuccess?: (data: UserProfile) => void;
  onError?: (error: Error) => void;
}

export function useUpdateUserProfileMutation(
  options: UpdateUserProfileOptions = {}
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
        variant: "success",
      });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil",
        variant: "destructive",
      });

      options.onError?.(error);
    },
  });
}
