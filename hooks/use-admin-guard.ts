"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAdminGuard() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.id === adminId) {
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
