import express from 'express';
import { manifestLoader } from '../services/manifest-loader.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

const isEmptyObj = (o) => !o || typeof o !== 'object' || Object.keys(o).length === 0;

// Build the incremental detail object: only fields that don't live in the index.
// Strips empty defaultConfig, strips configs[*].overrides, drops all-null readme.
// Returns null when there is nothing detail-specific to store (caller deletes the file).
function buildDemoDetail(id, { defaultConfig, configs, documentation }) {
  const detail = { id };

  if (!isEmptyObj(defaultConfig)) detail.defaultConfig = defaultConfig;

  if (!isEmptyObj(configs)) {
    const cleaned = {};
    for (const [key, val] of Object.entries(configs)) {
      const file = typeof val === 'object' ? val.file : val;
      if (file) cleaned[key] = { file }; // overrides intentionally dropped
    }
    if (!isEmptyObj(cleaned)) detail.configs = cleaned;
  }

  const readme = documentation?.readme;
  const readmeHasValue = readme && Object.values(readme).some((v) => v != null && v !== '');
  if (readmeHasValue) detail.documentation = { readme };

  return Object.keys(detail).length > 1 ? detail : null;
}

// GET /api/demos - List all demos
router.get('/', asyncHandler(async (req, res) => {
  const demos = await manifestLoader.loadDemos();
  res.json({
    success: true,
    demos: demos?.items || [],
    count: demos?.items?.length || 0,
  });
}));

// GET /api/demos/:id - Get single demo (index entry merged with detail delta)
// Detail files are incremental (id + defaultConfig/configs/documentation only);
// identity/classification fields live in index.json. Merge so the editor form
// gets a complete object to populate.
router.get('/:id', asyncHandler(async (req, res) => {
  const demos = await manifestLoader.loadDemos();
  const item = demos?.items?.find(d => d.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: `Demo "${req.params.id}" not found` });
  }
  const detail = await manifestLoader.loadDemoDetail(req.params.id);
  // index first (identity/classification), then overlay detail delta (build/docs)
  const merged = { ...item, ...(detail || {}) };
  res.json({ success: true, demo: merged });
}));

// POST /api/demos - Create new demo
router.post('/', asyncHandler(async (req, res) => {
  const { id, type, name, summary, tags, boards, compatibilityType, source, defaultConfig, configs, documentation, publish } = req.body;

  if (!id || !name?.en || !source?.repo || !source?.subpath) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: id, name.en, source.repo, source.subpath',
    });
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID must be kebab-case (lowercase letters, numbers, hyphens)',
    });
  }

  // Validate configs keys if provided
  if (configs && typeof configs === 'object') {
    const invalidKeys = Object.keys(configs).filter(k => !/^[A-Za-z0-9][A-Za-z0-9_.]*$/.test(k));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid board-symbol keys in configs: ${invalidKeys.join(', ')}. Must be alphanumeric with underscores/dots.`,
      });
    }
    for (const [key, val] of Object.entries(configs)) {
      if (!val.file || typeof val.file !== 'string') {
        return res.status(400).json({
          success: false,
          error: `configs["${key}"].file is required and must be a string`,
        });
      }
    }
  }

  const demos = await manifestLoader.loadDemos();
  if (demos.items.some(d => d.id === id)) {
    return res.status(409).json({ success: false, error: `Demo "${id}" already exists` });
  }

  const indexEntry = {
    id,
    type: type === 'app' ? 'app' : 'example',
    name: name || { en: '' },
    summary: summary || { en: '', 'zh-CN': '' },
    tags: (tags || []).filter(t => t !== 'app' && t !== 'example'),
    boards: boards || [],
    compatibilityType: compatibilityType || 'universal',
    source: {
      repo: source.repo,
      subpath: source.subpath,
      ref: source.ref || 'master',
    },
    publish: publish !== false,
  };

  demos.items.push(indexEntry);
  await manifestLoader.saveDemosIndex(demos);

  // Detail file is incremental: only fields not already in the index entry.
  const detailEntry = buildDemoDetail(id, { defaultConfig, configs, documentation });
  if (detailEntry) await manifestLoader.saveDemoDetail(id, detailEntry);

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`feat(demos): add ${id}`);
  }

  res.status(201).json({ success: true, demo: { ...indexEntry, ...(detailEntry || {}) }, message: `Demo "${id}" created` });
}));

// PATCH /api/demos/:id - Update demo
router.patch('/:id', asyncHandler(async (req, res) => {
  const demos = await manifestLoader.loadDemos();
  const idx = demos.items.findIndex(d => d.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: `Demo "${req.params.id}" not found` });
  }

  const updates = { ...req.body };
  delete updates.id;
  delete updates.autoCommit;

  // Validate configs keys if provided
  if (updates.configs && typeof updates.configs === 'object') {
    const invalidKeys = Object.keys(updates.configs).filter(k => !/^[A-Za-z0-9][A-Za-z0-9_.]*$/.test(k));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid board-symbol keys in configs: ${invalidKeys.join(', ')}. Must be alphanumeric with underscores/dots.`,
      });
    }
  }

  // Update index entry (identity / classification fields only)
  const item = demos.items[idx];
  const indexFields = ['type', 'name', 'summary', 'boards', 'compatibilityType', 'source', 'publish'];
  for (const key of indexFields) {
    if (updates[key] !== undefined) item[key] = updates[key];
  }
  if (updates.type !== undefined) item.type = updates.type === 'app' ? 'app' : 'example';
  if (updates.tags !== undefined) item.tags = updates.tags.filter(t => t !== 'app' && t !== 'example');
  await manifestLoader.saveDemosIndex(demos);

  // Rebuild detail file as incremental delta (build/docs only); delete if empty.
  const detail = buildDemoDetail(req.params.id, {
    defaultConfig: updates.defaultConfig,
    configs: updates.configs,
    documentation: updates.documentation,
  });
  if (detail) await manifestLoader.saveDemoDetail(req.params.id, detail);
  else await manifestLoader.deleteDemoDetail(req.params.id);

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`fix(demos): update ${req.params.id}`);
  }

  res.json({ success: true, demo: { ...item, ...(detail || {}) }, message: `Demo "${req.params.id}" updated` });
}));

// DELETE /api/demos/:id - Delete demo
router.delete('/:id', asyncHandler(async (req, res) => {
  const demos = await manifestLoader.loadDemos();
  const idx = demos.items.findIndex(d => d.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: `Demo "${req.params.id}" not found` });
  }

  const removed = demos.items.splice(idx, 1);
  await manifestLoader.saveDemosIndex(demos);
  await manifestLoader.deleteDemoDetail(req.params.id);

  if (req.body?.autoCommit !== false) {
    await gitSync.autoCommit(`chore(demos): remove ${req.params.id}`);
  }

  res.json({ success: true, demo: removed[0], message: `Demo "${req.params.id}" deleted` });
}));

export default router;
