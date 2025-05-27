"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import type React from "react";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <Logo className="sm:h-12 sm:w-auto" />
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <MobileNav />
          <UserNav user={user} />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r md:flex">
          <DashboardNav />
        </aside>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
