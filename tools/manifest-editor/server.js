import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { errorHandler } from './backend/middleware/error-handler.js';

// Routes
import statusRouter from './backend/routes/status.js';
import boardsRouter from './backend/routes/boards.js';
import platformsRouter from './backend/routes/platforms.js';
import demosRouter from './backend/routes/demos.js';
import skillsRouter from './backend/routes/skills.js';
import imagesRouter from './backend/routes/images.js';
import demoImagesRouter from './backend/routes/demo-images.js';
import platformImagesRouter from './backend/routes/platform-images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/status', statusRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/platforms', platformsRouter);
app.use('/api/demos', demosRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/demo-images', demoImagesRouter);
app.use('/api/platform-images', platformImagesRouter);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const port = config.port;
const host = config.host;

app.listen(port, host, () => {
  console.log(`✓ Manifest Editor running at http://${host}:${port}`);
  console.log(`✓ Repository: ${config.gitRepoPath}`);
  console.log(`✓ Auto-commit: ${config.autoCommit}`);
  console.log(`✓ Auto-push: ${config.autoPush}`);
});
