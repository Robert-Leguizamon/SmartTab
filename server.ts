import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { errorHandler } from './server/middlewares/errorHandler';
import archiveRoutes from './server/routes/archiveRoutes';

import { isDbConnected } from './server/db/database';

async function startServer(): Promise<void> {
  const app = express();
  const PORT = 3000;

  // Basic Body Parsers & CORS
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'smart-tab-archive',
      timestamp: new Date().toISOString(),
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      database: 'Supabase PostgreSQL',
      isPostgresConnected: isDbConnected(),
    });
  });

  // Main API routes
  app.use('/api/v1/archive', archiveRoutes);

  // Global Error Handler
  app.use(errorHandler);

  // Vite Middleware Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Tab Archive] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Error]:', err);
  process.exit(1);
});
