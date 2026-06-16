import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Git
  gitRepoPath: path.resolve(__dirname, process.env.GIT_REPO_PATH || '../..'),
  gitAuthorName: process.env.GIT_AUTHOR_NAME || 'Manifest Editor',
  gitAuthorEmail: process.env.GIT_AUTHOR_EMAIL || 'editor@tuyaopen.dev',
  gitBranch: process.env.GIT_BRANCH || 'main',
  autoCommit: process.env.AUTO_COMMIT === 'true',
  autoPush: process.env.AUTO_PUSH === 'true',
  pushInterval: parseInt(process.env.PUSH_INTERVAL || '30000', 10),

  // Images
  imageMaxSize: parseInt(process.env.IMAGE_MAX_SIZE || '5242880', 10),
  imageQuality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
  imageMaxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || '500', 10),
  imageMaxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT || '500', 10),
  imageMinDimension: 500,
  imageMaxFileSize: 1024 * 1024, // 1MB output target
  imageSpecs: {
    board: { width: 500, height: 500, aspectRatio: 1, label: '500×500 (1:1)' },
    demo: { width: 960, height: 540, aspectRatio: 16 / 9, label: '960×540 (16:9)' },
    platform: { width: 500, height: 500, aspectRatio: 1, label: '500×500 (1:1)' },
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Paths
  paths: {
    boards: path.resolve(__dirname, process.env.GIT_REPO_PATH || '../..', 'boards-and-chips'),
    demos: path.resolve(__dirname, process.env.GIT_REPO_PATH || '../..', 'demos'),
    platforms: path.resolve(__dirname, process.env.GIT_REPO_PATH || '../..', 'platforms'),
    images: path.resolve(__dirname, process.env.GIT_REPO_PATH || '../..', 'boards-and-chips', 'images'),
    demoImages: path.resolve(__dirname, process.env.GIT_REPO_PATH || '../..', 'demos', 'images'),
    platformImages: path.resolve(__dirname, process.env.GIT_REPO_PATH || '../..', 'platforms', 'images'),
    uploads: path.join(__dirname, 'uploads'), // Temporary upload directory
  },
};

export default config;
