import type { Server } from 'http';
import { logger } from './logger.js';

export interface ClosablePool {
  end: () => Promise<void>;
}

export interface GracefulShutdownOptions {
  timeoutMs?: number;
  onBeforeExit?: (code: number) => void;
}

export function setupGracefulShutdown(
  httpServer: Server,
  dbPool: ClosablePool,
  options: GracefulShutdownOptions = {}
) {
  let isShuttingDown = false;
  const timeoutMs = options.timeoutMs ?? 10000;

  async function shutdown(signal: string, exitCode = 0): Promise<void> {
    if (isShuttingDown) {
      logger.warn(`Shutdown already in progress, ignoring signal: ${signal}`);
      return;
    }
    isShuttingDown = true;
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);

    const forceExitTimeout = setTimeout(() => {
      logger.error(`Graceful shutdown timed out (${timeoutMs}ms), forcing process termination`);
      if (options.onBeforeExit) {
        options.onBeforeExit(1);
      } else if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }, timeoutMs);
    forceExitTimeout.unref();

    try {
      // 1. Stop accepting new connections and close active HTTP connections
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server', {}, err);
            return reject(err);
          }
          logger.info('HTTP server closed successfully');
          resolve();
        });
      });

      // 2. Close PostgreSQL connection pool
      logger.info('Closing database pool...');
      await dbPool.end();
      logger.info('Database pool closed successfully');

      clearTimeout(forceExitTimeout);
      logger.info('Graceful shutdown completed successfully');

      if (options.onBeforeExit) {
        options.onBeforeExit(exitCode);
      } else if (process.env.NODE_ENV !== 'test') {
        process.exit(exitCode);
      }
    } catch (err) {
      logger.error('Error during graceful shutdown', {}, err);
      if (options.onBeforeExit) {
        options.onBeforeExit(1);
      } else if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }
  }

  return shutdown;
}
