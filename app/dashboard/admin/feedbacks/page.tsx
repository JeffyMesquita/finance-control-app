"use client";

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
} from "lucide-react";
import { toast } from "sonner";

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    priority: "",
  });

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const result = await getAdminFeedbacks(filters);
      if (result.success && result.data) {
        setFeedbacks(result.data.feedbacks);
      }
    } catch (error) {
      toast.error("Erro ao carregar feedbacks");
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
      });

      if (result.success) {
        toast.success("Status atualizado!");
        loadFeedbacks();
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      toast.error("Erro ao atualizar feedback");
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "URGENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      SUGGESTION: "Sugestao",
      BUG_REPORT: "Bug Report",
      FEEDBACK: "Feedback",
      FEATURE_REQUEST: "Nova Funcionalidade",
      OTHER: "Outro",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestao de Feedbacks</h1>
        <p className="text-muted-foreground">
          Sistema de gerenciamento de feedbacks dos usuarios
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Sistema de Feedbacks
              </h3>
              <p className="text-muted-foreground">
                Total de feedbacks encontrados: {feedbacks.length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
