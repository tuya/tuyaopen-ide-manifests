import express from 'express';
import { manifestLoader } from '../services/manifest-loader.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

// Capability surface — drives the IDE's filter tabs. Unchanged by the
// 2026-09-02 directory move (that redefined the payload directory as the
// install GROUP), so this list is still the whole vocabulary. Do NOT confuse it
// with the install groups core/embedded/cloud/miniapp/scenario, which this
// endpoint does not edit.
const SURFACES = ['embedded', 'cloud', 'miniapp'];
// The whole vocabulary; `sdks` is what separates the two product lines since
// 2026-09-02 (before that a directory did, and the validator briefly accepted
// 'tuyaopen' alone — this list stayed correct through that narrowing).
const SDKS = ['tuyaopen', 'tuyaos'];

// Editable metadata fields. id / source / installPayload are bound to the skill
// payload location (skills/<group>/<id>/ — the second segment is the INSTALL
// GROUP, not the surface) and are intentionally NOT editable here: CI validates
// them against the filesystem and they must stay in sync.
//
// The field that is path-coupled is `group`, and this endpoint deliberately does
// not expose it: validate-skills-index.py requires source.localPath's second
// segment to equal the item's `group`, so setting `group` while localPath stays
// immutable would produce an index that fails validation. Moving a skill between
// groups means moving the directory and updating source/installPayload in git,
// not a PATCH here. (An earlier version of this comment said that coupling was
// on `surface`. It was, for a few hours on 2026-09-02, before the directory was
// redefined as the group. `surface` is now fully orthogonal to the path and is
// safely editable below — the two disagree for 11 of the 32 items by design.)
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
