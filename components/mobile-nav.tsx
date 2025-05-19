"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  List,
  PieChart,
  Settings,
  Target,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Visão Geral",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/transactions",
      label: "Transações",
      icon: List,
    },
    {
      href: "/dashboard/categories",
      label: "Categorias",
      icon: PieChart,
    },
    {
      href: "/dashboard/accounts",
      label: "Contas",
      icon: CreditCard,
    },
    {
      href: "/dashboard/goals",
      label: "Metas",
      icon: Target,
    },
    {
      href: "/dashboard/reports",
      label: "Relatórios",
      icon: BarChart3,
    },
    {
      href: "/dashboard/exports",
      label: "Exportar",
      icon: DollarSign,
    },
    {
      href: "/dashboard/perfil",
      label: "Perfil",
      icon: User,
    },
    {
      href: "/dashboard/configuracoes",
      label: "Configurações",
      icon: Settings,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] pt-10">
        <div className="grid gap-2 py-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                pathname === route.href && "bg-muted font-medium text-foreground",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
