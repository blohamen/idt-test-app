import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgrespassword@localhost:5432/states_db';

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err: Error) => {
  console.error('[db] Unexpected idle client error:', err.message);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
