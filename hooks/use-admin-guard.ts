"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

export function useAdminGuard() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "ADMIN") {
      setIsAdmin(true);
    } else {
      // Usuário não é admin, redirecionar
      router.push("/dashboard");
      return;
    }

    setIsChecking(false);
  }, [user, loading, router]);

  return {
    isAdmin,
    isChecking,
    user,
  };
}
