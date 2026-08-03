/**
 * Sistema de Logging Compatível - FinanceTrack
 *
 * Features:
 * - Console aprimorado universal
 * - Logs condicionais baseados no ambiente
 * - Configuração via variáveis de ambiente
 * - 100% compatibilidade servidor/cliente
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
  [key: string]: any;
}

// Configurações baseadas em variáveis de ambiente
const LOG_LEVEL =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");
const isServer = typeof window === "undefined";

class AdvancedConsoleLogger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private isTest: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
    this.isTest = process.env.NODE_ENV === "test";
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      this.logMessage("debug", message, context);
    }
  }

  /**
   * Log de informação
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      this.logMessage("info", message, context);
    }
  }

  /**
   * Log de warning
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      this.logMessage("warn", message, context);
    }
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.stack || error?.message,
      errorName: error?.name,
    };

    this.logMessage("error", message, errorContext);

    if (!isServer) {
      // Sentry apenas no cliente
      if (this.isProduction) {
        try {
          window.Sentry?.captureException(error || new Error(message), {
            tags: { component: context?.component },
            extra: context,
          });
        } catch {
          // Fail silently
        }
      }
    }
  }

  /**
   * Log principal usando console nativo
   */
  private logMessage(level: LogLevel, message: string, context?: LogContext): void {
    if (this.isTest) return;

    const timestamp = new Date().toISOString();
    const emoji = this.getLogEmoji(level);
    const color = this.getLogColor(level);
    const method = this.getConsoleMethod(level);

    // Formato estruturado para produção no servidor
    if (this.isProduction && isServer) {
      const logData = {
        level,
        message,
        timestamp,
        ...context,
      };
      method(JSON.stringify(logData));
      return;
    }

    // Formato colorido para desenvolvimento
    const formattedMessage = `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      method(`%c${formattedMessage}`, `color: ${color}; font-weight: bold;`, context);
    } else {
      method(`%c${formattedMessage}`, `color: ${color}; font-weight: bold;`);
    }
  }

  /**
   * Verifica se deve logar baseado no nível
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(LOG_LEVEL);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Performance timing
   */
  performance(label: string, startTime: number, context?: LogContext): void {
    const duration = performance.now() - startTime;
    const perfContext = { ...context, duration, performance: true };

    this.info(`⚡ Performance: ${label} - ${duration.toFixed(2)}ms`, perfContext);

    if (duration > 1000) {
      this.warn(`Operação lenta detectada: ${label}`, perfContext);
    }
  }

  /**
   * User actions
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
   * API calls
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
   * Log estruturado
   */
  structured(level: LogLevel, message: string, data: Record<string, any>): void {
    this.logMessage(level, message, { ...data, structured: true });
  }

  /**
   * Configurações dinâmicas
   */
  setLogLevel(level: LogLevel): void {
    // Em runtime, apenas afeta logs futuros
    process.env.LOG_LEVEL = level;
  }

  getLogLevel(): string {
    return LOG_LEVEL;
  }

  getMetrics() {
    return {
      level: LOG_LEVEL,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      isServer,
      environment: process.env.NODE_ENV,
    };
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
export const logger = new AdvancedConsoleLogger();

/**
 * Hook para logs de componentes React
 */
export function useLogger(componentName: string) {
  return {
    debug: (message: string, data?: any) =>
      logger.debug(message, { component: componentName, data }),
    info: (message: string, data?: any) => logger.info(message, { component: componentName, data }),
    warn: (message: string, data?: any) => logger.warn(message, { component: componentName, data }),
    error: (message: string, error?: Error, data?: any) =>
      logger.error(message, error, { component: componentName, data }),
    structured: (level: LogLevel, message: string, data?: any) =>
      logger.structured(level, message, { component: componentName, ...data }),
  };
}

/**
 * Decorator para logging
 */
export function withLogging<T extends (...args: any[]) => any>(fn: T, functionName: string): T {
  return ((...args: any[]) => {
    const startTime = performance.now();

    try {
      const result = fn(...args);

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
 * Utilitários para desenvolvimento
 */
export const dev = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      logger.debug(`🚀 DEV: ${message}`, { dev: true, data });
    }
  },

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
    Sentry?: any;
  }
}

export default logger;
