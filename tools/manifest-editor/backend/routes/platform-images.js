import express from 'express';
import multer from 'multer';
import path from 'path';
import { config } from '../../config.js';
import { imageManager } from '../services/image-manager.js';
import { manifestLoader } from '../services/manifest-loader.js';
import { gitSync } from '../services/git-sync.js';
import { asyncHandler } from '../middleware/error-handler.js';
import fs from 'fs/promises';

const router = express.Router();

const uploadsDir = config.paths.uploads;
try { await fs.mkdir(uploadsDir, { recursive: true }); } catch { /* exists */ }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `platform-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP)'));
  },
  limits: { fileSize: config.imageMaxSize },
});

// POST /api/platform-images/upload
router.post('/upload', upload.single('image'), asyncHandler(async (req, res) => {
  const { platformId, filename } = req.body;
  const uploadedFile = req.file;

  if (!platformId) {
    if (uploadedFile) await fs.unlink(uploadedFile.path).catch(() => {});
    return res.status(400).json({ success: false, error: 'platformId is required' });
  }
  if (!uploadedFile) {
    return res.status(400).json({ success: false, error: 'No image file provided' });
  }

  try {
    const imageName = filename || `${platformId}.jpg`;
    const result = await imageManager.uploadPlatformImage(platformId, uploadedFile.path, imageName, 'platform');
    await fs.unlink(uploadedFile.path).catch(() => {});

    if (req.body.autoUpdate !== 'false') {
      await imageManager.updatePlatformImage(platformId, result.url);
      if (req.body.autoCommit !== 'false') {
        await gitSync.autoCommit(`assets(platforms): add image for ${platformId}`);
      }
    }

    res.json({ success: true, image: result, message: 'Platform image uploaded successfully' });
  } catch (error) {
    if (uploadedFile) await fs.unlink(uploadedFile.path).catch(() => {});
    throw error;
  }
}));

// GET /api/platform-images/:platformId
router.get('/:platformId', asyncHandler(async (req, res) => {
  const images = await imageManager.getPlatformImages(req.params.platformId);
  res.json({ success: true, platformId: req.params.platformId, images, count: images.length });
}));

// DELETE /api/platform-images/:platformId/:filename
router.delete('/:platformId/:filename', asyncHandler(async (req, res) => {
  const { platformId, filename } = req.params;
  await imageManager.deletePlatformImage(platformId, filename);

  // Clear the index image reference when the deleted file was the active one,
  // so the card falls back to the "no image" placeholder instead of a broken img.
  const platforms = await manifestLoader.loadPlatforms();
  const item = platforms?.items?.find((p) => p.id === platformId);
  if (item?.image?.url && item.image.url.endsWith(`/${filename}`)) {
    delete item.image;
    await manifestLoader.savePlatformsIndex(platforms);
  }

  if (req.body?.autoCommit !== 'false') {
    await gitSync.autoCommit(`assets(platforms): remove image for ${platformId}`);
  }
  res.json({ success: true, message: `Image deleted for platform "${platformId}"` });
}));

// Serve platform images statically (platforms/images/...)
router.use('/', express.static(config.paths.platformImages));

export default router;
