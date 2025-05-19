import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Dashboard - FinanceTrack",
  description: "Gerencie suas finanças pessoais com facilidade.",
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <MobileNav />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-xl">FinanceTrack</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[240px] flex-col border-r bg-muted/40 md:flex">
          <DashboardNav />
        </aside>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
