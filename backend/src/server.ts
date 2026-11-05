import { app } from './app.js';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import { logger } from './utils/logger.js';
import { setupGracefulShutdown } from './utils/shutdown.js';
import type { Server } from 'http';

dotenv.config();

const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5001);

export const server: Server = app.listen(port, () => {
  logger.info(`State Population Browser listening on port ${port}`, {
    port,
    env: process.env.NODE_ENV || 'development',
  });
});

export const gracefulShutdown = setupGracefulShutdown(server, pool);

// Register process listeners for the active server
process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM', 0);
});

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT', 0);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception detected! Initiating graceful shutdown...', {}, err);
  void gracefulShutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection detected! Initiating graceful shutdown...', {}, reason);
  void gracefulShutdown('unhandledRejection', 1);
});
