import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { config } from '../../config.js';
import { manifestLoader } from './manifest-loader.js';

class ImageManager {
  async uploadImage(boardId, filePath, filename, imageType = 'board') {
    try {
      const boardImageDir = path.join(config.paths.images, boardId);
      await fs.mkdir(boardImageDir, { recursive: true });

      const targetPath = path.join(boardImageDir, filename);

      // Read source metadata for validation
      const metadata = await sharp(filePath).metadata();
      const minSide = Math.min(metadata.width, metadata.height);
      if (minSide < config.imageMinDimension) {
        throw new Error(
          `Image must be at least ${config.imageMinDimension}px on shortest side (got ${minSide}px)`
        );
      }

      // Select target spec based on image type
      const spec = config.imageSpecs[imageType] || config.imageSpecs.board;

      // Adaptive compression: resize then reduce quality until ≤ maxFileSize
      let quality = config.imageQuality;
      let outputBuffer;
      do {
        outputBuffer = await sharp(filePath)
          .resize(spec.width, spec.height, {
            fit: 'cover',
            position: 'centre',
          })
          .jpeg({ quality })
          .toBuffer();
        quality -= 5;
      } while (outputBuffer.length > config.imageMaxFileSize && quality > 30);

      await fs.writeFile(targetPath, outputBuffer);

      // Get final dimensions from the buffer
      const outputMeta = await sharp(outputBuffer).metadata();

      const relativePath = `images/${boardId}/${filename}`;

      return {
        success: true,
        url: relativePath,
        filename,
        size: outputBuffer.length,
        width: outputMeta.width,
        height: outputMeta.height,
      };
    } catch (error) {
      console.error('Error uploading image:', error.message);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(boardId, filename) {
    try {
      const imagePath = path.join(config.paths.images, boardId, filename);

      // Check if file exists
      await fs.access(imagePath);

      // Delete file
      await fs.unlink(imagePath);

      // Try to remove directory if empty
      try {
        const boardDir = path.join(config.paths.images, boardId);
        const files = await fs.readdir(boardDir);
        if (files.length === 0) {
          await fs.rmdir(boardDir);
        }
      } catch {
        // Directory not empty or doesn't exist, ignore
      }

      return { success: true, message: 'Image deleted' };
    } catch (error) {
      console.error('Error deleting image:', error.message);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async getImageUrl(boardId, filename) {
    try {
      const imagePath = path.join(config.paths.images, boardId, filename);
      await fs.access(imagePath);
      return `images/${boardId}/${filename}`;
    } catch {
      return null;
    }
  }

  async getBoardImages(boardId) {
    try {
      const boardImageDir = path.join(config.paths.images, boardId);

      try {
        await fs.access(boardImageDir);
      } catch {
        return [];
      }

      const files = await fs.readdir(boardImageDir);
      const images = [];

      for (const file of files) {
        const filePath = path.join(boardImageDir, file);
        const stats = await fs.stat(filePath);

        images.push({
          filename: file,
          url: `images/${boardId}/${file}`,
          size: stats.size,
        });
      }

      return images;
    } catch (error) {
      console.error('Error getting board images:', error.message);
      throw new Error(`Failed to get board images: ${error.message}`);
    }
  }

  async updateBoardImage(boardId, imageUrl) {
    try {
      const boards = await manifestLoader.loadBoards();

      // Find and update the board
      if (boards.items) {
        const board = boards.items.find((b) => b.id === boardId);
        if (board) {
          if (!board.image) {
            board.image = {};
          }
          board.image.url = imageUrl;

          // Save updated manifest
          await manifestLoader.saveBoardsIndex(boards);
          return { success: true };
        }
      }

      throw new Error(`Board "${boardId}" not found`);
    } catch (error) {
      console.error('Error updating board image:', error.message);
      throw new Error(`Failed to update board image: ${error.message}`);
    }
  }

  async uploadDemoImage(demoId, filePath, filename, imageType = 'demo') {
    try {
      const demoImageDir = path.join(config.paths.demoImages, demoId);
      await fs.mkdir(demoImageDir, { recursive: true });

      const targetPath = path.join(demoImageDir, filename);

      const metadata = await sharp(filePath).metadata();
      const minSide = Math.min(metadata.width, metadata.height);
      if (minSide < config.imageMinDimension) {
        throw new Error(
          `Image must be at least ${config.imageMinDimension}px on shortest side (got ${minSide}px)`
        );
      }

      const spec = config.imageSpecs[imageType] || config.imageSpecs.demo;

      let quality = config.imageQuality;
      let outputBuffer;
      do {
        outputBuffer = await sharp(filePath)
          .resize(spec.width, spec.height, {
            fit: 'cover',
            position: 'centre',
          })
          .jpeg({ quality })
          .toBuffer();
        quality -= 5;
      } while (outputBuffer.length > config.imageMaxFileSize && quality > 30);

      await fs.writeFile(targetPath, outputBuffer);

      const outputMeta = await sharp(outputBuffer).metadata();
      const relativePath = `images/${demoId}/${filename}`;

      return {
        success: true,
        url: relativePath,
        filename,
        size: outputBuffer.length,
        width: outputMeta.width,
        height: outputMeta.height,
      };
    } catch (error) {
      console.error('Error uploading demo image:', error.message);
      throw new Error(`Failed to upload demo image: ${error.message}`);
    }
  }

  async updateDemoImage(demoId, imageUrl) {
    try {
      const demos = await manifestLoader.loadDemos();

      if (demos.items) {
        const demo = demos.items.find((d) => d.id === demoId);
        if (demo) {
          if (!demo.image) {
            demo.image = {};
          }
          demo.image.url = imageUrl;

          await manifestLoader.saveDemosIndex(demos);

          // Also update detail file if it exists
          let detail = await manifestLoader.loadDemoDetail(demoId);
          if (detail) {
            if (!detail.image) {
              detail.image = {};
            }
            detail.image.url = imageUrl;
            await manifestLoader.saveDemoDetail(demoId, detail);
          }

          return { success: true };
        }
      }

      throw new Error(`Demo "${demoId}" not found`);
    } catch (error) {
      console.error('Error updating demo image:', error.message);
      throw new Error(`Failed to update demo image: ${error.message}`);
    }
  }

  async getDemoImages(demoId) {
    try {
      const demoImageDir = path.join(config.paths.demoImages, demoId);

      try {
        await fs.access(demoImageDir);
      } catch {
        return [];
      }

      const files = await fs.readdir(demoImageDir);
      const images = [];

      for (const file of files) {
        const filePath = path.join(demoImageDir, file);
        const stats = await fs.stat(filePath);

        images.push({
          filename: file,
          url: `images/${demoId}/${file}`,
          size: stats.size,
        });
      }

      return images;
    } catch (error) {
      console.error('Error getting demo images:', error.message);
      throw new Error(`Failed to get demo images: ${error.message}`);
    }
  }

  async deleteDemoImage(demoId, filename) {
    try {
      const imagePath = path.join(config.paths.demoImages, demoId, filename);

      await fs.access(imagePath);
      await fs.unlink(imagePath);

      try {
        const demoDir = path.join(config.paths.demoImages, demoId);
        const files = await fs.readdir(demoDir);
        if (files.length === 0) {
          await fs.rmdir(demoDir);
        }
      } catch {
        // ignore
      }

      return { success: true, message: 'Demo image deleted' };
    } catch (error) {
      console.error('Error deleting demo image:', error.message);
      throw new Error(`Failed to delete demo image: ${error.message}`);
    }
  }

  // --- Platforms (images live at platforms/images/<id>/<file>) ---

  async uploadPlatformImage(platformId, filePath, filename, imageType = 'platform') {
    try {
      const dir = path.join(config.paths.platformImages, platformId);
      await fs.mkdir(dir, { recursive: true });
      const targetPath = path.join(dir, filename);

      const metadata = await sharp(filePath).metadata();
      const minSide = Math.min(metadata.width, metadata.height);
      if (minSide < config.imageMinDimension) {
        throw new Error(
          `Image must be at least ${config.imageMinDimension}px on shortest side (got ${minSide}px)`
        );
      }

      const spec = config.imageSpecs[imageType] || config.imageSpecs.platform;
      let quality = config.imageQuality;
      let outputBuffer;
      do {
        outputBuffer = await sharp(filePath)
          .resize(spec.width, spec.height, { fit: 'cover', position: 'centre' })
          .jpeg({ quality })
          .toBuffer();
        quality -= 5;
      } while (outputBuffer.length > config.imageMaxFileSize && quality > 30);

      await fs.writeFile(targetPath, outputBuffer);
      const outputMeta = await sharp(outputBuffer).metadata();
      const relativePath = `images/${platformId}/${filename}`;

      return {
        success: true,
        url: relativePath,
        filename,
        size: outputBuffer.length,
        width: outputMeta.width,
        height: outputMeta.height,
      };
    } catch (error) {
      console.error('Error uploading platform image:', error.message);
      throw new Error(`Failed to upload platform image: ${error.message}`);
    }
  }

  async updatePlatformImage(platformItemId, imageUrl) {
    try {
      const platforms = await manifestLoader.loadPlatforms();
      const item = platforms?.items?.find((p) => p.id === platformItemId);
      if (!item) throw new Error(`Platform "${platformItemId}" not found`);
      if (!item.image) item.image = {};
      item.image.url = imageUrl;
      await manifestLoader.savePlatformsIndex(platforms);
      return { success: true };
    } catch (error) {
      console.error('Error updating platform image:', error.message);
      throw new Error(`Failed to update platform image: ${error.message}`);
    }
  }

  async getPlatformImages(platformItemId) {
    try {
      const dir = path.join(config.paths.platformImages, platformItemId);
      try { await fs.access(dir); } catch { return []; }
      const files = await fs.readdir(dir);
      const images = [];
      for (const file of files) {
        const stats = await fs.stat(path.join(dir, file));
        images.push({ filename: file, url: `images/${platformItemId}/${file}`, size: stats.size });
      }
      return images;
    } catch (error) {
      console.error('Error getting platform images:', error.message);
      throw new Error(`Failed to get platform images: ${error.message}`);
    }
  }

  async deletePlatformImage(platformItemId, filename) {
    try {
      const imagePath = path.join(config.paths.platformImages, platformItemId, filename);
      await fs.access(imagePath);
      await fs.unlink(imagePath);
      try {
        const dir = path.join(config.paths.platformImages, platformItemId);
        const files = await fs.readdir(dir);
        if (files.length === 0) await fs.rmdir(dir);
      } catch { /* ignore */ }
      return { success: true, message: 'Platform image deleted' };
    } catch (error) {
      console.error('Error deleting platform image:', error.message);
      throw new Error(`Failed to delete platform image: ${error.message}`);
    }
  }
}

export const imageManager = new ImageManager();
