import type { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import { logger } from '../utils/logger.js';
import { HttpException, NotFoundException } from '../errors/httpExceptions.js';

/**
 * Universal fallback handler for unhandled routes,
 * forwarding a NotFoundException to the centralized error handler.
 */
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new NotFoundException('Endpoint not found'));
};

/**
 * Centralized Express error handler middleware.
 * Translates known exceptions (URIError, HttpException) and unhandled errors into predictable JSON responses.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Handle malformed URL encoding (e.g., % sequences)
  if (err instanceof URIError) {
    logger.warn('Malformed URL requested', {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });
    res.status(400).json({ error: 'Invalid URL encoding' });
    return;
  }

  // 2. Handle structured HttpExceptions (BadRequest, NotFound, etc.)
  if (err instanceof HttpException) {
    const status = err.statusCode;
    if (status >= 500) {
      logger.error(
        `Server exception (${status}): ${err.message}`,
        {
          method: req.method,
          path: req.originalUrl,
          ip: req.ip,
          query: req.query,
        },
        err
      );
    } else {
      logger.warn(`Client exception (${status}): ${err.message}`, {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
      });
    }

    res.status(status).json(err.getResponse());
    return;
  }

  // 3. Handle unexpected 500 errors
  logger.error(
    'Unhandled server error during request execution',
    {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      query: req.query,
    },
    err
  );

  const status = typeof (err as any)?.status === 'number' ? (err as any).status : 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : ((err as any)?.message || 'Internal server error'),
  });
};
