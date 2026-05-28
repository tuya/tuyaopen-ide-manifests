import express from 'express';
import { manifestLoader } from '../services/manifest-loader.js';
import { validator } from '../services/manifest-validator.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

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

  // Merge detail fields (kconfigId, scaffold, variantId, demos, peripheralPatterns, links)
  const detail = await manifestLoader.loadBoardDetail(req.params.id);
  const merged = { ...board };
  if (detail) {
    if (detail.variantId) merged.variantId = detail.variantId;
    if (detail.kconfigId) merged.kconfigId = detail.kconfigId;
    if (detail.scaffold) merged.scaffold = detail.scaffold;
    if (detail.links) merged.links = detail.links;
    if (detail.peripheralPatterns) merged.peripheralPatterns = detail.peripheralPatterns;
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
  const { id, name, platformId, manufacturer, summary, tags, published } = req.body;

  // Validate required fields
  if (!id || !name || !platformId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: id, name, platformId',
    });
  }

  // Create new board object
  const newBoard = {
    id,
    name,
    platformId,
    manufacturer: manufacturer || { en: 'Unknown' },
    summary: summary || {},
    tags: tags || [],
    image: null,
    detailUrl: `boards-and-chips/${platformId}/${id}.json`,
    published: published !== undefined ? published : true,
  };

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

  // Auto-derive scaffold baseConfig from platformId + kconfigId if not provided
  const boardKconfigId = req.body.kconfigId || '';
  const derivedBaseConfig = boardKconfigId && platformId
    ? {
        [`CONFIG_BOARD_CHOICE_${platformId.toUpperCase()}`]: 'y',
        [`CONFIG_BOARD_CHOICE_${boardKconfigId}`]: 'y',
      }
    : {};

  // Create initial detail file
  const initialDetail = {
    schemaVersion: 1,
    id,
    name,
    summary: summary || {},
    manufacturer: manufacturer || { en: 'Unknown' },
    platformId,
    variantId: platformId,
    peripheralPatterns: {},
    links: { schematic: null, datasheet: null, productPage: null },
    tags: tags || [],
    kconfigId: boardKconfigId,
    scaffold: req.body.scaffold || { template: 'tools/app_template/base', baseConfig: derivedBaseConfig },
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

  // Don't allow changing ID
  delete updates.id;
  delete updates.schemaVersion;
  delete updates.autoCommit;

  // Validate kconfigId if provided
  if (updates.kconfigId !== undefined) {
    if (updates.kconfigId && !/^[A-Z0-9][A-Z0-9_.]*$/.test(updates.kconfigId)) {
      return res.status(400).json({
        success: false,
        error: 'kconfigId must be UPPER_CASE (letters, numbers, underscores, dots)',
      });
    }
  }

  // Validate scaffold.baseConfig keys
  if (updates.scaffold?.baseConfig) {
    const invalidKeys = Object.keys(updates.scaffold.baseConfig).filter(k => !k.startsWith('CONFIG_'));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: `scaffold.baseConfig keys must start with CONFIG_: ${invalidKeys.join(', ')}`,
      });
    }
  }

  // Fields that go to the index
  const indexFields = ['name', 'platformId', 'manufacturer', 'summary', 'tags', 'image', 'published'];
  for (const key of indexFields) {
    if (updates[key] !== undefined) {
      board[key] = updates[key];
    }
  }

  // Save index
  await manifestLoader.saveBoardsIndex(boards);

  // Fields that go to the detail file: kconfigId, scaffold, variantId, demos, peripheralPatterns, links, source
  const detailFields = ['kconfigId', 'scaffold', 'variantId', 'links', 'source'];
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
      detail = {
        schemaVersion: 1,
        id: req.params.id,
        name: board.name,
        summary: board.summary || {},
        manufacturer: board.manufacturer || {},
        platformId: board.platformId,
        variantId: board.variantId || board.platformId,
      };
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
    return res.json({ success: true, peripheralPatterns: {} });
  }
  res.json({ success: true, peripheralPatterns: detail.peripheralPatterns || {} });
}));

// PATCH /api/boards/:id/peripherals - Update peripheral patterns
router.patch('/:id/peripherals', asyncHandler(async (req, res) => {
  const { peripheralPatterns } = req.body;
  if (!peripheralPatterns || typeof peripheralPatterns !== 'object') {
    return res.status(400).json({ success: false, error: 'Missing peripheralPatterns object' });
  }

  let detail = await manifestLoader.loadBoardDetail(req.params.id);
  if (!detail) {
    const boards = await manifestLoader.loadBoards();
    const item = boards?.items?.find(b => b.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: `Board "${req.params.id}" not found` });
    }
    detail = {
      schemaVersion: 1,
      id: req.params.id,
      name: item.name,
      summary: item.summary || {},
      manufacturer: item.manufacturer || {},
      platformId: item.platformId,
      variantId: item.variantId || item.platformId,
    };
  }

  detail.peripheralPatterns = peripheralPatterns;
  await manifestLoader.saveBoardDetail(req.params.id, detail);

  if (req.body.autoCommit !== false) {
    await gitSync.autoCommit(`feat(boards): update ${req.params.id} peripheral patterns`);
  }

  res.json({ success: true, peripheralPatterns, message: `Peripheral patterns updated for "${req.params.id}"` });
}));

export default router;
