import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { Logger } from '../src/utils/logger.js';
import { createApp } from '../src/app.js';
import { setupGracefulShutdown } from '../src/utils/shutdown.js';
import type { Server } from 'http';

describe('Logger utility', () => {
  let logger: Logger;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger = new Logger();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs info messages with timestamp and level', () => {
    logger.info('Test info message', { key: 'value' });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('[INFO]');
    expect(output).toContain('Test info message');
    expect(output).toContain('"key":"value"');
  });

  it('logs warn messages with optional error stack', () => {
    const error = new Error('Test warning error');
    logger.warn('Test warn message', { path: '/test' }, error);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const output = warnSpy.mock.calls[0][0];
    expect(output).toContain('[WARN]');
    expect(output).toContain('Test warn message');
    expect(output).toContain('Test warning error');
  });

  it('logs error messages with full stack trace', () => {
    const error = new Error('Fatal database connection error');
    logger.error('Database query failed', { query: 'SELECT 1' }, error);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const output = errorSpy.mock.calls[0][0];
    expect(output).toContain('[ERROR]');
    expect(output).toContain('Database query failed');
    expect(output).toContain('Fatal database connection error');
  });

  it('formats output as JSON in production environment', () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const err = new Error('Production error');
      logger.error('Something broke in prod', { userId: 42 }, err);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('Something broke in prod');
      expect(parsed.context).toEqual({ userId: 42 });
      expect(parsed.error.message).toBe('Production error');
      expect(parsed.timestamp).toBeDefined();
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});

describe('Centralized Express Error Handling', () => {
  it('catches unhandled route exceptions, logs error and returns 500 JSON', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const testRouter = express.Router();

    testRouter.get('/test-error', () => {
      throw new Error('Unexpected simulated failure');
    });

    const app = createApp(testRouter);

    const res = await request(app).get('/test-error');
    expect(res.status).toBe(500);

    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});

describe('Graceful Shutdown', () => {
  it('closes HTTP server and database pool cleanly on shutdown trigger', async () => {
    let serverClosed = false;
    let poolClosed = false;

    const mockHttpServer = {
      close: (cb: (err?: Error) => void) => {
        serverClosed = true;
        cb();
        return mockHttpServer;
      },
    } as unknown as Server;

    const mockDbPool = {
      end: async () => {
        poolClosed = true;
      },
    };

    const shutdown = setupGracefulShutdown(mockHttpServer, mockDbPool);
    await shutdown('SIGTERM', 0);

    expect(serverClosed).toBe(true);
    expect(poolClosed).toBe(true);
  });
});
