"use client";

import { BellPlus, LogOut, MessageSquare, Moon, Settings, Sun, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { AlertReminderModal } from "@/components/alert-reminder-modal";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiSession } from "@/lib/api/contracts";
import { sessionApi } from "@/lib/api/session";
import { logger } from "@/lib/utils/logger";

export function UserNav({ user }: { user?: ApiSession }) {
  const { setTheme, theme } = useTheme();

  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setTheme("dark");
      await sessionApi.logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      logger.error("Erro ao fazer logout:", error as Error);
    }
  };

  const displayName = user?.user_metadata?.full_name?.trim() || user?.email || "Usuário";
  const userEmail = user?.email || "";
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const initials =
    (nameParts.length > 1
      ? nameParts
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
      : displayName.slice(0, 2)
    ).toUpperCase() || "U";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const [avatarError, setAvatarError] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={avatarError ? undefined : avatarUrl}
                onError={() => setAvatarError(true)}
                alt={displayName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/dashboard/perfil")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenAlertModal(true)}>
            <BellPlus className="mr-2 h-4 w-4" />
            Novo Alerta
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/dashboard/configuracoes")}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <FeedbackDialog>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Enviar Feedback
            </DropdownMenuItem>
          </FeedbackDialog>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleThemeChange}>
            {theme === "light" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Mudar tema
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertReminderModal open={openAlertModal} onClose={() => setOpenAlertModal(false)} />
    </>
  );
}
