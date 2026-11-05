import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';
import { findAllStates, findCountiesByStateName, findStateByName } from '../src/models/statesRepository.js';

describe('Database Seeding Pipeline', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('imports exactly 51 states including District of Columbia', async () => {
    const states = await findAllStates();
    expect(states).toHaveLength(51);

    const dc = states.find((s) => s.state === 'District of Columbia');
    expect(dc).toBeDefined();
    expect(dc?.counties).toBe(1);
  });

  it('imports exactly 3,143 counties', async () => {
    const res = await pool.query('SELECT COUNT(*) FROM counties');
    const totalCounties = parseInt(res.rows[0].count, 10);
    expect(totalCounties).toBe(3143);
  });

  it('correctly maps Texas with 254 counties', async () => {
    const texasCounties = await findCountiesByStateName('Texas');
    expect(texasCounties).not.toBeNull();
    expect(texasCounties?.length).toBe(254);
  });

  it('preserves the Iowa demographic discrepancy (+1 county population sum)', async () => {
    const iowa = await findStateByName('Iowa');
    expect(iowa).toBeDefined();
    expect(iowa?.population).toBe(3090415);
    expect(iowa?.counties).toBe(99);

    const iowaCounties = await findCountiesByStateName('Iowa');
    expect(iowaCounties).toHaveLength(99);

    const countySum = iowaCounties!.reduce((acc, c) => acc + c.population, 0);
    expect(countySum).toBe(3090416);
    expect(countySum - iowa!.population).toBe(1);
  });

  it('rolls back transaction on assertion failure preserving existing data', async () => {
    const statesBefore = await findAllStates();
    expect(statesBefore).toHaveLength(51);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE TABLE counties, states RESTART IDENTITY CASCADE');
      // Simulate count validation failing inside transaction
      const stateCountRes = await client.query('SELECT COUNT(*) FROM states');
      const stateCount = parseInt(stateCountRes.rows[0].count, 10);
      if (stateCount !== 51) {
        throw new Error(`Validation failed: expected 51 states, got ${stateCount}`);
      }
      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      expect(err.message).toContain('Validation failed');
    } finally {
      client.release();
    }

    // After ROLLBACK, previous 51 states remain intact
    const statesAfter = await findAllStates();
    expect(statesAfter).toHaveLength(51);
  });
});
