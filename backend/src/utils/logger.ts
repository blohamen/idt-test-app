export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  [key: string]: unknown;
}

export class Logger {
  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown
  ): string {
    const timestamp = new Date().toISOString();
    const isProduction = process.env.NODE_ENV === 'production';

    const serializedError = error
      ? error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { value: String(error) }
      : undefined;

    if (isProduction) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...(context && Object.keys(context).length > 0 ? { context } : {}),
        ...(serializedError ? { error: serializedError } : {}),
      });
    }

    const contextStr =
      context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    const errStr = serializedError?.stack
      ? `\n${serializedError.stack}`
      : serializedError?.message
        ? ` (${serializedError.message})`
        : '';

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatLog('info', message, context));
  }

  warn(message: string, context?: LogContext, error?: unknown): void {
    console.warn(this.formatLog('warn', message, context, error));
  }

  error(message: string, context?: LogContext, error?: unknown): void {
    console.error(this.formatLog('error', message, context, error));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
      console.debug(this.formatLog('debug', message, context));
    }
  }
}

export const logger = new Logger();
