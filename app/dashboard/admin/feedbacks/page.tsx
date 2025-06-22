"use client";

import { logger } from "@/lib/utils/logger";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAdminFeedbacks, updateFeedbackStatus } from "@/app/actions/admin";
import {
  MessageSquare,
  Filter,
  CheckCircle,
  Clock,
  Loader2,
  Calendar,
  User,
  Globe,
  Bug,
  Lightbulb,
  Star,
  AlertTriangle,
  ExternalLink,
  Edit,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Types
interface Feedback {
  id: string;
  type: string;
  title: string;
  description: string;
  email?: string;
  priority: string;
  status: string;
  browser_info?: any;
  page_url?: string;
  user_id?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

// Configurações de tipos de feedback
const feedbackTypes = [
  {
    value: "SUGGESTION",
    label: "Sugestão",
    description: "Ideias para melhorar o sistema",
    icon: Lightbulb,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  {
    value: "BUG_REPORT",
    label: "Relatar Bug",
    description: "Problema ou erro encontrado",
    icon: Bug,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  {
    value: "FEEDBACK",
    label: "Feedback Geral",
    description: "Comentários sobre experiência",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    value: "FEATURE_REQUEST",
    label: "Nova Funcionalidade",
    description: "Solicitar nova funcionalidade",
    icon: Star,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    value: "OTHER",
    label: "Outro",
    description: "Outros tipos de feedback",
    icon: AlertTriangle,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
];

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all",
    search: "",
  });

  const loadFeedbacks = async () => {
    try {
      setLoading(true);

      // Converter "all" para undefined para não filtrar
      const apiFilters = {
        type: filters.type === "all" ? undefined : filters.type,
        status: filters.status === "all" ? undefined : filters.status,
        priority: filters.priority === "all" ? undefined : filters.priority,
      };

      const result = await getAdminFeedbacks(apiFilters);

      if (result.success && "data" in result && result.data) {
        setFeedbacks(result.data.feedbacks);
      } else {
        const errorMessage =
          "error" in result ? result.error : "Erro desconhecido";
        toast.error(`Erro ao carregar feedbacks: ${errorMessage}`);
      }
    } catch (error) {
      logger.error("Erro inesperado ao carregar feedbacks:", error);
      toast.error(
        `Erro inesperado: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      const result = await updateFeedbackStatus(feedbackId, {
        status: newStatus,
        resolved_at:
          newStatus === "RESOLVED" ? new Date().toISOString() : undefined,
        admin_notes: adminNotes || undefined,
      });

      if (result.success) {
        toast.success("Status atualizado!");
        loadFeedbacks();
        setSelectedFeedback(null);
        setAdminNotes("");
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      toast.error("Erro ao atualizar feedback");
    }
  };

  useEffect(() => {
    // Debug: verificar usuário atual
    const checkCurrentUser = async () => {
      const supabase = createClientComponentClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      logger.info("Usuário atual na página:", {
        data: [user ? { id: user.id, email: user.email } : "null"],
      });
    };

    checkCurrentUser();
    loadFeedbacks();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    loadFeedbacks();
  }, [filters.type, filters.status, filters.priority]);

  // Filtrar por busca localmente
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      feedback.title.toLowerCase().includes(searchLower) ||
      feedback.description.toLowerCase().includes(searchLower) ||
      feedback.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "RESOLVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeConfig = (type: string) => {
    return feedbackTypes.find((t) => t.value === type) || feedbackTypes[4]; // fallback to OTHER
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      OPEN: "Aberto",
      IN_PROGRESS: "Em Andamento",
      RESOLVED: "Resolvido",
      CLOSED: "Fechado",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      LOW: "Baixa",
      MEDIUM: "Média",
      HIGH: "Alta",
      URGENT: "Urgente",
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestão de Feedbacks</h1>
        <p className="text-muted-foreground">
          Sistema de gerenciamento de feedbacks dos usuários
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Título, descrição ou email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {feedbackTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="OPEN">Aberto</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                  <SelectItem value="RESOLVED">Resolvido</SelectItem>
                  <SelectItem value="CLOSED">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Prioridade
              </label>
              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Feedbacks */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando feedbacks...</span>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum feedback encontrado
              </h3>
              <p className="text-muted-foreground">
                {feedbacks.length === 0
                  ? "Não há feedbacks cadastrados no sistema."
                  : "Nenhum feedback corresponde aos filtros aplicados."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredFeedbacks.length} feedback
              {filteredFeedbacks.length !== 1 ? "s" : ""} encontrado
              {filteredFeedbacks.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-4">
            {filteredFeedbacks.map((feedback) => {
              const typeConfig = getTypeConfig(feedback.type);
              const IconComponent = typeConfig.icon;

              return (
                <Card key={feedback.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Conteúdo principal */}
                      <div className="flex-1 space-y-3">
                        {/* Header com tipo e prioridade */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <Badge className={typeConfig.color}>
                              {typeConfig.label}
                            </Badge>
                          </div>
                          <Badge
                            className={getPriorityColor(feedback.priority)}
                          >
                            {getPriorityLabel(feedback.priority)}
                          </Badge>
                          <Badge className={getStatusColor(feedback.status)}>
                            {getStatusLabel(feedback.status)}
                          </Badge>
                        </div>

                        {/* Título e descrição */}
                        <div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {feedback.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-3">
                            {feedback.description}
                          </p>
                        </div>

                        {/* Metadados */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(feedback.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                          {feedback.user?.email && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {feedback.user.email}
                            </div>
                          )}
                          {feedback.page_url && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              <span className="truncate max-w-48">
                                {feedback.page_url}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFeedback(feedback);
                                setAdminNotes(feedback.admin_notes || "");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <IconComponent className="h-5 w-5" />
                                {typeConfig.label}: {feedback.title}
                              </DialogTitle>
                              <DialogDescription>
                                Feedback enviado em{" "}
                                {new Date(
                                  feedback.created_at
                                ).toLocaleDateString("pt-BR")}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Status e Prioridade */}
                              <div className="flex gap-2">
                                <Badge
                                  className={getPriorityColor(
                                    feedback.priority
                                  )}
                                >
                                  {getPriorityLabel(feedback.priority)}
                                </Badge>
                                <Badge
                                  className={getStatusColor(feedback.status)}
                                >
                                  {getStatusLabel(feedback.status)}
                                </Badge>
                              </div>

                              {/* Descrição */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Descrição
                                </h4>
                                <p className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                                  {feedback.description}
                                </p>
                              </div>

                              {/* Informações do usuário */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Informações do Usuário
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Email:</span>{" "}
                                    {feedback.user?.email ||
                                      feedback.email ||
                                      "Não informado"}
                                  </div>
                                  <div>
                                    <span className="font-medium">Nome:</span>{" "}
                                    {feedback.user?.full_name ||
                                      "Não informado"}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-medium">Página:</span>{" "}
                                    {feedback.page_url || "Não informado"}
                                  </div>
                                </div>
                              </div>

                              {/* Informações técnicas */}
                              {feedback.browser_info && (
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Informações Técnicas
                                  </h4>
                                  <div className="text-sm bg-muted p-4 rounded-lg">
                                    <div>
                                      <span className="font-medium">
                                        Navegador:
                                      </span>{" "}
                                      {feedback.browser_info.userAgent}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Idioma:
                                      </span>{" "}
                                      {feedback.browser_info.language}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Plataforma:
                                      </span>{" "}
                                      {feedback.browser_info.platform}
                                    </div>
                                    {feedback.browser_info.viewport && (
                                      <div>
                                        <span className="font-medium">
                                          Viewport:
                                        </span>{" "}
                                        {feedback.browser_info.viewport.width}x
                                        {feedback.browser_info.viewport.height}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Notas administrativas */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Notas Administrativas
                                </h4>
                                <Textarea
                                  placeholder="Adicione notas internas sobre este feedback..."
                                  value={adminNotes}
                                  onChange={(e) =>
                                    setAdminNotes(e.target.value)
                                  }
                                  rows={3}
                                />
                              </div>

                              {/* Ações de status */}
                              <div>
                                <h4 className="font-semibold mb-3">
                                  Atualizar Status
                                </h4>
                                <div className="flex gap-2 flex-wrap">
                                  {feedback.status !== "IN_PROGRESS" && (
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          feedback.id,
                                          "IN_PROGRESS"
                                        )
                                      }
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Em Andamento
                                    </Button>
                                  )}
                                  {feedback.status !== "RESOLVED" && (
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          feedback.id,
                                          "RESOLVED"
                                        )
                                      }
                                      variant="outline"
                                      size="sm"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Resolver
                                    </Button>
                                  )}
                                  {feedback.status !== "CLOSED" && (
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          feedback.id,
                                          "CLOSED"
                                        )
                                      }
                                      variant="outline"
                                      size="sm"
                                    >
                                      Fechar
                                    </Button>
                                  )}
                                  {feedback.status !== "OPEN" && (
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(feedback.id, "OPEN")
                                      }
                                      variant="outline"
                                      size="sm"
                                    >
                                      Reabrir
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {feedback.page_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(feedback.page_url, "_blank")
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
