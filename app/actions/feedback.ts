"use server";

import { logger } from "@/lib/utils/logger";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  CreateFeedbackData,
  Feedback,
  FeedbackStats,
} from "@/lib/types/feedback";
import type { BaseActionResult } from "@/lib/types/actions";

// Criar novo feedback
export async function createFeedback(
  data: CreateFeedbackData
): Promise<BaseActionResult<Feedback>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    // Verificar se o usuário está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Preparar dados para inserir
    const feedbackData = {
      type: data.type,
      title: data.title,
      description: data.description,
      email: data.email,
      priority: data.priority || "MEDIUM",
      browser_info: data.browser_info,
      page_url: data.page_url,
      user_id: user?.id || null,
    };

    const { data: feedback, error } = await supabase
      .from("feedbacks")
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar feedback:", error as Error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Enviar notificação por email
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/feedback/send-notification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: feedback }),
        }
      );

      if (!response.ok) {
        logger.error(
          "Erro na resposta do email:",
          new Error(`[${response.status}, ${response.statusText}]`)
        );
      } else {
        logger.info("Email de notificação enviado com sucesso");
      }
    } catch (emailError) {
      logger.error("Erro ao enviar email:", emailError as Error);
      // Não falha a operação se o email não for enviado
    }

    return {
      success: true,
      data: feedback as Feedback,
    };
  } catch (error) {
    logger.error("Erro inesperado ao criar feedback:", error as Error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

// Listar feedbacks do usuário
export async function getUserFeedbacks(): Promise<
  BaseActionResult<Feedback[]>
> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const { data: feedbacks, error } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar feedbacks:", error as Error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: feedbacks as Feedback[],
    };
  } catch (error) {
    logger.error("Erro inesperado ao buscar feedbacks:", error as Error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

// Obter feedback por ID
export async function getFeedbackById(
  id: string
): Promise<BaseActionResult<Feedback>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const { data: feedback, error } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Erro ao buscar feedback:", error as Error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: feedback as Feedback,
    };
  } catch (error) {
    logger.error("Erro inesperado ao buscar feedback:", error as Error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

// Estatísticas de feedback (para administradores)
export async function getFeedbackStats(): Promise<
  BaseActionResult<FeedbackStats>
> {
  try {
    const supabase = createServerComponentClient({ cookies });

    // Buscar todos os feedbacks
    const { data: feedbacks, error } = await supabase
      .from("feedbacks")
      .select("type, status, priority, created_at");

    if (error) {
      logger.error("Erro ao buscar estatísticas:", error as Error);
      return {
        success: false,
        error: error.message,
      };
    }

    const stats: FeedbackStats = {
      total: feedbacks.length,
      byType: {
        SUGGESTION: 0,
        BUG_REPORT: 0,
        FEEDBACK: 0,
        FEATURE_REQUEST: 0,
        OTHER: 0,
      },
      byStatus: {
        OPEN: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        CLOSED: 0,
      },
      byPriority: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      },
      recentCount: 0,
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    feedbacks.forEach((feedback) => {
      // Contar por tipo
      stats.byType[feedback.type as keyof typeof stats.byType]++;

      // Contar por status
      stats.byStatus[feedback.status as keyof typeof stats.byStatus]++;

      // Contar por prioridade
      stats.byPriority[feedback.priority as keyof typeof stats.byPriority]++;

      // Contar recentes (últimos 7 dias)
      if (new Date(feedback.created_at) > sevenDaysAgo) {
        stats.recentCount++;
      }
    });

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    logger.error("Erro inesperado ao buscar estatísticas:", error as Error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}
