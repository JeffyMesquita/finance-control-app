"use client";

import { logger } from "@/lib/utils/logger";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ExportDialog } from "@/components/export-dialog";
import { getCategories } from "@/app/actions/categories";
import { getAccounts } from "@/app/actions/accounts";

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
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      fetchData();
    }
  }, [isDialogOpen]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [categoriesData, accountsData] = await Promise.all([
        getCategories(),
        getAccounts(),
      ]);
      setCategories(categoriesData);
      setAccounts(accountsData);
    } catch (error) {
      logger.error("Erro ao carregar dados para exportação:", error as Error);
    } finally {
      setIsLoading(false);
    }
  }

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

