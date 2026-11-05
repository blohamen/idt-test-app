import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';
import { runMigrations } from './migrate.js';

interface RawState {
  state: string;
  population: number;
  counties: number;
  detail: string;
}

interface RawCounty {
  county: string;
  population: number;
}

function resolveMockDir(): string {
  const candidatePaths = [
    path.resolve(process.cwd(), 'mock'),
    path.resolve(process.cwd(), '../mock'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../mock'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../mock'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'usa-states/USA-states.json'))) {
      return candidate;
    }
  }

  throw new Error(`Mock directory not found in candidate paths: ${candidatePaths.join(', ')}`);
}

export async function seedDatabase() {
  await runMigrations();

  const mockDir = resolveMockDir();
  console.log(`[seed] Using mock directory: ${mockDir}`);

  const usaStatesPath = path.join(mockDir, 'usa-states/USA-states.json');
  const usaStates: RawState[] = JSON.parse(fs.readFileSync(usaStatesPath, 'utf-8'));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('[seed] Clearing existing data...');
    await client.query('TRUNCATE TABLE counties, states RESTART IDENTITY CASCADE');

    let totalCountiesInserted = 0;

    for (const rawState of usaStates) {
      // Relative detail URL complying with spec (/api prefix)
      const relativeDetail = `/api/state/${encodeURIComponent(rawState.state)}`;


      const stateInsertResult = await client.query(
        `INSERT INTO states (name, population, county_count, detail_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [rawState.state, rawState.population, rawState.counties, relativeDetail]
      );

      const stateId = stateInsertResult.rows[0].id;

      const countyFilePath = path.join(mockDir, 'states', `${rawState.state}.json`);
      if (!fs.existsSync(countyFilePath)) {
        throw new Error(`County file missing for state: ${rawState.state} at ${countyFilePath}`);
      }

      const counties: RawCounty[] = JSON.parse(fs.readFileSync(countyFilePath, 'utf-8'));

      for (const rawCounty of counties) {
        await client.query(
          `INSERT INTO counties (state_id, name, population)
           VALUES ($1, $2, $3)`,
          [stateId, rawCounty.county, rawCounty.population]
        );
        totalCountiesInserted++;
      }
    }

    // Validation assertions executed inside transaction before COMMIT
    const stateCountRes = await client.query('SELECT COUNT(*) FROM states');
    const countyCountRes = await client.query('SELECT COUNT(*) FROM counties');

    const stateCount = parseInt(stateCountRes.rows[0].count, 10);
    const countyCount = parseInt(countyCountRes.rows[0].count, 10);

    if (stateCount !== 51) {
      throw new Error(`Expected 51 states, but found ${stateCount}`);
    }
    if (countyCount !== 3143) {
      throw new Error(`Expected 3143 counties, but found ${countyCount}`);
    }

    await client.query('COMMIT');

    console.log(`[seed] Seed completed successfully: ${stateCount} states, ${countyCount} counties inserted.`);

    return { stateCount, countyCount };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed] Seed transaction rolled back due to error:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[seed] Fatal seeding error:', err);
      pool.end();
      process.exit(1);
    });
}
