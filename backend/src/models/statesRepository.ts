import { pool } from '../config/db.js';

export interface StateRecord {
  id: number;
  state: string;
  population: number;
  counties: number;
  detail: string;
}

export interface CountyRecord {
  county: string;
  population: number;
}

export async function findAllStates(): Promise<StateRecord[]> {
  const result = await pool.query(
    `SELECT id, name AS state, population, county_count AS counties, detail_url AS detail
     FROM states
     ORDER BY name ASC`
  );
  return result.rows;
}

export async function findStateByName(stateName: string) {
  const result = await pool.query(
    `SELECT id, name AS state, population, county_count AS counties, detail_url AS detail
     FROM states
     WHERE LOWER(name) = LOWER($1)`,
    [stateName]
  );
  return result.rows[0] || null;
}

export async function findCountiesByStateName(stateName: string): Promise<CountyRecord[] | null> {
  const state = await findStateByName(stateName);
  if (!state) {
    return null;
  }

  const result = await pool.query(
    `SELECT name AS county, population
     FROM counties
     WHERE state_id = $1
     ORDER BY name ASC`,
    [state.id]
  );
  return result.rows;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT 1');
    return res.rowCount === 1;
  } catch {
    return false;
  }
}
