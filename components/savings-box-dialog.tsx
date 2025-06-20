"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  createSavingsBox,
  updateSavingsBox,
} from "@/app/actions/savings-boxes";
import type { SavingsBox } from "@/lib/types/savings-boxes";
import {
  SAVINGS_BOX_COLORS,
  SAVINGS_BOX_ICONS,
} from "@/lib/types/savings-boxes";
import {
  PiggyBank,
  Home,
  Plane,
  Car,
  GraduationCap,
  Heart,
  Shield,
  Gift,
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  ShoppingCart,
  Coffee,
  Music,
  Book,
  Bike,
  Dumbbell,
  TreePine,
  Star,
} from "lucide-react";

const iconMap = {
  "piggy-bank": PiggyBank,
  home: Home,
  plane: Plane,
  car: Car,
  "graduation-cap": GraduationCap,
  heart: Heart,
  shield: Shield,
  gift: Gift,
  smartphone: Smartphone,
  laptop: Laptop,
  camera: Camera,
  gamepad: Gamepad2,
  "shopping-cart": ShoppingCart,
  coffee: Coffee,
  music: Music,
  book: Book,
  bike: Bike,
  dumbbell: Dumbbell,
  tree: TreePine,
  star: Star,
};

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  target_amount: z
    .number()
    .min(0, "Meta deve ser maior ou igual a zero")
    .optional(),
  color: z.string().min(1, "Selecione uma cor"),
  icon: z.string().min(1, "Selecione um ícone"),
});

type FormData = z.infer<typeof formSchema>;

interface SavingsBoxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savingsBox?: SavingsBox;
  onSuccess?: () => void;
}

export function SavingsBoxDialog({
  open,
  onOpenChange,
  savingsBox,
  onSuccess,
}: SavingsBoxDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!savingsBox;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: savingsBox?.name || "",
      description: savingsBox?.description || "",
      target_amount: savingsBox?.target_amount
        ? savingsBox.target_amount / 100
        : undefined,
      color: savingsBox?.color || SAVINGS_BOX_COLORS[0],
      icon: savingsBox?.icon || SAVINGS_BOX_ICONS[0],
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        target_amount: data.target_amount || null,
        color: data.color,
        icon: data.icon,
      };

      let result;
      if (isEditing) {
        result = await updateSavingsBox(savingsBox.id, payload);
      } else {
        result = await createSavingsBox(payload);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Cofrinho atualizado com sucesso!"
            : "Cofrinho criado com sucesso!"
        );
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cofrinho" : "Novo Cofrinho"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do seu cofrinho."
              : "Crie um novo cofrinho para organizar suas economias."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Viagem para Europa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o objetivo deste cofrinho (opcional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meta */}
            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta (opcional)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder="R$ 0,00"
                      value={field.value || 0}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Defina uma meta para acompanhar seu progresso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cor */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-8 gap-2">
                      {SAVINGS_BOX_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-8 w-8 rounded-lg border-2 transition-all hover:scale-110 ${
                            field.value === color
                              ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ícone */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-10 gap-2">
                      {SAVINGS_BOX_ICONS.map((iconName) => {
                        const IconComponent = iconMap[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all hover:scale-110 ${
                              field.value === iconName
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                            onClick={() => field.onChange(iconName)}
                          >
                            <IconComponent className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Atualizando..."
                    : "Criando..."
                  : isEditing
                  ? "Atualizar"
                  : "Criar Cofrinho"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
