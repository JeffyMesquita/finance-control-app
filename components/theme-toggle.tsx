"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, BellPlus } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { AlertReminderModal } from "@/components/alert-reminder-modal";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [openAlertModal, setOpenAlertModal] = useState(false);

  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpenAlertModal(true)}
        className="max-md:hidden"
        title="Novo Alerta"
      >
        <BellPlus className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Novo alerta</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleThemeChange}
        className="max-md:hidden"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Mudar tema</span>
      </Button>
      <AlertReminderModal
        open={openAlertModal}
        onClose={() => setOpenAlertModal(false)}
      />
    </div>
  );
}

