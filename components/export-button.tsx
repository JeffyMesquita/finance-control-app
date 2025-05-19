"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExportDialog } from "@/components/export-dialog"
import { Download } from "lucide-react"

interface ExportButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function ExportButton({ variant = "default" }: ExportButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      <ExportDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
