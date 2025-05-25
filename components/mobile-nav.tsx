"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
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
            {routeItems.map((item, index) => (
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
        </div>
      </DrawerContent>
    </Drawer>
  );
}
