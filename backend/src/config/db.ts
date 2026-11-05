import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

// Load .env from current directory, parent directory, or backend directory
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), 'backend/.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD
    ? `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'states_db'}`
    : undefined);

if (!connectionString) {
  throw new Error(
    'Database connection configuration is missing! Please define DATABASE_URL or POSTGRES_USER and POSTGRES_PASSWORD in your .env file.'
  );
}

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected idle PostgreSQL client error', { module: 'db' }, err);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
