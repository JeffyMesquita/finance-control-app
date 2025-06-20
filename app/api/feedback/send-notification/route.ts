import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FeedbackNotificationEmail } from "@/components/email-templates/feedback-notification";
import { Feedback } from "@/lib/types/feedback";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { feedback }: { feedback: Feedback } = await request.json();

    if (!feedback) {
      return NextResponse.json(
        { error: "Dados do feedback são obrigatórios" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY não configurada");
      return NextResponse.json(
        { error: "Configuração de email não encontrada" },
        { status: 500 }
      );
    }

    // Definir emails de destino (você pode configurar isso via env vars)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [
      "admin@financetrack.com",
    ];

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

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@financetrack.com",
      to: adminEmails,
      subject,
      react: FeedbackNotificationEmail({ feedback }),
      // Fallback HTML para caso o React template falhe
      html: `
        <h2>Novo Feedback Recebido</h2>
        <p><strong>Tipo:</strong> ${typeLabels[feedback.type]}</p>
        <p><strong>Prioridade:</strong> ${feedback.priority}</p>
        <p><strong>Título:</strong> ${feedback.title}</p>
        <p><strong>Descrição:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${feedback.description.replace(/\n/g, "<br>")}
        </div>
        ${feedback.email ? `<p><strong>Email:</strong> ${feedback.email}</p>` : ""}
        ${feedback.page_url ? `<p><strong>Página:</strong> ${feedback.page_url}</p>` : ""}
        <p><strong>Data:</strong> ${new Date(feedback.created_at).toLocaleString("pt-BR")}</p>
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
      console.error("Erro do Resend:", error);
      return NextResponse.json(
        { error: "Erro ao enviar email", details: error },
        { status: 500 }
      );
    }

    console.log("Email enviado com sucesso:", data?.id);
    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: "Notificação enviada com sucesso",
    });
  } catch (error) {
    console.error("Erro inesperado no envio de email:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
