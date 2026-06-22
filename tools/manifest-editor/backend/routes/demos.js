import express from 'express';
import { manifestLoader } from '../services/manifest-loader.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

// Build the demo detail object. Holds the source path + build config + docs;
// identity, classification and tags stay in the index. `configs` is an array
// of board targets: { board, accessory?, options:[{name?,file}] }.
// Returns null when there is nothing to store (caller deletes the file).
function buildDemoDetail(id, { source, cloud, configs, documentation, drivers }) {
  const detail = { id };

  if (typeof source === 'string' && source.trim()) detail.source = source.trim();

  // Cloud demo flag: `true` when it just needs a PID, or an object with optional
  // PID-location overrides ({ pid: { kconfigKey?, macro?, file? } }) when the demo
  // deviates from the convention (CONFIG_TUYA_PRODUCT_ID / TUYA_PRODUCT_ID). Empty
  // overrides collapse back to the bare `true` form.
  const cloudVal = normalizeCloud(cloud);
  if (cloudVal !== undefined) detail.cloud = cloudVal;

  if (Array.isArray(configs) && configs.length) {
    const cleaned = configs
      // A config target is keyed by either a board (board-specific) or a
      // platform variant (platform demos); keep whichever is present.
      .filter((t) => t && (t.board || t.platform))
      .map((t) => {
        const out = t.board ? { board: t.board } : { platform: t.platform };
        const opts = (t.options || [])
          .filter((o) => o && o.file)
          .map((o) => {
            const r = { file: o.file };
            if (o.name && (o.name.en || o.name['zh-CN'])) r.name = o.name;
            // Board peripheral / group ids this option uses (deduped, drop empty).
            if (Array.isArray(o.peripherals)) {
              const peris = [...new Set(
                o.peripherals.filter((p) => typeof p === 'string' && p.trim()).map((p) => p.trim()),
              )];
              if (peris.length) r.peripherals = peris;
            }
            return r;
          });
        if (opts.length) out.options = opts;
        return out;
      });
    if (cleaned.length) detail.configs = cleaned;
  }

  const readme = documentation?.readme;
  const readmeHasValue = readme && Object.values(readme).some((v) => v != null && v !== '');
  if (readmeHasValue) detail.documentation = { readme };

  // Hardware driver dependencies: [{ driver, level }], level required|optional.
  // `driver` ids mirror the peripherals tag vocabulary so a board's tags can be
  // matched against a demo's required drivers. Deduped by driver, order kept.
  if (Array.isArray(drivers)) {
    const seen = new Set();
    const cleaned = drivers
      .filter((d) => d && typeof d.driver === 'string' && d.driver.trim())
      .map((d) => ({ driver: d.driver.trim(), level: d.level === 'required' ? 'required' : 'optional' }))
      .filter((d) => (seen.has(d.driver) ? false : seen.add(d.driver)));
    if (cleaned.length) detail.drivers = cleaned;
  }

  return Object.keys(detail).length > 1 ? detail : null;
}

// Normalize a `cloud` value into what we store: undefined (not a cloud demo),
// `true` (cloud, auto-detected PID location), or { pid: {...} } when the author
// picked a method (`via`) or set any override. `via:'auto'` with no overrides
// collapses back to bare `true`. Accepts boolean or object; trims empties.
function normalizeCloud(cloud) {
  if (!cloud) return undefined;
  if (cloud === true) return true;
  if (typeof cloud === 'object') {
    const result = {};
    if (typeof cloud.oemUrl === 'string' && cloud.oemUrl.trim()) result.oemUrl = cloud.oemUrl.trim();
    const pid = cloud.pid && typeof cloud.pid === 'object' ? cloud.pid : {};
    const out = {};
    if (pid.via === 'kconfig' || pid.via === 'macro') out.via = pid.via;
    for (const k of ['kconfigKey', 'macro', 'file']) {
      if (typeof pid[k] === 'string' && pid[k].trim()) out[k] = pid[k].trim();
    }
    if (Object.keys(out).length) result.pid = out;
    return Object.keys(result).length ? result : true;
  }
  return true;
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
// Detail files are incremental (id + source/configs/documentation);
// identity/classification/tags + detailUrl live in index.json. Merge so the
// editor form gets a complete object to populate.
router.get('/:id', asyncHandler(async (req, res) => {
  const demos = await manifestLoader.loadDemos();
  const item = demos?.items?.find(d => d.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: `Demo "${req.params.id}" not found` });
  }
  const detail = await manifestLoader.loadDemoDetail(req.params.id, item.type);
  // index first (identity/classification), then overlay detail delta (build/docs)
  const merged = { ...item, ...(detail || {}) };
  res.json({ success: true, demo: merged });
}));

// POST /api/demos - Create new demo
router.post('/', asyncHandler(async (req, res) => {
  const { id, type, name, summary, tags, boards, platforms, compatibilityType, source, cloud, configs, documentation, drivers, publish } = req.body;

  if (!id || !name?.en || !source || typeof source !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: id, name.en, source (full URL to the example source)',
    });
  }

  if (!/^https?:\/\//i.test(source.trim())) {
    return res.status(400).json({ success: false, error: 'source must be a full URL (e.g. https://github.com/tuya/TuyaOpen/tree/master/apps/my_app)' });
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID must be kebab-case (lowercase letters, numbers, hyphens)',
    });
  }

  // configs is an array of board targets; cleaned/validated in buildDemoDetail.
  if (configs !== undefined && !Array.isArray(configs)) {
    return res.status(400).json({ success: false, error: 'configs must be an array of board targets' });
  }

  const demos = await manifestLoader.loadDemos();
  if (demos.items.some(d => d.id === id)) {
    return res.status(409).json({ success: false, error: `Demo "${id}" already exists` });
  }

  const cleanTags = Array.isArray(tags) ? tags.filter((t) => t && t !== 'app' && t !== 'example') : [];
  const demoType = type === 'app' ? 'app' : 'example';
  const indexEntry = {
    id,
    type: demoType,
    name: name || { en: '' },
    summary: summary || { en: '', 'zh-CN': '' },
    ...(cleanTags.length ? { tags: cleanTags } : {}),
    boards: boards || [],
    ...(Array.isArray(platforms) && platforms.length ? { platforms } : {}),
    compatibilityType: compatibilityType || 'universal',
    detailUrl: `demos/${demoType}/${id}.json`,
    publish: publish !== false,
  };

  demos.items.push(indexEntry);
  await manifestLoader.saveDemosIndex(demos);

  // Detail holds source path + build config + docs (identity/tags in the index).
  const detailEntry = buildDemoDetail(id, { source, cloud, configs, documentation, drivers });
  if (detailEntry) await manifestLoader.saveDemoDetail(id, detailEntry, indexEntry.type);

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

  // configs is an array of board targets; cleaned/validated in buildDemoDetail.
  if (updates.configs !== undefined && !Array.isArray(updates.configs)) {
    return res.status(400).json({ success: false, error: 'configs must be an array of board targets' });
  }

  // Update index entry (identity / classification / tags + detailUrl)
  const item = demos.items[idx];
  const oldType = item.type === 'app' ? 'app' : 'example';
  const indexFields = ['type', 'name', 'summary', 'boards', 'platforms', 'compatibilityType', 'publish'];
  for (const key of indexFields) {
    if (updates[key] !== undefined) item[key] = updates[key];
  }
  // Drop the scope field that no longer applies after a scope change.
  const ct = updates.compatibilityType !== undefined ? updates.compatibilityType : item.compatibilityType;
  if (ct !== 'platform') delete item.platforms;
  if (ct !== 'board-specific') item.boards = [];
  if (updates.type !== undefined) item.type = updates.type === 'app' ? 'app' : 'example';
  if (updates.tags !== undefined) {
    const cleanTags = Array.isArray(updates.tags) ? updates.tags.filter((t) => t && t !== 'app' && t !== 'example') : [];
    if (cleanTags.length) item.tags = cleanTags;
    else delete item.tags;
  }
  item.detailUrl = `demos/${item.type}/${req.params.id}.json`;
  await manifestLoader.saveDemosIndex(demos);

  // Detail holds source path + build config + docs. Merge with the existing
  // detail so a partial PATCH (e.g. publish toggle) doesn't wipe omitted fields.
  const existing = (await manifestLoader.loadDemoDetail(req.params.id, oldType)) || {};
  const detail = buildDemoDetail(req.params.id, {
    source: updates.source !== undefined ? updates.source : existing.source,
    cloud: updates.cloud !== undefined ? updates.cloud : existing.cloud,
    configs: updates.configs !== undefined ? updates.configs : existing.configs,
    documentation: updates.documentation !== undefined ? updates.documentation : existing.documentation,
    drivers: updates.drivers !== undefined ? updates.drivers : existing.drivers,
  });
  // A type change moves the detail file between demos/example|app/; drop the stale one.
  if (item.type !== oldType) await manifestLoader.deleteDemoDetail(req.params.id, oldType);
  if (detail) await manifestLoader.saveDemoDetail(req.params.id, detail, item.type);
  else await manifestLoader.deleteDemoDetail(req.params.id, item.type);

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
  await manifestLoader.deleteDemoDetail(req.params.id, removed[0]?.type);

  if (req.body?.autoCommit !== false) {
    await gitSync.autoCommit(`chore(demos): remove ${req.params.id}`);
  }

  res.json({ success: true, demo: removed[0], message: `Demo "${req.params.id}" deleted` });
}));

export default router;
