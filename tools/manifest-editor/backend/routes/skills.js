import express from 'express';
import { manifestLoader } from '../services/manifest-loader.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

const SURFACES = ['embedded', 'cloud', 'miniapp'];
const SDKS = ['tuyaopen', 'tuyaos'];

// Editable metadata fields. id / source / installPayload are bound to the skill
// payload location (skills/<surface>/<id>/) and are intentionally NOT editable
// here — they are validated against the filesystem by CI and must stay in sync.
const cleanLocalized = (v) => {
  if (!v || typeof v !== 'object') return undefined;
  const out = {};
  for (const k of ['en', 'zh-CN']) {
    if (typeof v[k] === 'string' && v[k].trim()) out[k] = v[k].trim();
  }
  return out.en || out['zh-CN'] ? out : undefined;
};
const cleanStringArray = (v) =>
  Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()))] : undefined;

// GET /api/skills - List all skills (index items)
router.get('/', asyncHandler(async (req, res) => {
  const skills = await manifestLoader.loadSkills();
  res.json({
    success: true,
    skills: skills?.items || [],
    count: skills?.items?.length || 0,
  });
}));

// GET /api/skills/:id - Get a single skill item
router.get('/:id', asyncHandler(async (req, res) => {
  const skills = await manifestLoader.loadSkills();
  const item = skills?.items?.find((s) => s.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: `Skill "${req.params.id}" not found` });
  }
  res.json({ success: true, skill: item });
}));

// PATCH /api/skills/:id - Update editable metadata of an existing skill.
// Identity (id) and payload-bound fields (source, installPayload) are preserved.
router.patch('/:id', asyncHandler(async (req, res) => {
  const skills = await manifestLoader.loadSkills();
  const item = skills?.items?.find((s) => s.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: `Skill "${req.params.id}" not found` });
  }

  const u = req.body || {};

  // Bilingual fields
  for (const key of ['name', 'summary', 'whenToUse']) {
    if (u[key] !== undefined) {
      const cleaned = cleanLocalized(u[key]);
      if (cleaned) item[key] = cleaned;
      else if (key !== 'name') delete item[key];
    }
  }

  // Surface (enum)
  if (u.surface !== undefined) {
    if (!SURFACES.includes(u.surface)) {
      return res.status(400).json({ success: false, error: `surface must be one of ${SURFACES.join(', ')}` });
    }
    item.surface = u.surface;
  }

  // Order (number)
  if (u.order !== undefined) {
    const n = Number(u.order);
    if (Number.isFinite(n)) item.order = n;
  }

  // defaultEnabled (bool)
  if (u.defaultEnabled !== undefined) item.defaultEnabled = !!u.defaultEnabled;

  // String arrays — tags is required-non-empty by the schema; commands/related drop when empty.
  if (u.tags !== undefined) {
    const t = cleanStringArray(u.tags);
    if (t && t.length) item.tags = t;
  }
  for (const key of ['commands', 'related']) {
    if (u[key] !== undefined) {
      const arr = cleanStringArray(u[key]);
      if (arr && arr.length) item[key] = arr;
      else delete item[key];
    }
  }

  // sdks — optional SDK-applicability flag. Omitted/empty ⇒ default (drop field).
  if (u.sdks !== undefined) {
    const arr = cleanStringArray(u.sdks);
    if (arr && arr.length) {
      if (!arr.every((s) => SDKS.includes(s))) {
        return res.status(400).json({ success: false, error: `sdks must be a subset of ${SDKS.join(', ')}` });
      }
      item.sdks = arr;
    } else {
      delete item.sdks;
    }
  }

  await manifestLoader.saveSkillsIndex(skills);

  if (u.autoCommit !== false) {
    await gitSync.autoCommit(`fix(skills): update ${req.params.id}`);
  }

  res.json({ success: true, skill: item, message: `Skill "${req.params.id}" updated` });
}));

export default router;
