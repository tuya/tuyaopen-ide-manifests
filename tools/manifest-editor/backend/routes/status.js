import express from 'express';
import { gitSync } from '../services/git-sync.js';
import { manifestLoader } from '../services/manifest-loader.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

// GET /api/status - Return system status
router.get('/', asyncHandler(async (req, res) => {
  try {
    // Load initial manifests
    await manifestLoader.loadBoards();
    await manifestLoader.loadPlatforms();
    await manifestLoader.loadTags();

    // Get git status
    const gitStatus = await gitSync.getStatus();

    // Get commit history
    const history = await gitSync.getCommitHistory(10);

    // Get boards and tags count
    const boards = manifestLoader.getBoards();
    const tags = manifestLoader.getTags();
    const boardCount = boards?.items?.length || 0;
    const tagCount = tags?.categories?.reduce((sum, cat) => sum + (cat.tags?.length || 0), 0) || 0;

    res.json({
      success: true,
      editor: {
        version: '0.1.0',
        ready: true,
      },
      manifests: {
        boards: boardCount,
        tags: tagCount,
        lastLoaded: new Date().toISOString(),
      },
      git: {
        branch: gitStatus.branch,
        dirty: gitStatus.dirty,
        ahead: gitStatus.ahead,
        behind: gitStatus.behind,
        uncommitted: gitStatus.uncommitted.length,
        files: gitStatus.uncommitted.slice(0, 5),
      },
      history: history.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}));

// GET /api/status/git - Return git status only
router.get('/git', asyncHandler(async (req, res) => {
  const gitStatus = await gitSync.getStatus();
  const history = await gitSync.getCommitHistory(20);

  res.json({
    branch: gitStatus.branch,
    dirty: gitStatus.dirty,
    ahead: gitStatus.ahead,
    behind: gitStatus.behind,
    uncommitted: gitStatus.uncommitted,
    history,
  });
}));

// POST /api/status/pull - Pull latest changes
router.post('/pull', asyncHandler(async (req, res) => {
  const result = await gitSync.pull();
  const newStatus = await gitSync.getStatus();

  res.json({
    success: true,
    message: result.message,
    status: newStatus,
  });
}));

// GET /api/tags - Return available tags
router.get('/tags', asyncHandler(async (req, res) => {
  await manifestLoader.loadTags();
  const tagsData = manifestLoader.getTags();

  if (!tagsData) {
    return res.status(404).json({
      success: false,
      error: 'Tags manifest not found',
    });
  }

  res.json({
    success: true,
    categories: tagsData.categories || [],
  });
}));

export default router;
