import { Request, Response } from 'express';
import { findAllStates, findCountiesByStateName, checkHealth } from '../models/statesRepository.js';
import { logger } from '../utils/logger.js';
import {
  NotFoundException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '../errors/httpExceptions.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStatesHandler = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const states = await findAllStates();
      res.json(states);
    } catch (err) {
      logger.error('Failed to retrieve states', { controller: 'getStatesHandler' }, err);
      throw new InternalServerErrorException('Failed to retrieve states');
    }
  }
);

export const getStateDetailHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const stateName = req.params.name;
    let counties;

    try {
      counties = await findCountiesByStateName(stateName);
    } catch (err) {
      logger.error(
        'Failed to retrieve state details',
        { controller: 'getStateDetailHandler', state: req.params.name },
        err
      );
      throw new InternalServerErrorException('Failed to retrieve state details');
    }

    if (!counties) {
      throw new NotFoundException(`State not found: ${stateName}`);
    }

    res.json(counties);
  }
);

export const getHealthHandler = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const isHealthy = await checkHealth();
      if (isHealthy) {
        res.json({ status: 'ok', db: 'connected' });
      } else {
        throw new ServiceUnavailableException({ status: 'error', db: 'disconnected' });
      }
    } catch (err) {
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      logger.error('Health check failed', { controller: 'getHealthHandler' }, err);
      throw new ServiceUnavailableException({ status: 'error', db: 'disconnected' });
    }
  }
);
