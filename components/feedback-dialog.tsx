"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  AlertTriangle,
  Loader2,
  Send,
} from "lucide-react";
import { createFeedback } from "@/app/actions/feedback";
import { getBrowserInfo } from "@/lib/utils/browser-info";
import { FeedbackType } from "@/lib/types/feedback";

const feedbackSchema = z.object({
  type: z.enum([
    "SUGGESTION",
    "BUG_REPORT",
    "FEEDBACK",
    "FEATURE_REQUEST",
    "OTHER",
  ]),
  title: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título muito longo"),
  description: z
    .string()
    .min(20, "Descrição deve ter pelo menos 20 caracteres")
    .max(2000, "Descrição muito longa"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  includeContactInfo: z.boolean().default(false),
});

type FormData = z.infer<typeof feedbackSchema>;

const feedbackTypes = [
  {
    value: "SUGGESTION" as FeedbackType,
    label: "Sugestão",
    description: "Ideias para melhorar o sistema",
    icon: Lightbulb,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  {
    value: "BUG_REPORT" as FeedbackType,
    label: "Relatar Bug",
    description: "Problema ou erro encontrado",
    icon: Bug,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  {
    value: "FEEDBACK" as FeedbackType,
    label: "Feedback Geral",
    description: "Comentários sobre sua experiência",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    value: "FEATURE_REQUEST" as FeedbackType,
    label: "Nova Funcionalidade",
    description: "Solicitar uma nova funcionalidade",
    icon: Star,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    value: "OTHER" as FeedbackType,
    label: "Outro",
    description: "Outros tipos de feedback",
    icon: AlertTriangle,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
];

interface FeedbackDialogProps {
  children: React.ReactNode;
}

export function FeedbackDialog({ children }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "FEEDBACK",
      title: "",
      description: "",
      email: "",
      includeContactInfo: false,
    },
  });

  const selectedType = form.watch("type");
  const includeContactInfo = form.watch("includeContactInfo");
  const selectedTypeInfo = feedbackTypes.find(
    (type) => type.value === selectedType
  );

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Capturar informações do browser
      const browserInfo = getBrowserInfo();

      // Preparar dados para envio
      const feedbackData = {
        type: data.type,
        title: data.title,
        description: data.description,
        email: includeContactInfo ? data.email : undefined,
        browser_info: browserInfo,
        page_url: window.location.href,
      };

      const result = await createFeedback(feedbackData);

      if (result.success) {
        toast.success("Feedback enviado com sucesso!", {
          description: "Obrigado pelo seu feedback. Analisaremos em breve!",
        });

        form.reset();
        setOpen(false);
      } else {
        toast.error("Erro ao enviar feedback", {
          description: result.error || "Tente novamente em alguns instantes.",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.error("Erro inesperado", {
        description: "Não foi possível enviar o feedback. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Sua opinião é muito importante para nós! Compartilhe sugestões,
            relate bugs ou deixe comentários sobre sua experiência.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Feedback */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Feedback</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de feedback" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2 justify-start">
                            <type.icon className="h-4 w-4" />
                            <div className="flex flex-col items-start">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTypeInfo && (
                    <div className="mt-2">
                      <Badge className={selectedTypeInfo.color}>
                        <selectedTypeInfo.icon className="h-3 w-3 mr-1" />
                        {selectedTypeInfo.label}
                      </Badge>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Resumo do seu feedback em uma frase"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva brevemente o assunto (5-200 caracteres)
                  </FormDescription>
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
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        selectedType === "BUG_REPORT"
                          ? "Descreva o problema:\n\n1. O que você estava tentando fazer?\n2. O que aconteceu?\n3. O que você esperava que acontecesse?\n4. Como reproduzir o problema?"
                          : "Descreva sua sugestão, comentário ou solicitação em detalhes..."
                      }
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Forneça o máximo de detalhes possível (20-2000 caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Switch para incluir informações de contato */}
            <FormField
              control={form.control}
              name="includeContactInfo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Incluir informações de contato
                    </FormLabel>
                    <FormDescription>
                      Permita que entremos em contato para mais detalhes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Email (condicional) */}
            {includeContactInfo && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email para Contato</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Usado apenas para esclarecer dúvidas sobre este feedback
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Informações sobre privacidade */}
            <div className="bg-muted p-4 rounded-lg text-sm">
              <h4 className="font-medium mb-2">
                🔒 Informações de Privacidade
              </h4>
              <ul className="text-muted-foreground space-y-1">
                <li>
                  • Coletamos informações técnicas (navegador, resolução) para
                  melhor suporte
                </li>
                <li>
                  • Seu email só será usado se você optar por incluir
                  informações de contato
                </li>
                <li>• Todos os feedbacks são tratados de forma confidencial</li>
                <li>• Você pode enviar feedback anonimamente</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
