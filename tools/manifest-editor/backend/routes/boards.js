import express from 'express';
import { manifestLoader } from '../services/manifest-loader.js';
import { validator } from '../services/manifest-validator.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

// SDK applicability — optional array; omitted ⇒ ['tuyaopen'] (default). Returns
// a deduped subset of known SDK ids, or undefined when empty/absent (drop field).
const SDKS = ['tuyaopen', 'tuyaos'];
function normalizeSdks(v) {
  if (!Array.isArray(v)) return undefined;
  const arr = [...new Set(v.filter((s) => SDKS.includes(s)))];
  return arr.length ? arr : undefined;
}

// Resolve a board's platform reference (its `platformId` field — which holds a
// platform *variant id*, e.g. "gd32vw553") to that platform's detail. The detail
// lives at platforms/<platformId>/<id>.json, so a plain
// loadPlatformDetail(ref) (which assumes id===platformId) fails whenever a
// variant id differs from its platformId. Look the ref up in the index instead.
async function resolvePlatformDetailByRef(ref) {
  const platforms = await manifestLoader.loadPlatforms();
  const items = platforms?.items || [];
  const item = items.find((p) => p.id === ref) || items.find((p) => (p.platformId || p.id) === ref);
  if (!item) return null;
  return manifestLoader.loadPlatformVariantDetail(item.platformId || item.id, item.id);
}

// GET /api/boards - Get all boards
router.get('/', asyncHandler(async (req, res) => {
  const boards = await manifestLoader.loadBoards();

  res.json({
    success: true,
    boards: boards?.items || [],
    count: boards?.items?.length || 0,
    lastModified: new Date().toISOString(),
  });
}));

// GET /api/boards/:id - Get single board (index + detail merged)
router.get('/:id', asyncHandler(async (req, res) => {
  const boards = await manifestLoader.loadBoards();
  const board = boards?.items?.find((b) => b.id === req.params.id);

  if (!board) {
    return res.status(404).json({
      success: false,
      error: `Board "${req.params.id}" not found`,
    });
  }

  // Merge detail fields (boardSymbol, demos, peripheralPatterns, links)
  const detail = await manifestLoader.loadBoardDetail(req.params.id);
  const merged = { ...board };
  if (detail) {
    if (detail.boardSymbol) merged.boardSymbol = detail.boardSymbol;
    if (detail.links) merged.links = detail.links;
    if (detail.peripheralPatterns) merged.peripheralPatterns = detail.peripheralPatterns;
    if (detail.peripheralGroups) merged.peripheralGroups = detail.peripheralGroups;
    if (detail.source) merged.source = detail.source;

    // Map links to editor field names
    const links = detail.links || {};
    if (links.schematic) {
      merged.schematicLink = typeof links.schematic === 'string'
        ? links.schematic : links.schematic.en || '';
    }
    if (links.datasheet) {
      merged.guideDocs = typeof links.datasheet === 'string'
        ? { en: links.datasheet } : links.datasheet;
    }
    if (links.productPage) {
      merged.purchaseLink = typeof links.productPage === 'string'
        ? { en: links.productPage } : links.productPage;
    }
    if (links['3dModel']) {
      merged.threeDModelLink = typeof links['3dModel'] === 'string'
        ? links['3dModel'] : links['3dModel'].en || '';
    }
  }

  res.json({
    success: true,
    board: merged,
  });
}));

// POST /api/boards - Create new board
router.post('/', asyncHandler(async (req, res) => {
  const { id, name, platformId, variantId, manufacturer, summary, tags, published } = req.body;

  // Validate required fields. platformId = SDK platform group (e.g. "gd32");
  // variantId = the specific chip (e.g. "gd32vw553"), matching a platform item's id.
  if (!id || !name || !platformId || !variantId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: id, name, platformId, variantId',
    });
  }

  // Create new board object. Detail files are grouped by SDK platform
  // (boards-and-chips/<platformId>/<id>.json), mirroring platforms/<platformId>/.
  const newBoard = {
    id,
    name,
    platformId,
    variantId,
    manufacturer: manufacturer || { en: 'Unknown' },
    summary: summary || {},
    tags: tags || [],
    image: null,
    detailUrl: `boards-and-chips/${platformId}/${id}.json`,
    published: published !== undefined ? published : true,
  };

  const sdks = normalizeSdks(req.body.sdks);
  if (sdks) newBoard.sdks = sdks;

  // Validate ID uniqueness
  const boards = await manifestLoader.loadBoards();
  const idValidation = validator.validateBoardId(id, boards);
  if (!idValidation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid board ID',
      errors: idValidation.errors,
    });
  }

  // Add to boards manifest
  if (!boards.items) {
    boards.items = [];
  }
  boards.items.push(newBoard);

  // Save manifest
  await manifestLoader.saveBoardsIndex(boards);

  // Board selection config is derived at project-creation time from
  // platformId + boardSymbol — no scaffold stored in the manifest.
  const boardSymbol = req.body.boardSymbol ?? '';

  // Create initial detail file — board-specific data only. Display/listing
  // fields (id, name, summary, manufacturer, platformId, tags) live in the index.
  const initialDetail = {
    schemaVersion: 1,
    peripheralPatterns: {},
    links: { schematic: null, datasheet: null, productPage: null },
    boardSymbol: boardSymbol,
  };
  await manifestLoader.saveBoardDetail(id, initialDetail);

  // Auto-commit
  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`feat(boards): add new board ${id}`);
  }

  res.status(201).json({
    success: true,
    board: newBoard,
    message: `Board "${id}" created successfully`,
  });
}));

// PATCH /api/boards/:id - Update board
router.patch('/:id', asyncHandler(async (req, res) => {
  const boards = await manifestLoader.loadBoards();
  const boardIndex = boards?.items?.findIndex((b) => b.id === req.params.id);

  if (boardIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Board "${req.params.id}" not found`,
    });
  }

  // Update board fields
  const board = boards.items[boardIndex];
  const updates = { ...req.body };
  const oldPlatformId = board.platformId;

  // Don't allow changing ID
  delete updates.id;
  delete updates.schemaVersion;
  delete updates.autoCommit;

  // Validate boardSymbol if provided
  if (updates.boardSymbol !== undefined) {
    if (updates.boardSymbol && !/^[A-Z0-9][A-Z0-9_.]*$/.test(updates.boardSymbol)) {
      return res.status(400).json({
        success: false,
        error: 'boardSymbol must be UPPER_CASE (letters, numbers, underscores, dots)',
      });
    }
  }

  // Fields that go to the index
  const indexFields = ['name', 'platformId', 'variantId', 'manufacturer', 'summary', 'tags', 'image', 'published'];
  for (const key of indexFields) {
    if (updates[key] !== undefined) {
      board[key] = updates[key];
    }
  }

  // SDK applicability — empty/invalid clears it (defaults back to tuyaopen).
  if (updates.sdks !== undefined) {
    const arr = normalizeSdks(updates.sdks);
    if (arr) board.sdks = arr;
    else delete board.sdks;
  }

  // If the SDK platform group changed, the detail file moves to the new group's
  // directory — relocate it and update detailUrl so they stay consistent.
  if (board.platformId !== oldPlatformId) {
    board.detailUrl = `boards-and-chips/${board.platformId}/${board.id}.json`;
    await manifestLoader.moveBoardDetail(board.id, board.platformId);
  }

  // Save index
  await manifestLoader.saveBoardsIndex(boards);

  // Fields that go to the detail file: boardSymbol, demos, peripheralPatterns, links, source
  const detailFields = ['boardSymbol', 'links', 'source'];
  // Map editor link fields back to nested links object (merge with existing)
  const editorLinkFields = ['schematicLink', 'guideDocs', 'purchaseLink', 'threeDModelLink'];
  const hasEditorLinks = editorLinkFields.some(k => updates[k] !== undefined);
  if (hasEditorLinks) {
    updates._mergeLinks = true;
    if (!updates.links) updates.links = {};
    if (updates.schematicLink !== undefined) {
      updates.links.schematic = updates.schematicLink || null;
      delete updates.schematicLink;
    }
    if (updates.guideDocs !== undefined) {
      updates.links.datasheet = updates.guideDocs || null;
      delete updates.guideDocs;
    }
    if (updates.purchaseLink !== undefined) {
      updates.links.productPage = updates.purchaseLink || null;
      delete updates.purchaseLink;
    }
    if (updates.threeDModelLink !== undefined) {
      updates.links['3dModel'] = updates.threeDModelLink || null;
      delete updates.threeDModelLink;
    }
  }
  const hasDetailUpdates = detailFields.some(k => updates[k] !== undefined);

  if (hasDetailUpdates) {
    let detail = await manifestLoader.loadBoardDetail(req.params.id);
    if (!detail) {
      detail = { schemaVersion: 1 };
    }
    for (const key of detailFields) {
      if (updates[key] !== undefined) {
        if (key === 'links' && updates._mergeLinks) {
          detail.links = { ...(detail.links || {}), ...updates.links };
        } else {
          detail[key] = updates[key];
        }
      }
    }
    delete updates._mergeLinks;
    await manifestLoader.saveBoardDetail(req.params.id, detail);
  }

  // Auto-commit
  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`fix(boards): update ${req.params.id} metadata`);
  }

  res.json({
    success: true,
    board,
    message: `Board "${req.params.id}" updated successfully`,
  });
}));

// DELETE /api/boards/:id - Delete board
router.delete('/:id', asyncHandler(async (req, res) => {
  const boards = await manifestLoader.loadBoards();
  const boardIndex = boards?.items?.findIndex((b) => b.id === req.params.id);

  if (boardIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Board "${req.params.id}" not found`,
    });
  }

  // Remove board
  const removed = boards.items.splice(boardIndex, 1);

  // Save manifest
  await manifestLoader.saveBoardsIndex(boards);

  // Auto-commit
  if (req.body?.autoCommit !== false) {
    await gitSync.autoCommit(`chore(boards): remove ${req.params.id}`);
  }

  res.json({
    success: true,
    board: removed[0],
    message: `Board "${req.params.id}" deleted successfully`,
  });
}));

// POST /api/boards/:id/validate - Validate board
router.post('/:id/validate', asyncHandler(async (req, res) => {
  const board = req.body;

  if (!board) {
    return res.status(400).json({
      success: false,
      error: 'No board data provided',
    });
  }

  const validation = validator.validateBoard(board);

  res.json({
    success: validation.valid,
    valid: validation.valid,
    errors: validation.errors,
  });
}));

// GET /api/boards/:id/peripherals - Get peripheral patterns for a board
router.get('/:id/peripherals', asyncHandler(async (req, res) => {
  const detail = await manifestLoader.loadBoardDetail(req.params.id);
  if (!detail) {
    return res.json({ success: true, peripheralPatterns: {}, peripheralGroups: {} });
  }
  res.json({ success: true, peripheralPatterns: detail.peripheralPatterns || {}, peripheralGroups: detail.peripheralGroups || {} });
}));

// GET /api/boards/:id/expansion-pins - Get expansion pins for a board
router.get('/:id/expansion-pins', asyncHandler(async (req, res) => {
  const detail = await manifestLoader.loadBoardDetail(req.params.id);
  if (!detail) {
    return res.json({ success: true, expansionPins: [] });
  }
  res.json({ success: true, expansionPins: detail.expansionPins || [] });
}));

// PATCH /api/boards/:id/expansion-pins - Update expansion pins (auto-resolve functions from platform pinout)
router.patch('/:id/expansion-pins', asyncHandler(async (req, res) => {
  const { gpios } = req.body;
  if (!Array.isArray(gpios)) {
    return res.status(400).json({ success: false, error: 'Missing gpios array' });
  }

  const boards = await manifestLoader.loadBoards();
  const item = boards?.items?.find(b => b.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: `Board "${req.params.id}" not found` });
  }
  let detail = await manifestLoader.loadBoardDetail(req.params.id);
  if (!detail) detail = { schemaVersion: 1 };

  // Load platform pinout for function resolution. variantId is the specific chip
  // (matches a platform item's id); fall back to platformId for older data.
  const platformDetail = await resolvePlatformDetailByRef(item.variantId || item.platformId);
  const pinout = platformDetail?.pinout || [];

  // Resolve functions for each GPIO
  const expansionPins = gpios.map(gpio => {
    const pinEntry = pinout.find(p => p.gpio === gpio);
    return {
      gpio,
      functions: pinEntry?.functions || [`GPIO${gpio}`],
    };
  });

  detail.expansionPins = expansionPins;
  await manifestLoader.saveBoardDetail(req.params.id, detail);

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`feat(boards): update ${req.params.id} expansion pins`);
  }

  res.json({ success: true, expansionPins, message: `Expansion pins updated for "${req.params.id}"` });
}));

// GET /api/boards/:id/expansion-connectors - Get expansion connectors (接插件) for a board
router.get('/:id/expansion-connectors', asyncHandler(async (req, res) => {
  const detail = await manifestLoader.loadBoardDetail(req.params.id);
  res.json({ success: true, expansionConnectors: detail?.expansionConnectors || [] });
}));

// PATCH /api/boards/:id/expansion-connectors - Replace the expansion connectors list
router.patch('/:id/expansion-connectors', asyncHandler(async (req, res) => {
  const { expansionConnectors } = req.body;
  if (!Array.isArray(expansionConnectors)) {
    return res.status(400).json({ success: false, error: 'Missing expansionConnectors array' });
  }
  const boards = await manifestLoader.loadBoards();
  if (!boards?.items?.some(b => b.id === req.params.id)) {
    return res.status(404).json({ success: false, error: `Board "${req.params.id}" not found` });
  }
  let detail = await manifestLoader.loadBoardDetail(req.params.id);
  if (!detail) detail = { schemaVersion: 1 };

  if (expansionConnectors.length > 0) {
    detail.expansionConnectors = expansionConnectors;
  } else {
    delete detail.expansionConnectors;
  }
  await manifestLoader.saveBoardDetail(req.params.id, detail);

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`feat(boards): update ${req.params.id} expansion connectors`);
  }
  res.json({ success: true, expansionConnectors, message: `Expansion connectors updated for "${req.params.id}"` });
}));

// GET /api/platforms/:platformId/pinout - Get platform pinout for GPIO selection
router.get('/platforms/:platformId/pinout', asyncHandler(async (req, res) => {
  const platformDetail = await resolvePlatformDetailByRef(req.params.platformId);
  if (!platformDetail) {
    return res.status(404).json({ success: false, error: `Platform "${req.params.platformId}" not found` });
  }
  const pinout = (platformDetail.pinout || []).filter(p => p.gpio !== null);
  res.json({ success: true, pinout });
}));

// GET /api/platforms/:platformId/peripherals - Get platform peripheral hardware specs (default GPIO mappings)
router.get('/platforms/:platformId/peripherals', asyncHandler(async (req, res) => {
  const platformDetail = await resolvePlatformDetailByRef(req.params.platformId);
  if (!platformDetail) {
    return res.status(404).json({ success: false, error: `Platform "${req.params.platformId}" not found` });
  }
  res.json({ success: true, peripherals: platformDetail.peripherals || {} });
}));

// PATCH /api/boards/:id/peripherals - Update peripheral patterns
router.patch('/:id/peripherals', asyncHandler(async (req, res) => {
  const { peripheralPatterns, peripheralGroups } = req.body;
  if (!peripheralPatterns || typeof peripheralPatterns !== 'object') {
    return res.status(400).json({ success: false, error: 'Missing peripheralPatterns object' });
  }

  let detail = await manifestLoader.loadBoardDetail(req.params.id);
  if (!detail) {
    const boards = await manifestLoader.loadBoards();
    if (!boards?.items?.some(b => b.id === req.params.id)) {
      return res.status(404).json({ success: false, error: `Board "${req.params.id}" not found` });
    }
    detail = { schemaVersion: 1 };
  }

  detail.peripheralPatterns = peripheralPatterns;
  if (peripheralGroups !== undefined) {
    detail.peripheralGroups = peripheralGroups;
  }
  await manifestLoader.saveBoardDetail(req.params.id, detail);

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`feat(boards): update ${req.params.id} peripheral patterns`);
  }

  res.json({ success: true, peripheralPatterns, message: `Peripheral patterns updated for "${req.params.id}"` });
}));

export default router;
