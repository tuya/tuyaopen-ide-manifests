import Ajv from 'ajv';
import { manifestLoader } from './manifest-loader.js';

const ajv = new Ajv();

const BOARD_SCHEMA = {
  type: 'object',
  properties: {
    schemaVersion: { type: 'number' },
    id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    name: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            en: { type: 'string' },
            'zh-CN': { type: 'string' },
          },
          required: ['en'],
        },
      ],
    },
    summary: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            en: { type: 'string' },
            'zh-CN': { type: 'string' },
          },
        },
      ],
    },
    platformId: { type: 'string' },
    manufacturer: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            en: { type: 'string' },
            'zh-CN': { type: 'string' },
          },
        },
      ],
    },
    image: {
      oneOf: [
        { type: 'null' },
        {
          type: 'object',
          properties: {
            url: { type: 'string' },
            alt: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    en: { type: 'string' },
                    'zh-CN': { type: 'string' },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    tags: { type: 'array', items: { type: 'string' } },
    purchaseLink: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            en: { type: 'string' },
            'zh-CN': { type: 'string' },
          },
        },
      ],
    },
    guideDocs: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            en: { type: 'string' },
            'zh-CN': { type: 'string' },
          },
        },
      ],
    },
    schematicLink: { type: 'string' },
  },
  required: ['id', 'platformId'],
};

export class ManifestValidator {
  validateBoard(board) {
    const validate = ajv.compile(BOARD_SCHEMA);
    const valid = validate(board);

    return {
      valid,
      errors: valid ? [] : validate.errors?.map((err) => ({
        path: err.instancePath || '/root',
        message: err.message,
        keyword: err.keyword,
      })) || [],
    };
  }

  validateBoardId(id, allBoards) {
    const errors = [];

    // Check kebab-case
    if (!/^[a-z0-9-]+$/.test(id)) {
      errors.push('ID must be lowercase letters, numbers, and hyphens only (kebab-case)');
    }

    // Check uniqueness
    if (allBoards && allBoards.items && allBoards.items.some((b) => b.id === id)) {
      errors.push(`ID "${id}" already exists`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateUrl(url) {
    if (!url) return { valid: true };
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('https')) {
        return { valid: false, errors: ['URL must use HTTPS protocol'] };
      }
      return { valid: true };
    } catch {
      return { valid: false, errors: ['Invalid URL format'] };
    }
  }

  validateLocalizedString(value) {
    if (typeof value === 'string') {
      return { valid: true };
    }

    if (typeof value === 'object' && value !== null) {
      if (typeof value.en !== 'string') {
        return { valid: false, errors: ['English (en) translation required'] };
      }
      return { valid: true };
    }

    return { valid: false, errors: ['Must be string or localized object'] };
  }

  async validateTags(tags) {
    if (!tags || !Array.isArray(tags)) {
      return { valid: true };
    }

    try {
      await manifestLoader.loadTags();
      const tagsData = manifestLoader.getTags();

      if (!tagsData || !tagsData.tags) {
        return { valid: true };
      }

      const validTagIds = new Set(tagsData.tags.map(t => t.id));
      const invalidTags = tags.filter(tag => !validTagIds.has(tag));

      if (invalidTags.length > 0) {
        return {
          valid: false,
          errors: [`Invalid tags: ${invalidTags.join(', ')}. Use tags from the global tags registry.`],
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, errors: [`Error validating tags: ${error.message}`] };
    }
  }
}

export const validator = new ManifestValidator();
