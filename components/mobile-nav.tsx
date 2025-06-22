"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  LayoutDashboard,
  ArrowUpDown,
  BarChart3,
  Goal,
  CreditCard,
  Download,
  User,
  Sliders,
  PiggyBank,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

const routeItems = [
  {
    title: "Visão Geral",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transações",
    href: "/dashboard/transactions",
    icon: ArrowUpDown,
  },
  {
    title: "Categorias",
    href: "/dashboard/categories",
    icon: CreditCard,
  },
  {
    title: "Relatórios",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Metas",
    href: "/dashboard/goals",
    icon: Goal,
  },
  {
    title: "Cofrinhos",
    href: "/dashboard/cofrinhos",
    icon: PiggyBank,
  },
  {
    title: "Exportar",
    href: "/dashboard/exports",
    icon: Download,
  },
  {
    title: "Meu Perfil",
    href: "/dashboard/perfil",
    icon: User,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Sliders,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();

  // Verificar se o usuário é admin
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  // Adicionar item admin ao final da lista se for admin
  const allRouteItems = isAdmin
    ? [
        ...routeItems,
        {
          title: "Painel Admin",
          href: "/dashboard/admin",
          icon: Shield,
        },
      ]
    : routeItems;

  const handleItemClick = () => {
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-4 py-2 pb-12">
          <nav className="grid gap-2">
            {allRouteItems.map((item, index) => {
              // Aplicar estilo especial para o item admin
              const isAdminItem = item.href === "/dashboard/admin";

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={handleItemClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      (() => {
                        // Para a página raiz do dashboard, só ativa se for exatamente essa página
                        if (item.href === "/dashboard") {
                          return pathname === "/dashboard";
                        }
                        // Para outras páginas, verifica se é exata ou uma subpágina
                        return (
                          pathname === item.href ||
                          pathname.startsWith(item.href + "/")
                        );
                      })()
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted",
                      isAdminItem &&
                        "border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/30"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isAdminItem && "text-red-600 dark:text-red-400"
                      )}
                    />
                    <span
                      className={cn(
                        isAdminItem &&
                          "text-red-700 dark:text-red-300 font-medium"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
