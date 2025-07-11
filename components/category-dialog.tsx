"use client";

import { logger } from "@/lib/utils/logger";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { DynamicIcon, LucideIcon } from "./dynamic-icon";
import { lucideIconList } from "./lucide-icon-list";
import { CreateCategoryData } from "@/lib/types/actions";
import { useCreateCategoryMutation } from "@/useCases/categories/useCreateCategoryMutation";
import { useUpdateCategoryMutation } from "@/useCases/categories/useUpdateCategoryMutation";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
  onSuccess?: () => void;
}

const iconOptions: LucideIcon[] = lucideIconList;

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE" as "EXPENSE" | "INCOME",
    color: "#64748b",
    icon: null,
  });

  // Use TanStack Query hooks
  const createMutation = useCreateCategoryMutation({
    onSuccess: () => {
      toast({
        title: "Categoria Criada",
        description:
          "Sua nova categoria foi criada com sucesso e já está disponível para uso.",
        variant: "success",
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      logger.error("Erro ao criar categoria:", error);
      toast({
        title: "Erro ao Criar",
        description:
          error.message ||
          "Não foi possível criar a categoria. Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useUpdateCategoryMutation({
    onSuccess: () => {
      toast({
        title: "Categoria Atualizada",
        description: "A categoria foi atualizada com sucesso.",
        variant: "success",
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      logger.error("Erro ao atualizar categoria:", error);
      toast({
        title: "Erro ao Atualizar",
        description:
          error.message ||
          "Não foi possível atualizar a categoria. Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open && category) {
      setFormData({
        name: category.name || "",
        type: category.type || ("EXPENSE" as "EXPENSE" | "INCOME"),
        color: category.color || "#64748b",
        icon: category.icon || null,
      });
    } else if (open) {
      setFormData({
        name: "",
        type: "EXPENSE" as "EXPENSE" | "INCOME",
        color: "#64748b",
        icon: null,
      });
    }
  }, [open, category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          ...(formData as unknown as CreateCategoryData),
        });
      } else {
        await createMutation.mutateAsync(
          formData as unknown as CreateCategoryData
        );
      }
    } catch (error) {
      // Error handling é feito nos callbacks dos hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {category ? "Editar Categoria" : "Adicionar Categoria"}
            </DialogTitle>
            <DialogDescription>
              {category
                ? "Atualize os detalhes da categoria existente."
                : "Crie uma nova categoria para organizar suas transações."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-8 p-1"
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone</Label>
              <Select
                value={formData.icon || ""}
                onValueChange={(value) => handleSelectChange("icon", value)}
              >
                <SelectTrigger id="icon">
                  <div className="flex items-center gap-2">
                    <SelectValue placeholder="Selecione um ícone" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((iconName) => {
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className={cn("flex items-center gap-2")}>
                          <DynamicIcon
                            icon={iconName}
                            size={18}
                            color={formData.color}
                          />
                          <span className="text-sm font-bold italic">
                            {iconName}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? category
                  ? "Atualizando..."
                  : "Adicionando..."
                : category
                ? "Atualizar"
                : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
