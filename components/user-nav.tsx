"use client"

import type { User } from "@supabase/auth-helpers-nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserNavProps {
  user: User
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U"
  const userName = user.user_metadata?.full_name || user.email || "Usuário"
  const userEmail = user.email || ""
  const avatarUrl = user.user_metadata?.avatar_url || ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={userName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/dashboard/profile")}>Perfil</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")}>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
