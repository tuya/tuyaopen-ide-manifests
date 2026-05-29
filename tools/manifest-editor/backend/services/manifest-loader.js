import fs from 'fs/promises';
import path from 'path';
import { config } from '../../config.js';

class ManifestLoader {
  constructor() {
    this.cache = {
      boards: null,
      demos: null,
      platforms: null,
      tags: null,
    };
    this.lastLoaded = {
      boards: null,
      demos: null,
      platforms: null,
      tags: null,
    };
  }

  async loadBoards(forceRefresh = false) {
    try {
      const filePath = path.join(config.paths.boards, 'index.json');

      // Check if file exists
      await fs.access(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      this.cache.boards = data;
      this.lastLoaded.boards = new Date();

      return data;
    } catch (error) {
      console.error('Error loading boards manifest:', error.message);
      throw new Error(`Failed to load boards manifest: ${error.message}`);
    }
  }

  async loadDemos(forceRefresh = false) {
    try {
      const filePath = path.join(config.paths.demos, 'index.json');

      await fs.access(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      this.cache.demos = data;
      this.lastLoaded.demos = new Date();

      return data;
    } catch (error) {
      console.error('Error loading demos manifest:', error.message);
      throw new Error(`Failed to load demos manifest: ${error.message}`);
    }
  }

  async loadPlatforms(forceRefresh = false) {
    try {
      const filePath = path.join(config.paths.platforms, 'index.json');

      await fs.access(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      this.cache.platforms = data;
      this.lastLoaded.platforms = new Date();

      return data;
    } catch (error) {
      console.error('Error loading platforms manifest:', error.message);
      throw new Error(`Failed to load platforms manifest: ${error.message}`);
    }
  }

  getBoards() {
    return this.cache.boards;
  }

  getDemos() {
    return this.cache.demos;
  }

  getPlatforms() {
    return this.cache.platforms;
  }

  async loadTags(forceRefresh = false) {
    try {
      const filePath = path.join(config.paths.boards, 'tags.json');

      await fs.access(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      this.cache.tags = data;
      this.lastLoaded.tags = new Date();

      return data;
    } catch (error) {
      console.error('Error loading tags manifest:', error.message);
      throw new Error(`Failed to load tags manifest: ${error.message}`);
    }
  }

  getTags() {
    return this.cache.tags;
  }

  async saveBoardsIndex(data) {
    try {
      const filePath = path.join(config.paths.boards, 'index.json');
      const jsonContent = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonContent, 'utf-8');
      this.cache.boards = data;
      return true;
    } catch (error) {
      console.error('Error saving boards manifest:', error.message);
      throw new Error(`Failed to save boards manifest: ${error.message}`);
    }
  }

  async findBoardDetailPath(boardId) {
    const boardsDir = config.paths.boards;
    const entries = await fs.readdir(boardsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(boardsDir, entry.name, `${boardId}.json`);
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // not in this directory
      }
    }
    return null;
  }

  async loadBoardDetail(boardId) {
    const filePath = await this.findBoardDetailPath(boardId);
    if (!filePath) return null;
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  async saveBoardDetail(boardId, data) {
    let filePath = await this.findBoardDetailPath(boardId);
    if (!filePath) {
      const boards = this.cache.boards || await this.loadBoards();
      const item = boards.items.find(b => b.id === boardId);
      const platformId = item ? item.platformId : 'unknown';
      const dir = path.join(config.paths.boards, platformId);
      await fs.mkdir(dir, { recursive: true });
      filePath = path.join(dir, `${boardId}.json`);
    }
    const jsonContent = JSON.stringify(data, null, 2) + '\n';
    await fs.writeFile(filePath, jsonContent, 'utf-8');
    return filePath;
  }

  async loadPlatformDetail(platformId) {
    try {
      const filePath = path.join(config.paths.platforms, platformId, `${platformId}.json`);
      await fs.access(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // --- Demos ---

  async saveDemosIndex(data) {
    try {
      const filePath = path.join(config.paths.demos, 'index.json');
      const jsonContent = JSON.stringify(data, null, 2) + '\n';
      await fs.writeFile(filePath, jsonContent, 'utf-8');
      this.cache.demos = data;
      return true;
    } catch (error) {
      console.error('Error saving demos manifest:', error.message);
      throw new Error(`Failed to save demos manifest: ${error.message}`);
    }
  }

  async loadDemoDetail(demoId) {
    try {
      const filePath = path.join(config.paths.demos, `${demoId}.json`);
      await fs.access(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async saveDemoDetail(demoId, data) {
    const filePath = path.join(config.paths.demos, `${demoId}.json`);
    const jsonContent = JSON.stringify(data, null, 2) + '\n';
    await fs.writeFile(filePath, jsonContent, 'utf-8');
    return filePath;
  }

  async deleteDemoDetail(demoId) {
    try {
      const filePath = path.join(config.paths.demos, `${demoId}.json`);
      await fs.unlink(filePath);
    } catch {
      // File may not exist — ignore
    }
  }
}

export const manifestLoader = new ManifestLoader();
