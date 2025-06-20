"use client";

import { useAdminGuard } from "@/hooks/use-admin-guard";
import { Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    description: "Visão geral e métricas",
  },
  {
    href: "/dashboard/admin/users",
    label: "Usuários",
    description: "Gestão de usuários",
  },
  {
    href: "/dashboard/admin/feedbacks",
    label: "Feedbacks",
    description: "Sistema de feedback",
  },
  {
    href: "/dashboard/admin/analytics",
    label: "Analytics",
    description: "Análise de uso",
  },
  {
    href: "/dashboard/admin/referrals",
    label: "Referências",
    description: "Sistema de convites",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isChecking } = useAdminGuard();
  const pathname = usePathname();

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // useAdminGuard já redireciona
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Admin */}
      <div className="border-b bg-red-500/10 dark:bg-red-900/20">
        <div className="container flex h-14 items-center gap-4 px-4">
          <Shield className="h-5 w-5 text-red-600" />
          <h1 className="text-lg font-semibold text-red-700 dark:text-red-400">
            Painel Administrativo
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b">
        <div className="container">
          <nav className="flex space-x-6 px-4 py-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col gap-1 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                  pathname === item.href
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <span>{item.label}</span>
                <span className="text-xs opacity-70">{item.description}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="container px-4 py-6">{children}</div>
      </div>
    </div>
  );
}
