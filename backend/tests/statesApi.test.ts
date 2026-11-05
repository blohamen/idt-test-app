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

  describe('GET /health', () => {
    it('returns status 200 and healthy db status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', db: 'connected' });
    });
  });

  describe('GET /states', () => {
    it('returns array of all 51 states with expected schema', async () => {
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
      expect(firstState.detail).toMatch(/^\/state\//);
    });
  });

  describe('GET /state/:name', () => {
    it('returns counties array for a valid state (Alabama)', async () => {
      const res = await request(app).get('/state/Alabama');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(67);

      const firstCounty = res.body[0];
      expect(firstCounty).toHaveProperty('county');
      expect(firstCounty).toHaveProperty('population');
    });

    it('correctly handles state names with spaces (New York)', async () => {
      const res = await request(app).get('/state/New%20York');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(62);
    });

    it('returns 404 for an invalid state name', async () => {
      const res = await request(app).get('/state/Atlantis');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('returns exact county demographic sum for Iowa preserving the +1 discrepancy', async () => {
      const res = await request(app).get('/state/Iowa');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(99);

      const sum = res.body.reduce((acc: number, c: { population: number }) => acc + c.population, 0);
      expect(sum).toBe(3090416);
    });
  });
});
