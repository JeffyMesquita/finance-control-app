import * as React from "react";
import { Feedback } from "@/lib/types/feedback";

interface FeedbackNotificationEmailProps {
  feedback: Feedback;
  baseUrl: string;
}

const typeLabels = {
  SUGGESTION: "Sugestão",
  BUG_REPORT: "Relato de Bug",
  FEEDBACK: "Feedback",
  FEATURE_REQUEST: "Solicitação de Funcionalidade",
  OTHER: "Outro",
};

const priorityLabels = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const priorityColors = {
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  URGENT: "#DC2626",
};

export const FeedbackNotificationEmail: React.FC<
  Readonly<FeedbackNotificationEmailProps>
> = ({ feedback, baseUrl }) => {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1f2937",
          color: "#ffffff",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: "0",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          Novo Feedback Recebido
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "16px",
            opacity: "0.9",
          }}
        >
          FinanceTrack - Sistema de Controle Financeiro
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 24px" }}>
        {/* Tipo e Prioridade */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {typeLabels[feedback.type]}
          </div>
          <div
            style={{
              backgroundColor: priorityColors[feedback.priority],
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Prioridade: {priorityLabels[feedback.priority]}
          </div>
        </div>

        {/* Título */}
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "20px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            {feedback.title}
          </h2>
        </div>

        {/* Descrição */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Descrição:
          </h3>
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "16px",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#4b5563",
              whiteSpace: "pre-wrap",
            }}
          >
            {feedback.description}
          </div>
        </div>

        {/* Informações do Usuário */}
        <div
          style={{
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Informações do Usuário:
          </h3>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            <p style={{ margin: "4px 0" }}>
              <strong>ID:</strong> {feedback.user_id || "Usuário anônimo"}
            </p>
            {feedback.email && (
              <p style={{ margin: "4px 0" }}>
                <strong>Email:</strong> {feedback.email}
              </p>
            )}
            {feedback.page_url && (
              <p style={{ margin: "4px 0" }}>
                <strong>Página:</strong> {feedback.page_url}
              </p>
            )}
            <p style={{ margin: "4px 0" }}>
              <strong>Data:</strong>{" "}
              {new Date(feedback.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Informações Técnicas */}
        {feedback.browser_info && (
          <div
            style={{
              backgroundColor: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "16px",
                fontWeight: "500",
                color: "#92400e",
              }}
            >
              Informações Técnicas:
            </h3>
            <div style={{ fontSize: "12px", color: "#78350f" }}>
              <p style={{ margin: "4px 0" }}>
                <strong>Navegador:</strong> {feedback.browser_info.userAgent}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Resolução:</strong>{" "}
                {feedback.browser_info.viewport.width}x
                {feedback.browser_info.viewport.height}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Plataforma:</strong> {feedback.browser_info.platform}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Idioma:</strong> {feedback.browser_info.language}
              </p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div
          style={{
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "24px",
          }}
        >
          <p
            style={{
              margin: "0 0 16px",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Acesse o painel administrativo para gerenciar este feedback:
          </p>
          <a
            href={`${baseUrl || "https://financetrack.jeffymesquita.dev"}/dashboard/admin/feedbacks/${feedback.id}`}
            style={{
              display: "inline-block",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Ver Feedback
          </a>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px 24px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          Este email foi enviado automaticamente pelo sistema FinanceTrack.
          <br />
          Não responda a este email.
        </p>
      </div>
    </div>
  );
};
