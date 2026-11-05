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

  // Explicitly return JSON 404 for unknown API subpaths so SPA fallback doesn't mask them
  app.all(['/states/*', '/state', '/state/*/*', '/api/*'], (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

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

    // SPA fallback: serve index.html only for browser navigation (HTML requests outside API paths)
    app.get('*', (req, res, next) => {
      if (req.accepts('html')) {
        res.sendFile(path.join(staticDir, 'index.html'));
      } else {
        next();
      }
    });
  }

  // Fallback 404 for non-HTML unmatched routes
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Predictable JSON error handler middleware (catches URIError and uncaught exceptions)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof URIError) {
      res.status(400).json({ error: 'Invalid URL encoding' });
      return;
    }
    console.error('[app] Unhandled server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

export const app = createApp();
