import { Request, Response } from 'express';
import {
  findAllStates,
  findCountiesByStateName,
  checkHealth,
} from '../models/statesRepository.js';

export async function getStatesHandler(_req: Request, res: Response): Promise<void> {
  try {
    const states = await findAllStates();
    res.json(states);
  } catch (err) {
    console.error('[statesController] getStatesHandler error:', err);
    res.status(500).json({ error: 'Failed to retrieve states' });
  }
}

export async function getStateDetailHandler(req: Request, res: Response): Promise<void> {
  try {
    const stateName = req.params.name;
    const counties = await findCountiesByStateName(stateName);

    if (!counties) {
      res.status(404).json({ error: `State not found: ${stateName}` });
      return;
    }

    res.json(counties);
  } catch (err) {
    console.error('[statesController] getStateDetailHandler error:', err);
    res.status(500).json({ error: 'Failed to retrieve state details' });
  }
}

export async function getHealthHandler(_req: Request, res: Response): Promise<void> {
  const isHealthy = await checkHealth();
  if (isHealthy) {
    res.json({ status: 'ok', db: 'connected' });
  } else {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
}
