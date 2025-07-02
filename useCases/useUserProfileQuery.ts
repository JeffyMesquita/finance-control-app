import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

export function useUserProfileQuery() {
  const { toast } = useToast();

  const fetchUserProfile =
    useCallback(async (): Promise<UserProfile | null> => {
      const res = await fetch("/api/user-profile");
      if (!res.ok) {
        throw new Error("Erro ao buscar perfil do usuário");
      }
      return await res.json();
    }, []);

  const query = useQuery<UserProfile | null, Error>({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao buscar perfil do usuário",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
