"use client";

import { ExportDialog } from "@/components/export-dialog";
import { Button } from "@/components/ui/button";
import { AccountData, CategoryData } from "@/lib/types/actions";
import { Download } from "lucide-react";
import { useState } from "react";

// Hooks TanStack Query
import { useCategoriesQuery } from "@/useCases/categories/useCategoriesQuery";

interface ExportButtonProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
}

export function ExportButton({ variant = "outline" }: ExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Hooks TanStack Query
  const { data: categoriesData, isLoading, error } = useCategoriesQuery();
  const categories = categoriesData?.data || ([] as CategoryData[]);

  // Mock accounts data - você pode criar um hook similar para accounts
  const accounts: AccountData[] = [];

  return (
    <>
      <Button variant={variant} onClick={() => setIsDialogOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      <ExportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categories={categories}
        accounts={accounts}
      />
    </>
  );
}
