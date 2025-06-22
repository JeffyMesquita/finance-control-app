/**
 * Sistema de Logging Inteligente - FinanceTrack
 *
 * Features:
 * - Logs condicionais baseados no ambiente
 * - Diferentes níveis de log (debug, info, warn, error)
 * - Integração com Sentry em produção
 * - Formatação consistente
 * - Performance otimizada
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  data?: any;
  timestamp?: string;
  error?: Error | string;
  duration?: number;
  method?: string;
  url?: string;
  status?: number;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private isTest: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
    this.isTest = process.env.NODE_ENV === "test";
  }

  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.formatLog("debug", message, context);
    }
  }

  /**
   * Log de informação - desenvolvimento e staging
   */
  info(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      this.formatLog("info", message, context);
    }

    // Em produção, enviar apenas para ferramentas de monitoramento
    if (this.isProduction) {
      this.sendToMonitoring("info", message, context);
    }
  }

  /**
   * Log de warning - todos os ambientes
   */
  warn(message: string, context?: LogContext): void {
    this.formatLog("warn", message, context);

    if (this.isProduction) {
      this.sendToMonitoring("warn", message, context);
    }
  }

  /**
   * Log de erro - todos os ambientes + Sentry
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.formatLog("error", message, { ...context, error: error?.stack });

    // Sempre enviar erros para monitoramento
    this.sendToMonitoring("error", message, { ...context, error });

    // Em produção, enviar para Sentry
    if (this.isProduction && typeof window !== "undefined") {
      try {
        // @ts-ignore - Sentry será carregado dinamicamente
        window.Sentry?.captureException(error || new Error(message), {
          tags: { component: context?.component },
          extra: context,
        });
      } catch (e) {
        // Fail silently se Sentry não estiver disponível
      }
    }
  }

  /**
   * Log de performance - timing de operações
   */
  performance(label: string, startTime: number, context?: LogContext): void {
    const duration = performance.now() - startTime;
    const message = `⚡ ${label}: ${duration.toFixed(2)}ms`;

    if (this.isDevelopment) {
      console.log(
        `%c${message}`,
        "color: #10b981; font-weight: bold;",
        context || ""
      );
    }

    // Alertar se operação demorar muito
    if (duration > 1000) {
      this.warn(`Operação lenta detectada: ${label}`, { ...context, duration });
    }
  }

  /**
   * Log específico para ações do usuário
   */
  userAction(action: string, userId: string, data?: any): void {
    const context: LogContext = {
      userId,
      action,
      data,
      timestamp: new Date().toISOString(),
    };

    this.info(`🎯 User Action: ${action}`, context);
  }

  /**
   * Log específico para API calls
   */
  apiCall(method: string, url: string, status: number, duration: number): void {
    const isError = status >= 400;
    const emoji = isError ? "❌" : "✅";
    const message = `${emoji} ${method} ${url} - ${status} (${duration}ms)`;

    if (isError) {
      this.error(message, undefined, { method, url, status, duration });
    } else {
      this.info(message, { method, url, status, duration });
    }
  }

  /**
   * Formatação consistente dos logs
   */
  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    if (this.isTest) return; // Não logar em testes

    const emoji = this.getLogEmoji(level);
    const formattedMessage = `${emoji} [${level.toUpperCase()}] ${message}`;

    const logMethod = this.getConsoleMethod(level);
    const color = this.getLogColor(level);

    if (context) {
      logMethod(
        `%c${formattedMessage}`,
        `color: ${color}; font-weight: bold;`,
        context
      );
    } else {
      logMethod(`%c${formattedMessage}`, `color: ${color}; font-weight: bold;`);
    }
  }

  /**
   * Enviar logs para ferramentas de monitoramento em produção
   */
  private sendToMonitoring(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    if (typeof window === "undefined") return;

    try {
      // Exemplo com Vercel Analytics
      if (window.va) {
        // Usar o método track padrão do Vercel Analytics
        window.va("event", {
          name: "Log Event",
          data: {
            level,
            message: message.substring(0, 100), // Limitar tamanho
            component: context?.component,
            userId: context?.userId,
          },
        });
      }
    } catch (e) {
      // Fail silently para não quebrar a aplicação
    }
  }

  private getLogEmoji(level: LogLevel): string {
    const emojis = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    };
    return emojis[level];
  }

  private getLogColor(level: LogLevel): string {
    const colors = {
      debug: "#6b7280",
      info: "#3b82f6",
      warn: "#f59e0b",
      error: "#ef4444",
    };
    return colors[level];
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    const methods = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
    return methods[level] || console.log;
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Hook para logs de componentes React
 */
export function useLogger(componentName: string) {
  return {
    debug: (message: string, data?: any) =>
      logger.debug(message, { component: componentName, data }),
    info: (message: string, data?: any) =>
      logger.info(message, { component: componentName, data }),
    warn: (message: string, data?: any) =>
      logger.warn(message, { component: componentName, data }),
    error: (message: string, error?: Error, data?: any) =>
      logger.error(message, error, { component: componentName, data }),
  };
}

/**
 * Decorator para logar execução de funções
 */
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now();

    try {
      const result = fn(...args);

      // Se for uma Promise, aguardar e logar
      if (result instanceof Promise) {
        return result
          .then((data) => {
            logger.performance(functionName, startTime);
            return data;
          })
          .catch((error) => {
            logger.error(`Erro em ${functionName}`, error);
            throw error;
          });
      }

      logger.performance(functionName, startTime);
      return result;
    } catch (error) {
      logger.error(`Erro em ${functionName}`, error as Error);
      throw error;
    }
  }) as T;
}

/**
 * Utilitários para desenvolvimento
 */
export const dev = {
  /**
   * Log apenas em desenvolvimento
   */
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 DEV: ${message}`, data || "");
    }
  },

  /**
   * Log de render de componentes
   */
  render: (componentName: string, props?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `%c🎨 Render: ${componentName}`,
        "color: #8b5cf6; font-weight: bold;",
        props || ""
      );
    }
  },

  /**
   * Log de API responses
   */
  api: (url: string, data: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `%c📡 API Response: ${url}`,
        "color: #059669; font-weight: bold;",
        data
      );
    }
  },
};

// Tipos para TypeScript
declare global {
  interface Window {
    Sentry?: any; // Sentry
  }
}

export default logger;
