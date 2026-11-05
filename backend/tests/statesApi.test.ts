import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';

describe('States REST API Endpoints', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /health & GET /api/health', () => {
    it('returns status 200 and healthy db status on /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', db: 'connected' });
    });

    it('returns status 200 and healthy db status on /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', db: 'connected' });
    });
  });

  describe('GET /states & GET /api/states', () => {
    it('returns array of all 51 states via /states', async () => {
      const res = await request(app).get('/states');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(51);

      const firstState = res.body[0];
      expect(firstState).toHaveProperty('id');
      expect(firstState).toHaveProperty('state');
      expect(firstState).toHaveProperty('population');
      expect(firstState).toHaveProperty('counties');
      expect(firstState).toHaveProperty('detail');
    });

    it('returns array of all 51 states via /api/states with identical schema', async () => {
      const res = await request(app).get('/api/states');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(51);
    });
  });

  describe('GET /state/:name & GET /api/state/:name', () => {
    it('returns counties array for Alabama via /state/Alabama', async () => {
      const res = await request(app).get('/state/Alabama');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(67);
    });

    it('returns counties array for a valid state via /api/state/Alabama', async () => {
      const res = await request(app).get('/api/state/Alabama');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(67);

      const firstCounty = res.body[0];
      expect(firstCounty).toHaveProperty('county');
      expect(firstCounty).toHaveProperty('population');
    });

    it('correctly handles state names with spaces (New York)', async () => {
      const res = await request(app).get('/api/state/New%20York');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(62);
    });

    it('returns 404 for an invalid state name', async () => {
      const res = await request(app).get('/api/state/Atlantis');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('handles encoded percent literals (%25) safely without 500 crashes', async () => {
      const res = await request(app).get('/api/state/%25');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'State not found: %' });
    });

    it('returns predictable JSON 400 on malformed URL encoding instead of HTML stack trace', async () => {
      const res = await request(app).get('/api/state/%');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid URL encoding' });
    });

    it('returns exact county demographic sum for Iowa preserving the +1 discrepancy', async () => {
      const res = await request(app).get('/api/state/Iowa');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(99);

      const sum = res.body.reduce(
        (acc: number, c: { population: number }) => acc + c.population,
        0
      );
      expect(sum).toBe(3090416);
    });
  });

  describe('Unknown API Endpoints & 404 Routing', () => {
    it('returns JSON 404 for unknown sub-routes under /states/', async () => {
      const res = await request(app).get('/states/typo');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Endpoint not found' });
    });

    it('returns JSON 404 for unknown sub-routes under /api/', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Endpoint not found' });
    });

    it('returns JSON 404 for arbitrary non-existing routes', async () => {
      const res = await request(app).get('/unhandled/endpoint/test');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Endpoint not found' });
    });
  });
});
