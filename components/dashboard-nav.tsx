"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
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

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2 p-4 bg-muted/40">
      {navItems.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname === item.href
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        </motion.div>
      ))}
    </nav>
  );
}
