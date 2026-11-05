export interface HttpExceptionOptions {
  cause?: unknown;
}

export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly response: string | Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    response: string | Record<string, unknown>,
    statusCode: number,
    options?: HttpExceptionOptions
  ) {
    const message =
      typeof response === 'string'
        ? response
        : (response.message as string) || (response.error as string) || 'Http Exception';

    super(message, { cause: options?.cause });
    this.statusCode = statusCode;
    this.response = response;
    this.isOperational = statusCode < 500;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  public getResponse(): Record<string, unknown> {
    if (typeof this.response === 'string') {
      return { error: this.response };
    }
    return this.response;
  }
}

export class BadRequestException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = 'Bad Request',
    options?: HttpExceptionOptions
  ) {
    super(response, 400, options);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = 'Unauthorized',
    options?: HttpExceptionOptions
  ) {
    super(response, 401, options);
  }
}

export class ForbiddenException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = 'Forbidden',
    options?: HttpExceptionOptions
  ) {
    super(response, 403, options);
  }
}

export class NotFoundException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = 'Endpoint not found',
    options?: HttpExceptionOptions
  ) {
    super(response, 404, options);
  }
}

export class ConflictException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = 'Conflict',
    options?: HttpExceptionOptions
  ) {
    super(response, 409, options);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = 'Internal server error',
    options?: HttpExceptionOptions
  ) {
    super(response, 500, options);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = 'Service Unavailable',
    options?: HttpExceptionOptions
  ) {
    super(response, 503, options);
  }
}

// Convenient error-naming aliases
export {
  BadRequestException as BadRequestError,
  UnauthorizedException as UnauthorizedError,
  ForbiddenException as ForbiddenError,
  NotFoundException as NotFoundError,
  ConflictException as ConflictError,
  InternalServerErrorException as InternalServerError,
  ServiceUnavailableException as ServiceUnavailableError,
};
