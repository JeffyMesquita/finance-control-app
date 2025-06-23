/**
 * Exemplo de uso do Sistema de Logging Avançado
 *
 * Este arquivo demonstra todas as funcionalidades do novo sistema de logging
 * baseado em Winston com configuração via ENV.
 */

import { logger, useLogger, withLogging, dev } from "./logger";

// Exemplo 1: Uso básico dos níveis de log
export function exemploNiveisLog() {
  logger.debug("Este é um log de debug", { exemplo: 1 });
  logger.info("Este é um log de informação", { exemplo: 2 });
  logger.warn("Este é um log de warning", { exemplo: 3 });
  logger.error("Este é um log de erro", new Error("Erro de exemplo"), {
    exemplo: 4,
  });
}

// Exemplo 2: Log estruturado customizado
export function exemploLogEstruturado() {
  logger.structured("info", "Operação personalizada executada", {
    operacao: "processamento-dados",
    usuario: "user123",
    dados: { total: 100, processados: 85 },
    performance: { duracao: 250 },
  });
}

// Exemplo 3: Usando hook do React
export function ExemploComponenteReact() {
  const log = useLogger("ExemploComponenteReact");

  log.info("Componente renderizado", { props: { id: 123 } });
  log.debug("Estado atualizado", { novoEstado: { count: 1 } });

  return null; // Componente de exemplo
}

// Exemplo 4: Decorator para logging automático
const funcaoComLogging = withLogging(function processarDados(dados: any[]) {
  // Simular processamento
  return dados.map((item) => ({ ...item, processed: true }));
}, "processarDados");

// Exemplo 5: Logs de performance
export function exemploPerformance() {
  const startTime = performance.now();

  // Simular operação
  for (let i = 0; i < 1000000; i++) {
    // operação custosa
  }

  logger.performance("Operação custosa", startTime, {
    iteracoes: 1000000,
    tipo: "processamento",
  });
}

// Exemplo 6: Logs de ação do usuário
export function exemploAcaoUsuario() {
  logger.userAction("create_transaction", "user123", {
    type: "EXPENSE",
    amount: 50.0,
    category: "food",
  });

  logger.userAction("export_data", "user456", {
    format: "csv",
    dateRange: "last-month",
  });
}

// Exemplo 7: Logs de API
export function exemploAPICall() {
  // Simular chamada API bem-sucedida
  logger.apiCall("GET", "/api/transactions", 200, 150);

  // Simular chamada API com erro
  logger.apiCall("POST", "/api/transactions", 422, 300);
}

// Exemplo 8: Utilitários de desenvolvimento
export function exemploUtilitariosDesenvolvimento() {
  dev.log("Este log só aparece em desenvolvimento");
  dev.render("ComponenteExemplo", { id: 123, name: "teste" });
  dev.api("/api/users", { total: 50, page: 1 });
}

// Exemplo 9: Configurações dinâmicas
export function exemploConfiguracoesDinamicas() {
  // Ver configurações atuais
  console.log("Nível atual:", logger.getLogLevel());
  console.log("Métricas:", logger.getMetrics());

  // Alterar nível dinamicamente (útil para debug)
  logger.setLogLevel("debug");
  logger.debug("Debug habilitado dinamicamente");

  // Voltar ao nível anterior
  logger.setLogLevel("info");
}

// Exemplo 10: Padrão de uso em actions do servidor
export async function exemploServerAction() {
  const startTime = performance.now();

  try {
    logger.info("Iniciando server action", {
      action: "createTransaction",
      userId: "user123",
    });

    // Simular operação do servidor
    await new Promise((resolve) => setTimeout(resolve, 100));

    logger.performance("createTransaction", startTime);
    logger.info("Server action concluída com sucesso");

    return { success: true };
  } catch (error) {
    logger.error("Erro na server action", error as Error, {
      action: "createTransaction",
      userId: "user123",
    });

    return { success: false, error: "Erro interno" };
  }
}
