import fs from 'fs/promises';
import path from 'path';
import { config } from '../../config.js';

class ManifestLoader {
  constructor() {
    this.cache = {
      boards: null,
      demos: null,
      platforms: null,
      skills: null,
      tags: null,
    };
    this.lastLoaded = {
      boards: null,
      demos: null,
      platforms: null,
      skills: null,
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

  // Skills index lives at skills/index.json. Item-only metadata (the SKILL.md
  // payloads live elsewhere under skills/<surface>/<id>/ and are not edited here).
  async loadSkills() {
    try {
      const filePath = path.join(config.paths.skills, 'index.json');
      await fs.access(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      this.cache.skills = data;
      this.lastLoaded.skills = new Date();
      return data;
    } catch (error) {
      console.error('Error loading skills manifest:', error.message);
      throw new Error(`Failed to load skills manifest: ${error.message}`);
    }
  }

  async saveSkillsIndex(data) {
    try {
      const filePath = path.join(config.paths.skills, 'index.json');
      const jsonContent = JSON.stringify(data, null, 2) + '\n';
      await fs.writeFile(filePath, jsonContent, 'utf-8');
      this.cache.skills = data;
      return true;
    } catch (error) {
      console.error('Error saving skills manifest:', error.message);
      throw new Error(`Failed to save skills manifest: ${error.message}`);
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

  // Move a board's detail file into the directory of newPlatformId (the SDK
  // platform group), used when a board's platformId changes. Locates the current
  // file wherever it sits; no-op if already in place or missing.
  async moveBoardDetail(boardId, newPlatformId) {
    const src = await this.findBoardDetailPath(boardId);
    if (!src) return null;
    const destDir = path.join(config.paths.boards, newPlatformId);
    await fs.mkdir(destDir, { recursive: true });
    const dest = path.join(destDir, `${boardId}.json`);
    if (path.resolve(src) === path.resolve(dest)) return dest;
    await fs.rename(src, dest);
    return dest;
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

  async savePlatformsIndex(data) {
    try {
      const filePath = path.join(config.paths.platforms, 'index.json');
      const jsonContent = JSON.stringify(data, null, 2) + '\n';
      await fs.writeFile(filePath, jsonContent, 'utf-8');
      this.cache.platforms = data;
      return true;
    } catch (error) {
      console.error('Error saving platforms manifest:', error.message);
      throw new Error(`Failed to save platforms manifest: ${error.message}`);
    }
  }

  // Variant detail lives at platforms/<platformId>/<variantId>.json.
  async loadPlatformVariantDetail(platformId, variantId) {
    try {
      const filePath = path.join(config.paths.platforms, platformId, `${variantId}.json`);
      await fs.access(filePath);
      return JSON.parse(await fs.readFile(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  async savePlatformVariantDetail(platformId, variantId, data) {
    const dir = path.join(config.paths.platforms, platformId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${variantId}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    return filePath;
  }

  async deletePlatformVariantDetail(platformId, variantId) {
    try { await fs.unlink(path.join(config.paths.platforms, platformId, `${variantId}.json`)); } catch { /* ignore */ }
  }

  async deletePlatformDir(platformId) {
    try { await fs.rm(path.join(config.paths.platforms, platformId), { recursive: true, force: true }); } catch { /* ignore */ }
  }

  async loadPlatformTemplate() {
    try {
      const filePath = path.join(config.paths.platforms, 'platform-template.json');
      return JSON.parse(await fs.readFile(filePath, 'utf-8'));
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

  // Detail files live under demos/<type>/<id>.json (type = example | app).
  async loadDemoDetail(demoId, type) {
    const subs = type ? [type === 'app' ? 'app' : 'example'] : ['example', 'app'];
    for (const sub of subs) {
      try {
        const filePath = path.join(config.paths.demos, sub, `${demoId}.json`);
        await fs.access(filePath);
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
      } catch { /* try next */ }
    }
    return null;
  }

  async saveDemoDetail(demoId, data, type) {
    const sub = type === 'app' ? 'app' : 'example';
    const dir = path.join(config.paths.demos, sub);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${demoId}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    return filePath;
  }

  async deleteDemoDetail(demoId, type) {
    const subs = type ? [type === 'app' ? 'app' : 'example'] : ['example', 'app'];
    for (const sub of subs) {
      try { await fs.unlink(path.join(config.paths.demos, sub, `${demoId}.json`)); } catch { /* ignore */ }
    }
  }
}

export const manifestLoader = new ManifestLoader();
