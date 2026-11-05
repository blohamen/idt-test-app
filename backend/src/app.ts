import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import routes from './routes/statesRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(customRoutes?: express.Router) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const activeRoutes = customRoutes || routes;

  // Mount API routes under /api only
  app.use('/api', activeRoutes);

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

    // SPA fallback: serve index.html only for direct browser navigation (GET/HEAD with text/html outside /api)
    app.get('*', (req, res, next) => {
      const isHtmlNavigation =
        (req.method === 'GET' || req.method === 'HEAD') &&
        Boolean(req.headers.accept?.includes('text/html')) &&
        !req.path.startsWith('/api');

      if (isHtmlNavigation) {
        res.sendFile(path.join(staticDir, 'index.html'));
      } else {
        next();
      }
    });
  }

  // 404 handler for unhandled API and resource routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
