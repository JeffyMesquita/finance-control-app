/**
 * Sistema de Logging Avançado com Winston - FinanceTrack
 *
 * Features:
 * - Logs estruturados com Winston (JSON em produção)
 * - Logs condicionais baseados no ambiente
 * - Diferentes níveis de log (debug, info, warn, error)
 * - Configuração via variáveis de ambiente
 * - Rotação automática de arquivos de log
 * - Integração com Sentry em produção
 * - Formatação consistente
 * - Performance otimizada
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

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
  [key: string]: any;
}

// Configurações baseadas em variáveis de ambiente
const LOG_LEVEL =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");
const LOG_TO_FILE =
  process.env.LOG_TO_FILE === "true" || process.env.NODE_ENV === "production";
const LOG_DIR = process.env.LOG_DIR || "./logs";

class AdvancedLogger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private isTest: boolean;
  private winstonLogger: winston.Logger;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
    this.isTest = process.env.NODE_ENV === "test";

    this.winstonLogger = this.createWinstonLogger();
  }

  /**
   * Cria instância configurada do Winston
   */
  private createWinstonLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] })
    );

    const transports: winston.transport[] = [];

    // Console transport (sempre presente)
    if (this.isDevelopment) {
      // Formato colorido para desenvolvimento
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, metadata }) => {
              const emoji = this.getLogEmoji(
                level.replace(/\x1b\[[0-9;]*m/g, "") as LogLevel
              );
              const metaStr =
                Object.keys(metadata).length > 0
                  ? `\n${JSON.stringify(metadata, null, 2)}`
                  : "";
              return `${emoji} [${timestamp}] ${level}: ${message}${metaStr}`;
            })
          ),
        })
      );
    } else {
      // Formato JSON para produção/teste
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(logFormat, winston.format.json()),
        })
      );
    }

    // File transports (apenas em produção ou se configurado)
    if (LOG_TO_FILE && !this.isTest) {
      // Log de todos os níveis
      transports.push(
        new DailyRotateFile({
          filename: `${LOG_DIR}/app-%DATE%.log`,
          datePattern: "YYYY-MM-DD",
          maxFiles: "14d",
          maxSize: "20m",
          format: winston.format.combine(logFormat, winston.format.json()),
        })
      );

      // Log apenas de erros
      transports.push(
        new DailyRotateFile({
          filename: `${LOG_DIR}/error-%DATE%.log`,
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxFiles: "30d",
          maxSize: "20m",
          format: winston.format.combine(logFormat, winston.format.json()),
        })
      );
    }

    return winston.createLogger({
      level: LOG_LEVEL,
      format: logFormat,
      transports,
      exitOnError: false,
      silent: this.isTest, // Silenciar logs em testes
    });
  }

  /**
   * Log de debug - apenas em desenvolvimento ou se LOG_LEVEL=debug
   */
  debug(message: string, context?: LogContext): void {
    this.winstonLogger.debug(message, context);
  }

  /**
   * Log de informação
   */
  info(message: string, context?: LogContext): void {
    this.winstonLogger.info(message, context);

    // Em produção, enviar apenas para ferramentas de monitoramento
    if (this.isProduction) {
      this.sendToMonitoring("info", message, context);
    }
  }

  /**
   * Log de warning - todos os ambientes
   */
  warn(message: string, context?: LogContext): void {
    this.winstonLogger.warn(message, context);

    if (this.isProduction) {
      this.sendToMonitoring("warn", message, context);
    }
  }

  /**
   * Log de erro - todos os ambientes + Sentry
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.stack || error?.message,
      errorName: error?.name,
    };

    this.winstonLogger.error(message, errorContext);

    // Sempre enviar erros para monitoramento
    this.sendToMonitoring("error", message, { ...errorContext, error });

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
    const perfContext = { ...context, duration, performance: true };

    this.winstonLogger.info(
      `⚡ Performance: ${label} - ${duration.toFixed(2)}ms`,
      perfContext
    );

    // Alertar se operação demorar muito
    if (duration > 1000) {
      this.warn(`Operação lenta detectada: ${label}`, perfContext);
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
      userAction: true,
    };

    this.info(`🎯 User Action: ${action}`, context);
  }

  /**
   * Log específico para API calls
   */
  apiCall(method: string, url: string, status: number, duration: number): void {
    const isError = status >= 400;
    const context = { method, url, status, duration, apiCall: true };
    const message = `${method} ${url} - ${status} (${duration}ms)`;

    if (isError) {
      this.error(`❌ API Error: ${message}`, undefined, context);
    } else {
      this.info(`✅ API Success: ${message}`, context);
    }
  }

  /**
   * Log estruturado customizado
   */
  structured(
    level: LogLevel,
    message: string,
    data: Record<string, any>
  ): void {
    this.winstonLogger.log(level, message, { ...data, structured: true });
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

  /**
   * Configurações dinâmicas
   */
  setLogLevel(level: LogLevel): void {
    this.winstonLogger.level = level;
  }

  getLogLevel(): string {
    return this.winstonLogger.level;
  }

  /**
   * Métricas do sistema de logging
   */
  getMetrics() {
    return {
      level: this.winstonLogger.level,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      logToFile: LOG_TO_FILE,
      logDir: LOG_DIR,
      transports: this.winstonLogger.transports.length,
    };
  }
}

// Singleton instance
export const logger = new AdvancedLogger();

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
    structured: (level: LogLevel, message: string, data?: any) =>
      logger.structured(level, message, { component: componentName, ...data }),
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
            logger.performance(functionName, startTime, {
              functionName,
              args: args.length,
            });
            return data;
          })
          .catch((error) => {
            logger.error(`Erro em ${functionName}`, error, {
              functionName,
              args: args.length,
            });
            throw error;
          });
      }

      logger.performance(functionName, startTime, {
        functionName,
        args: args.length,
      });
      return result;
    } catch (error) {
      logger.error(`Erro em ${functionName}`, error as Error, {
        functionName,
        args: args.length,
      });
      throw error;
    }
  }) as T;
}

/**
 * Utilitários para desenvolvimento (mantidos para compatibilidade)
 */
export const dev = {
  /**
   * Log apenas em desenvolvimento
   */
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      logger.debug(`🚀 DEV: ${message}`, { dev: true, data });
    }
  },

  /**
   * Log de render de componentes
   */
  render: (componentName: string, props?: any) => {
    if (process.env.NODE_ENV === "development") {
      logger.debug(`🎨 Render: ${componentName}`, {
        dev: true,
        render: true,
        component: componentName,
        props,
      });
    }
  },

  /**
   * Log de API responses
   */
  api: (url: string, data: any) => {
    if (process.env.NODE_ENV === "development") {
      logger.debug(`📡 API Response: ${url}`, {
        dev: true,
        api: true,
        url,
        data,
      });
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
