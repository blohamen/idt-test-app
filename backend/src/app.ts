import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import routes from './routes/statesRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount API routes
  app.use('/', routes);

  // Serve static frontend assets if available
  const candidateStaticDirs = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(__dirname, '../../../frontend/dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), 'public'),
  ];

  const staticDir = candidateStaticDirs.find((dir) => fs.existsSync(dir));

  if (staticDir) {
    app.use(express.static(staticDir));
    app.get('*', (req, res, next) => {
      if (req.accepts('html')) {
        res.sendFile(path.join(staticDir, 'index.html'));
      } else {
        next();
      }
    });
  }

  return app;
}

export const app = createApp();
