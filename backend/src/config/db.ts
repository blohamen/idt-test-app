import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgrespassword@localhost:5432/states_db';

export const pool = new Pool({
  connectionString,
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
