import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { brand } from "@/lib/brand";
import type { Feedback } from "@/lib/types/feedback";
import { logger } from "@/lib/utils/logger";

const resendApiKey = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { feedback }: { feedback: Feedback } = await request.json();

    if (!feedback) {
      return NextResponse.json({ error: "Dados do feedback são obrigatórios" }, { status: 400 });
    }

    if (!resendApiKey) {
      logger.error("RESEND_API_KEY não configurada");
      return NextResponse.json({ error: "Configuração de email não encontrada" }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    // Definir emails de destino (você pode configurar isso via env vars)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [brand.contacts.general];

    // Definir assunto baseado no tipo e prioridade
    const typeLabels = {
      SUGGESTION: "Sugestão",
      BUG_REPORT: "Bug Report",
      FEEDBACK: "Feedback",
      FEATURE_REQUEST: "Solicitação de Funcionalidade",
      OTHER: "Outro",
    };

    const priorityEmoji = {
      LOW: "🟢",
      MEDIUM: "🟡",
      HIGH: "🟠",
      URGENT: "🔴",
    };

    const subject = `${priorityEmoji[feedback.priority]} ${typeLabels[feedback.type]}: ${feedback.title}`;

    // Determinar a URL base correta (priorizar variável de servidor)
    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://ajeitagrana.jeffymesquita.dev");

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || `noreply@${new URL(brand.url).hostname}`,
      to: adminEmails,
      subject,
      // Usar HTML diretamente (mais confiável)
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border: 1px solid #ccc; border-radius: 8px;">
          <!-- Header -->
          <div style="background: #1f2937; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Novo Feedback Recebido</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">AjeitaGrana - Sistema de Controle Financeiro</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <!-- Badges -->
            <div style="margin-bottom: 24px;">
              <span style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-right: 8px;">
                ${typeLabels[feedback.type]}
              </span>
              <span style="background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px;">
                Prioridade: ${feedback.priority}
              </span>
            </div>
            
            <!-- Título -->
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">${feedback.title}</h2>
            
            <!-- Descrição -->
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #374151;">Descrição:</h3>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 24px; line-height: 1.6;">
              ${feedback.description.replace(/\n/g, "<br>")}
            </div>
            
            <!-- Informações do usuário -->
            <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; color: #374151;">Informações do Usuário:</h3>
              <p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>ID:</strong> ${feedback.user_id || "Usuário anônimo"}</p>
              ${feedback.email ? `<p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>Email:</strong> ${feedback.email}</p>` : ""}
              ${feedback.page_url ? `<p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>Página:</strong> ${feedback.page_url}</p>` : ""}
              <p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>Data:</strong> ${new Date(feedback.created_at).toLocaleString("pt-BR")}</p>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
                Acesse o painel administrativo para gerenciar este feedback:
              </p>
              <a href="${baseUrl}/dashboard/admin/feedbacks/${feedback.id}" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                Ver Feedback
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              Este email foi enviado automaticamente pelo sistema AjeitaGrana.<br>
              Não responda a este email.
            </p>
          </div>
        </div>
      `,
      // Headers adicionais para melhor deliverabilidade
      headers: {
        "X-Entity-Ref-ID": feedback.id,
      },
      // Tags para organização no Resend
      tags: [
        {
          name: "type",
          value: feedback.type.toLowerCase(),
        },
        {
          name: "priority",
          value: feedback.priority.toLowerCase(),
        },
        {
          name: "category",
          value: "feedback",
        },
      ],
    });

    if (error) {
      logger.error("Erro do Resend:", error);
      return NextResponse.json({ error: "Erro ao enviar email", details: error }, { status: 500 });
    }

    logger.info("Email enviado com sucesso:", { data: data?.id });
    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: "Notificação enviada com sucesso",
    });
  } catch (error) {
    logger.error("Erro inesperado no envio de email:", error as Error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
