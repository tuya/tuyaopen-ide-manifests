import express from 'express';
import { manifestLoader } from '../services/manifest-loader.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

// Flat per-variant model: each index item IS a variant (chip), carrying a
// platformId for grouping and a detailUrl to its hardware-spec file. Detail
// files live at platforms/<platformId>/<id>.json.
// platformId is immutable after creation (changing it would move the detail
// file and break grouping / board references), so it is NOT patchable here.
const INDEX_FIELDS = ['name', 'summary', 'image', 'detailUrl', 'sdks', 'published'];

function detailUrlFor(platformId, id) {
  return `platforms/${platformId}/${id}.json`;
}

// GET /api/platforms - list items, enriched (display-only) with arch read
// from each detail file. Does not change stored index.json.
router.get('/', asyncHandler(async (req, res) => {
  const platforms = await manifestLoader.loadPlatforms();
  const items = platforms?.items || [];

  const enriched = [];
  for (const item of items) {
    const pid = item.platformId || item.id;
    const detail = await manifestLoader.loadPlatformVariantDetail(pid, item.id);
    enriched.push({ ...item, arch: detail?.arch || '', platformSymbol: detail?.platformSymbol || '' });
  }

  res.json({
    success: true,
    platforms: enriched,
    count: enriched.length,
    lastModified: new Date().toISOString(),
  });
}));

// GET /api/platforms/:id - one item + its detail
router.get('/:id', asyncHandler(async (req, res) => {
  const platforms = await manifestLoader.loadPlatforms();
  const item = platforms?.items?.find((p) => p.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: `Platform "${req.params.id}" not found` });
  }
  const pid = item.platformId || item.id;
  const detail = await manifestLoader.loadPlatformVariantDetail(pid, item.id);
  res.json({ success: true, platform: item, detail: detail || null });
}));

// POST /api/platforms - create item + detail file
router.post('/', asyncHandler(async (req, res) => {
  const { id, platformId, name, summary, image, detail, sdks, published } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, error: 'Missing required fields: id, name' });
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    return res.status(400).json({ success: false, error: 'id must be lowercase kebab-case' });
  }
  const pid = platformId || id;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(pid)) {
    return res.status(400).json({ success: false, error: 'platformId must be lowercase kebab-case' });
  }

  const platforms = await manifestLoader.loadPlatforms();
  if (!platforms.items) platforms.items = [];
  if (platforms.items.some((p) => p.id === id)) {
    return res.status(400).json({ success: false, error: `Platform variant "${id}" already exists` });
  }

  const newItem = {
    id,
    platformId: pid,
    name,
    summary: summary || {},
    ...(image ? { image } : {}),
    detailUrl: detailUrlFor(pid, id),
    ...(Array.isArray(sdks) ? { sdks } : {}),
    ...(published !== undefined ? { published } : {}),
  };
  platforms.items.push(newItem);
  await manifestLoader.savePlatformsIndex(platforms);

  const template = (await manifestLoader.loadPlatformTemplate()) || { schemaVersion: 1 };
  // id / platformId live in the index only — the detail is the hardware spec.
  const newDetail = { ...template, ...(detail || {}), schemaVersion: 1 };
  delete newDetail.id;
  delete newDetail.platformId;
  await manifestLoader.savePlatformVariantDetail(pid, id, newDetail);

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`feat(platforms): add ${id}`);
  }
  res.status(201).json({ success: true, platform: newItem, message: `Platform "${id}" created successfully` });
}));

// PATCH /api/platforms/:id - update item metadata + detail
router.patch('/:id', asyncHandler(async (req, res) => {
  const platforms = await manifestLoader.loadPlatforms();
  const idx = platforms?.items?.findIndex((p) => p.id === req.params.id);
  if (idx === undefined || idx === -1) {
    return res.status(404).json({ success: false, error: `Platform "${req.params.id}" not found` });
  }
  const item = platforms.items[idx];
  const oldPid = item.platformId || item.id;

  const index = req.body.index || {};
  for (const key of INDEX_FIELDS) {
    if (index[key] !== undefined) item[key] = index[key];
  }
  const newPid = item.platformId || item.id;
  // Keep detailUrl consistent with platformId/id.
  item.detailUrl = detailUrlFor(newPid, item.id);

  await manifestLoader.savePlatformsIndex(platforms);

  // Detail file.
  if (req.body.detail) {
    const detail = { ...req.body.detail, schemaVersion: 1 };
    delete detail.id;
    delete detail.platformId;
    await manifestLoader.savePlatformVariantDetail(newPid, item.id, detail);
    // If platformId changed, the detail moved dirs — remove the stale file.
    if (newPid !== oldPid) {
      await manifestLoader.deletePlatformVariantDetail(oldPid, item.id);
    }
  }

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`fix(platforms): update ${req.params.id}`);
  }
  res.json({ success: true, platform: item, message: `Platform "${req.params.id}" updated successfully` });
}));

// DELETE /api/platforms/:id - remove item + detail file
router.delete('/:id', asyncHandler(async (req, res) => {
  const platforms = await manifestLoader.loadPlatforms();
  const idx = platforms?.items?.findIndex((p) => p.id === req.params.id);
  if (idx === undefined || idx === -1) {
    return res.status(404).json({ success: false, error: `Platform "${req.params.id}" not found` });
  }
  const item = platforms.items[idx];

  // Refuse deletion while boards still target this chip — removing it would
  // orphan them. A board references this chip via variantId === item.id (current
  // model); legacy boards stored the chip id in platformId.
  const boards = await manifestLoader.loadBoards();
  const referencing = (boards?.items || []).filter((b) =>
    b.variantId === item.id || b.platformId === item.id,
  );
  if (referencing.length) {
    const names = referencing.map((b) => (b.name && (b.name['zh-CN'] || b.name.en)) || b.id);
    return res.status(409).json({
      success: false,
      error: `无法删除芯片平台 "${req.params.id}"：仍被 ${referencing.length} 个开发板引用（${names.join('、')}）。请先删除或改挂这些开发板，再删除该芯片平台。`,
      referencedBy: referencing.map((b) => ({ id: b.id, name: b.name })),
    });
  }

  const removed = platforms.items.splice(idx, 1);
  await manifestLoader.savePlatformsIndex(platforms);
  await manifestLoader.deletePlatformVariantDetail(item.platformId || item.id, item.id);

  if (req.body?.autoCommit !== false) {
    await gitSync.autoCommit(`chore(platforms): remove ${req.params.id}`);
  }
  res.json({ success: true, platform: removed[0], message: `Platform "${req.params.id}" deleted successfully` });
}));

export default router;
