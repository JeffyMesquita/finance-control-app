"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ArrowUpDown, BarChart3, Goal, CreditCard, Download, User, Sliders } from "lucide-react"

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
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-2 p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
            pathname === item.href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
