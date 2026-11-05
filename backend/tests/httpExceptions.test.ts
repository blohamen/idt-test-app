import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '../src/errors/httpExceptions.js';
import { asyncHandler } from '../src/utils/asyncHandler.js';
import { createApp } from '../src/app.js';

describe('HttpException class hierarchy', () => {
  it('instantiates base HttpException correctly with string message', () => {
    const error = new HttpException('Forbidden resource', 403);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpException);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden resource');
    expect(error.isOperational).toBe(true);
    expect(error.getResponse()).toEqual({ error: 'Forbidden resource' });
  });

  it('instantiates base HttpException with object response', () => {
    const customResponse = { status: 'error', reason: 'quota_exceeded' };
    const error = new HttpException(customResponse, 429);
    expect(error.statusCode).toBe(429);
    expect(error.getResponse()).toEqual(customResponse);
  });

  it('creates standard 4xx and 5xx exception subclasses', () => {
    const badReq = new BadRequestException('Invalid format');
    expect(badReq.statusCode).toBe(400);
    expect(badReq.getResponse()).toEqual({ error: 'Invalid format' });

    const unauth = new UnauthorizedException();
    expect(unauth.statusCode).toBe(401);
    expect(unauth.getResponse()).toEqual({ error: 'Unauthorized' });

    const forbidden = new ForbiddenException();
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.getResponse()).toEqual({ error: 'Forbidden' });

    const notFound = new NotFoundException('User not found');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.getResponse()).toEqual({ error: 'User not found' });

    const conflict = new ConflictException('Already exists');
    expect(conflict.statusCode).toBe(409);
    expect(conflict.getResponse()).toEqual({ error: 'Already exists' });

    const internal = new InternalServerErrorException();
    expect(internal.statusCode).toBe(500);
    expect(internal.isOperational).toBe(false);
    expect(internal.getResponse()).toEqual({ error: 'Internal server error' });

    const serviceUnavail = new ServiceUnavailableException({ status: 'error', db: 'disconnected' });
    expect(serviceUnavail.statusCode).toBe(503);
    expect(serviceUnavail.getResponse()).toEqual({ status: 'error', db: 'disconnected' });
  });
});

describe('asyncHandler & HttpException integration in Express pipeline', () => {
  it('correctly catches thrown HttpException and translates to proper HTTP status and JSON', async () => {
    const router = express.Router();

    router.get(
      '/throw-not-found',
      asyncHandler(async () => {
        throw new NotFoundException('Item does not exist');
      })
    );

    router.get(
      '/throw-custom-object',
      asyncHandler(async () => {
        throw new ServiceUnavailableException({ code: 'MAINTENANCE', retryAfter: 60 });
      })
    );

    const app = createApp(router);

    const notFoundRes = await request(app).get('/api/throw-not-found');
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.body).toEqual({ error: 'Item does not exist' });

    const customRes = await request(app).get('/api/throw-custom-object');
    expect(customRes.status).toBe(503);
    expect(customRes.body).toEqual({ code: 'MAINTENANCE', retryAfter: 60 });
  });
});
