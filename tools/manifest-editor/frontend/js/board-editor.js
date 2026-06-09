// Board Editor module

import { apiClient } from './api-client.js';
import { escapeHtml, showNotification, showError, getLocalizedString, setLocalizedString } from './utils.js';
import { openImageUploadModal } from './image-uploader.js';
import i18n from './i18n.js';

let globalTagsList = [];
let globalTagCategories = [];

export async function initGlobalTags() {
  try {
    const result = await apiClient.getTags();
    if (result.success && result.categories) {
      globalTagCategories = result.categories;
      globalTagsList = [];
      for (const cat of result.categories) {
        for (const t of cat.tags) {
          globalTagsList.push({
            id: t.id,
            categoryId: cat.id,
            label: i18n.getLanguage() === 'zh-CN' ? t['zh-CN'] : t.en,
            en: t.en,
            zh: t['zh-CN'],
          });
        }
      }
    }
  } catch (error) {
    console.error('Error loading tags:', error);
  }
}

function validateHttpsUrl(url) {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function renderBoardForm(board = null) {
  const isNew = !board;
  const title = isNew ? 'Create New Board' : 'Edit Board';

  const formHtml = `
    <form id="boardForm" class="board-form" style="max-width: none; width: 100%; padding: 24px;">
      <!-- Quality Guidance Banner -->
      <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <div style="font-weight: 600; color: #0c4a6e; margin-bottom: 8px;">💡 质量提示</div>
        <div style="color: #0c4a6e; font-size: 0.95em; line-height: 1.6;">
          <strong>优质的开发板信息是开发者的第一步。</strong> 请认真完整地填写以下内容：
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>✓ 准确的Board ID - 与TuyaOpen SDK中的board.config匹配</li>
            <li>✓ 清晰的描述 - 用简明的语言说明开发板的功能和特性</li>
            <li>✓ 完整的文档链接 - 提供原理图、用户指南等重要资源</li>
            <li>✓ 正确的采购链接 - 帮助开发者快速获取硬件</li>
          </ul>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label required" for="boardId">Board ID</label>
        <div style="background-color: var(--color-warning); color: var(--color-fg); padding: 8px; border-radius: 4px; margin-bottom: 8px; font-size: 0.9em; border-left: 4px solid #f59e0b;">
          <strong>⚠️ 关键字段:</strong> Board ID 必须与 TuyaOpen SDK 中 board.config 完全匹配。创建后无法更改！
        </div>
        <input
          type="text"
          id="boardId"
          name="id"
          class="form-input"
          pattern="^[a-z0-9\\-]+$"
          placeholder="例如: tuya-t5ai-board"
          value="${board ? escapeHtml(board.id) : ''}"
          ${!isNew ? 'readonly' : ''}
          required
        >
        <small style="color: var(--color-muted);">格式: 小写字母、数字、连字符 (kebab-case)</small>
        <div class="form-error" id="idError"></div>
      </div>

      <!-- Published Toggle -->
      <div class="form-group" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--color-hover); border-radius: 6px;">
        <input type="checkbox" id="boardPublished" name="published" ${board?.published !== false ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        <label for="boardPublished" style="margin: 0; cursor: pointer; font-weight: 500;">Published</label>
        <small style="color: var(--color-muted); margin-left: auto;">Visible in IDE when checked</small>
      </div>

      <!-- EN/ZH Pair: Board Name -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label required" for="boardName">Board Name (English)</label>
          <input
            type="text"
            id="boardName"
            name="name_en"
            class="form-input"
            placeholder="e.g., Tuya T5AI Development Board"
            value="${board ? escapeHtml(getLocalizedString(board.name) || board.name?.en || '') : ''}"
            required
          >
          <small style="color: var(--color-muted);">Official name, concise and accurate</small>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="boardNameZh">开发板名称 (中文)</label>
          <input
            type="text"
            id="boardNameZh"
            name="name_zh"
            class="form-input"
            placeholder="例如: 涂鸦 T5AI 开发板"
            value="${board ? escapeHtml(board.name?.['zh-CN'] || '') : ''}"
          >
          <small style="color: var(--color-muted);">中文官方名称</small>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label required" for="platformId">Chip Platform / 芯片平台</label>
        <select id="platformId" name="platformId" class="form-select" required>
          <option value="">-- Select Platform / 选择平台 --</option>
          ${board ? `<option value="${escapeHtml(board.platformId)}" selected>${escapeHtml(board.platformId)}</option>` : ''}
        </select>
        <small style="color: var(--color-muted);">Select the chip platform this board is based on</small>
        <div class="form-error" id="platformError"></div>
      </div>

      <!-- Kconfig ID -->
      <div class="form-group">
        <label class="form-label" for="kconfigId" data-i18n="boardKconfigId">Kconfig ID</label>
        <input
          type="text"
          id="kconfigId"
          name="kconfigId"
          class="form-input"
          pattern="^[A-Z0-9][A-Z0-9_.]*$"
          placeholder="TUYA_T5AI_EVB"
          value="${board ? escapeHtml(board.kconfigId || '') : ''}"
        >
        <small style="color: var(--color-muted);" data-i18n="boardKconfigIdHint">Must match SDK board directory name (e.g. TUYA_T5AI_EVB)</small>
      </div>

      <!-- Scaffold Settings (collapsible, optional) -->
      <details class="form-details">
        <summary class="form-details-summary" data-i18n="boardScaffold">⚙️ Scaffold Settings（可选，不填则自动生成）</summary>
        <div class="form-details-body">
          <div style="background-color: var(--color-hover); padding: 10px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 0.85em; color: var(--color-muted);">
            默认值：Template = <code>tools/app_template/base</code>，Base Config 根据 Platform 和 Kconfig ID 自动生成。
          </div>
          <div class="form-group">
            <label class="form-label" for="scaffoldTemplate" data-i18n="boardScaffoldTemplate">Template Path</label>
            <input
              type="text"
              id="scaffoldTemplate"
              name="scaffoldTemplate"
              class="form-input"
              placeholder="tools/app_template/base"
              value="${board && board.scaffold ? escapeHtml(board.scaffold.template || '') : ''}"
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="scaffoldBaseConfig" data-i18n="boardScaffoldBaseConfig">Base Config (JSON)</label>
            <textarea
              id="scaffoldBaseConfig"
              name="scaffoldBaseConfig"
              class="form-textarea form-monospace"
              rows="4"
              placeholder='自动生成，例如：{"CONFIG_BOARD_CHOICE_T5AI": "y", "CONFIG_BOARD_CHOICE_TUYA_T5AI_EVB": "y"}'
            >${board && board.scaffold?.baseConfig ? escapeHtml(JSON.stringify(board.scaffold.baseConfig, null, 2)) : ''}</textarea>
          </div>
        </div>
      </details>

      <!-- EN/ZH Pair: Summary -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="boardSummary">Function Description (English)</label>
          <textarea
            id="boardSummary"
            name="summary_en"
            class="form-textarea"
            placeholder="e.g., High-performance board with WiFi, BLE, AI acceleration, built-in microphone and LED"
            style="min-height: 80px;"
          >${board ? escapeHtml(board.summary?.en || '') : ''}</textarea>
          <small style="color: var(--color-muted);">Concise description of key features and capabilities</small>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="boardSummaryZh">功能描述 (中文)</label>
          <textarea
            id="boardSummaryZh"
            name="summary_zh"
            class="form-textarea"
            placeholder="功能描述的中文版本"
            style="min-height: 80px;"
          >${board ? escapeHtml(board.summary?.['zh-CN'] || '') : ''}</textarea>
          <small style="color: var(--color-muted);">中文版功能描述</small>
        </div>
      </div>

      <!-- Manufacturer -->
      <div class="form-group">
        <label class="form-label" for="manufacturer">Manufacturer / 制造商</label>
        <input
          type="text"
          id="manufacturer"
          name="manufacturer"
          class="form-input"
          placeholder="e.g., Tuya, Espressif"
          value="${board ? escapeHtml(getLocalizedString(board.manufacturer) || board.manufacturer?.en || '') : ''}"
        >
        <small style="color: var(--color-muted);">Board manufacturer name</small>
      </div>

      <!-- Tags Selection -->
      <div class="form-group">
        <label class="form-label" for="tags">Tags / 标签</label>
        <div id="tagsContainer" class="tags-chip-input">
          <div id="selectedTags" class="tags-chips"></div>
          <div class="tags-add-wrapper">
            <input type="text" id="tagsSearchInput" class="form-input tags-search" placeholder="Type to search tags..." autocomplete="off">
            <div id="tagsDropdown" class="tags-dropdown" style="display: none;"></div>
          </div>
        </div>
        <input type="hidden" id="tags" name="tags">
        <small style="color: var(--color-muted);">Click tags below to add, or type to filter. Click × to remove.</small>
        <div id="tagsAvailablePool" class="tags-available-pool"></div>
      </div>

      <!-- Links: Schematic -->
      <div class="form-group">
        <label class="form-label" for="schematicLink">Schematic Link (HTTPS) / 原理图链接</label>
        <input
          type="url"
          id="schematicLink"
          name="schematicLink"
          class="form-input url-input"
          placeholder="https://..."
          value="${board ? escapeHtml(board.schematicLink || '') : ''}"
          data-url-type="schematicLink"
        >
        <small style="color: var(--color-muted);">Direct link to board schematic PDF or image</small>
        <div class="form-error" id="schematicError"></div>
      </div>

      <!-- EN/ZH Pair: Guide Docs -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="guideDocs">User Manual (English) / 用户手册</label>
          <input
            type="url"
            id="guideDocs"
            name="guideDocs_en"
            class="form-input url-input"
            placeholder="https://..."
            value="${board ? escapeHtml(board.guideDocs?.en || '') : ''}"
            data-url-type="guideDocs_en"
          >
          <small style="color: var(--color-muted);">User guide with pin definitions and usage</small>
          <div class="form-error" id="guideDocsError"></div>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="guideDocsZh">用户手册 (中文)</label>
          <input
            type="url"
            id="guideDocsZh"
            name="guideDocs_zh"
            class="form-input url-input"
            placeholder="https://..."
            value="${board ? escapeHtml(board.guideDocs?.['zh-CN'] || '') : ''}"
            data-url-type="guideDocs_zh"
          >
          <small style="color: var(--color-muted);">中文版用户手册</small>
          <div class="form-error" id="guideDocsZhError"></div>
        </div>
      </div>

      <!-- EN/ZH Pair: Purchase Links -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="purchaseLink">Purchase Link (English) / 采购链接</label>
          <input
            type="url"
            id="purchaseLink"
            name="purchaseLink_en"
            class="form-input url-input"
            placeholder="https://..."
            value="${board ? escapeHtml(board.purchaseLink?.en || '') : ''}"
            data-url-type="purchaseLink_en"
          >
          <small style="color: var(--color-muted);">Official or authorized sales channel</small>
          <div class="form-error" id="purchaseLinkError"></div>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="purchaseLinkZh">采购链接 (中文)</label>
          <input
            type="url"
            id="purchaseLinkZh"
            name="purchaseLink_zh"
            class="form-input url-input"
            placeholder="https://..."
            value="${board ? escapeHtml(board.purchaseLink?.['zh-CN'] || '') : ''}"
            data-url-type="purchaseLink_zh"
          >
          <small style="color: var(--color-muted);">中文采购渠道</small>
          <div class="form-error" id="purchaseLinkZhError"></div>
        </div>
      </div>

      <!-- Links: 3D Model -->
      <div class="form-group">
        <label class="form-label" for="threeDModelLink">3D Model Link (HTTPS) / 3D 模型链接</label>
        <input
          type="url"
          id="threeDModelLink"
          name="threeDModelLink"
          class="form-input url-input"
          placeholder="https://..."
          value="${board ? escapeHtml(board.threeDModelLink || '') : ''}"
          data-url-type="threeDModelLink"
        >
        <small style="color: var(--color-muted);">Link to 3D model file (STEP/ZIP)</small>
        <div class="form-error" id="threeDModelLinkError"></div>
      </div>

      <!-- Source: Board BSP -->
      <div class="form-group">
        <label class="form-label" style="display:inline-flex;align-items:center;gap:6px">
          Board BSP Source / 板级BSP驱动源代码
          <span title="提供板级 BSP 驱动源代码链接供用户参考，与实际创建项目的代码无逻辑关联。" style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:var(--color-border,#ddd);color:var(--color-muted,#666);font-size:11px;font-weight:700;cursor:help;">?</span>
        </label>
        <div style="margin-bottom:8px">
          <label class="form-label" for="sourceRepo" style="font-size:12px">Repository URL</label>
          <input
            type="url"
            id="sourceRepo"
            name="sourceRepo"
            class="form-input url-input"
            placeholder="https://github.com/tuya/tuyaopen.git"
            value="${board?.source?.repo ? escapeHtml(board.source.repo) : ''}"
            data-url-type="sourceRepo"
          >
          <div class="form-error" id="sourceRepoError"></div>
        </div>
        <label class="form-label" for="sourceSubpath" style="font-size:12px">Subpath within repo</label>
        <input
          type="text"
          id="sourceSubpath"
          name="sourceSubpath"
          class="form-input"
          placeholder="platform/t5ai/boards/tuya-t5-e1"
          value="${board?.source?.subpath ? escapeHtml(board.source.subpath) : ''}"
        >
        <small style="color: var(--color-muted);">供用户参考的 BSP 源代码链接，与项目生成逻辑无关</small>
      </div>

      <!-- Image Section -->
      <div class="form-group">
        <label class="form-label">Board Image</label>
        ${board ? `
          <div class="image-upload-inline">
            <!-- Image Source Tabs -->
            <div style="display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
              <button type="button" class="image-source-tab active" data-source="file" style="background: none; border: none; padding: 8px; cursor: pointer; font-weight: 500; color: var(--color-primary);">
                📁 Upload File
              </button>
              <button type="button" class="image-source-tab" data-source="url" style="background: none; border: none; padding: 8px; cursor: pointer; font-weight: 500; color: var(--color-muted);">
                🔗 From URL
              </button>
            </div>

            <!-- File Upload -->
            <div id="imageSourceFile" class="image-source-content">
              <div id="imageUploadZone" class="image-upload-zone">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p class="upload-text">Drag and drop image here or <strong>click to select</strong></p>
                <p class="image-recommendation">Recommended: 500×500 (1:1 square). Must be at least 500px.</p>
                <input type="file" id="boardImageInput" style="display: none;" accept="image/*" data-board-id="${escapeHtml(board.id)}">
              </div>
              <div id="uploadProgress" class="upload-progress" style="display: none;">
                <div class="progress-bar"></div>
                <p id="uploadStatus">Uploading...</p>
              </div>
            </div>

            <!-- URL Input -->
            <div id="imageSourceUrl" class="image-source-content" style="display: none;">
              <input
                type="url"
                id="imageUrl"
                class="form-input url-input"
                placeholder="https://example.com/image.jpg"
                style="margin-bottom: 8px;"
                data-url-type="imageUrl"
              >
              <small style="color: var(--color-muted); display: block; margin-bottom: 8px;">Enter a valid HTTPS image URL (JPEG, PNG, WebP)</small>
              <div style="display: flex; gap: 8px;">
                <button type="button" id="confirmUrlBtn" class="btn btn-primary">Use This URL</button>
              </div>
              <div id="urlPreview" class="image-preview hidden" style="margin-top: 12px;">
                <img id="urlPreviewImage" alt="Preview">
                <div class="preview-actions">
                  <button type="button" id="confirmUrlPreviewBtn" class="btn btn-primary">Confirm</button>
                  <button type="button" id="cancelUrlBtn" class="btn btn-outline">Cancel</button>
                </div>
              </div>
            </div>

            ${board.image?.url ? `
              <div class="current-image-preview" style="margin-top: 12px; padding: 12px; background-color: var(--color-hover); border-radius: 8px; text-align: center;">
                <img src="/api/images/${escapeHtml(board.image.url.replace('images/', ''))}" alt="Current board image" style="max-width: 200px; max-height: 200px; object-fit: contain; border-radius: 4px; border: 1px solid var(--color-border);">
                <small style="display: block; margin-top: 8px; color: var(--color-muted);">Current: ${escapeHtml(board.image.url)}</small>
              </div>
            ` : '<small style="color: var(--color-muted);">No image set yet</small>'}
          </div>
        ` : '<small style="color: var(--color-muted);">Save board first to upload images</small>'}
      </div>

      <div class="form-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--color-border);">
        <button type="button" id="cancelBtn" class="btn btn-outline">取消</button>
        <button type="submit" class="btn btn-primary">
          ${isNew ? '✓ 创建开发板' : '✓ 保存修改'}
        </button>
      </div>
    </form>

    <style>
      .form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .form-col-half { display: flex; flex-direction: column; gap: 8px; }
      .form-col-half .form-label { margin-bottom: 0; }

      .form-details {
        border: 1px solid var(--color-border);
        border-radius: 6px;
        margin-bottom: 24px;
      }
      .form-details-summary {
        font-weight: 600;
        font-size: 0.9em;
        padding: 12px 16px;
        cursor: pointer;
        user-select: none;
        list-style: none;
      }
      .form-details-summary::-webkit-details-marker { display: none; }
      .form-details-summary::before {
        content: '▶ ';
        font-size: 0.8em;
        transition: transform 0.2s;
        display: inline-block;
      }
      .form-details[open] > .form-details-summary::before {
        content: '▼ ';
      }
      .form-details-body {
        padding: 0 16px 16px;
      }

      .tags-input-wrapper { position: relative; }
      .tags-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        border-radius: 0 0 4px 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .tags-dropdown-list { padding: 4px 0; }
      .tags-dropdown-item {
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tags-dropdown-item:hover { background: #f0f0f0; }
      .tags-dropdown-item.selected { background: #e3f2fd; color: #1976d2; font-weight: 500; }

      .url-input.invalid {
        border-color: #dc2626 !important;
        background-color: rgba(220, 38, 38, 0.05) !important;
      }
      .form-error.url-error {
        color: #dc2626;
        font-size: 12px;
        margin-top: 4px;
        display: block;
      }

      .tag-category-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-bottom: 10px;
        padding: 6px 0;
        border-bottom: 1px solid var(--color-border, #eee);
      }
      .tag-category-group:last-child {
        border-bottom: none;
      }
      .tag-category-label {
        font-size: 0.75em;
        font-weight: 600;
        color: var(--color-muted);
        min-width: 80px;
        margin-right: 4px;
        flex-shrink: 0;
      }
    </style>
  `;

  return formHtml;
}

export function renderBoardCard(board) {
  const imageUrl = board.image?.url
    ? `/api/images/${board.image.url.replace('images/', '')}`
    : null;
  const isUnpublished = board.published === false;

  return `
    <div class="board-card ${isUnpublished ? 'board-card--unpublished' : ''}" data-board-id="${escapeHtml(board.id)}">
      ${isUnpublished ? '<span class="board-card-unpublished-badge">Unpublished / 未发布</span>' : ''}
      ${imageUrl ? `<div class="board-card-image"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(getLocalizedString(board.name) || board.id)}"></div>` : ''}
      <div class="board-card-header">
        <div>
          <div class="board-card-title">${escapeHtml(getLocalizedString(board.name) || board.id)}</div>
          <div class="board-card-id">${escapeHtml(board.id)}</div>
        </div>
        ${board.platformId ? `<span class="board-card-platform">${escapeHtml(board.platformId)}</span>` : ''}
      </div>
      ${board.summary ? `<p class="board-card-summary">${escapeHtml(getLocalizedString(board.summary))}</p>` : ''}
      <div class="board-card-footer">
        <button class="btn btn-sm btn-outline edit-btn" data-board-id="${escapeHtml(board.id)}">
          ✏️ Edit
        </button>
        <button class="btn btn-sm btn-danger delete-btn" data-board-id="${escapeHtml(board.id)}">
          🗑️ Delete
        </button>
      </div>
    </div>
  `;
}

export async function saveBoardForm(formElement) {
  const boardId = document.getElementById('boardId')?.value;
  const nameEn = document.getElementById('boardName')?.value;
  const nameZh = document.getElementById('boardNameZh')?.value;
  const platformId = document.getElementById('platformId')?.value;
  const manufacturer = document.getElementById('manufacturer')?.value;
  const summaryEn = document.getElementById('boardSummary')?.value;
  const summaryZh = document.getElementById('boardSummaryZh')?.value;
  const schematicLink = document.getElementById('schematicLink')?.value;
  const guideDocsEn = document.getElementById('guideDocs')?.value;
  const guideDocsZh = document.getElementById('guideDocsZh')?.value;
  const purchaseLinkEn = document.getElementById('purchaseLink')?.value;
  const purchaseLinkZh = document.getElementById('purchaseLinkZh')?.value;
  const threeDModelLink = document.getElementById('threeDModelLink')?.value;

  // Validate required fields
  if (!boardId || !nameEn || !platformId) {
    showError('Validation Error', 'Please fill in all required fields');
    return false;
  }

  // Validate all URL fields
  const urlFields = {
    'Schematic Link': { url: schematicLink, id: 'schematicLink' },
    'Guide Docs (EN)': { url: guideDocsEn, id: 'guideDocs' },
    'Guide Docs (ZH)': { url: guideDocsZh, id: 'guideDocsZh' },
    'Purchase Link (EN)': { url: purchaseLinkEn, id: 'purchaseLink' },
    'Purchase Link (ZH)': { url: purchaseLinkZh, id: 'purchaseLinkZh' },
    '3D Model Link': { url: threeDModelLink, id: 'threeDModelLink' },
    'BSP Source Repo': { url: document.getElementById('sourceRepo')?.value?.trim(), id: 'sourceRepo' },
  };

  for (const [fieldName, { url }] of Object.entries(urlFields)) {
    if (url && !validateHttpsUrl(url)) {
      showError('Invalid URL', `${fieldName} must be a valid HTTPS URL`);
      return false;
    }
  }

  // Validate tags
  const tags = getSelectedTags();

  if (tags.length === 0) {
    showError('Validation Error', 'Please select at least one tag');
    return false;
  }

  // Collect kconfigId
  const kconfigId = document.getElementById('kconfigId')?.value?.trim();

  // Collect scaffold settings
  const scaffoldTemplate = document.getElementById('scaffoldTemplate')?.value?.trim();
  const scaffoldBaseConfigRaw = document.getElementById('scaffoldBaseConfig')?.value?.trim();
  let scaffoldBaseConfig = null;
  if (scaffoldBaseConfigRaw) {
    try {
      scaffoldBaseConfig = JSON.parse(scaffoldBaseConfigRaw);
    } catch {
      showError('Invalid JSON', 'Scaffold Base Config must be valid JSON');
      return false;
    }
  }

  const boardData = {
    id: boardId,
    name: { en: nameEn },
    platformId,
    manufacturer: manufacturer || { en: 'Unknown' },
    summary: { en: summaryEn },
    tags,
    published: document.getElementById('boardPublished')?.checked ?? true,
    autoCommit: true,
  };

  // Add kconfigId if provided
  if (kconfigId) {
    boardData.kconfigId = kconfigId;
  }

  // Add scaffold if any field is set, otherwise auto-derive from platformId + kconfigId
  if (scaffoldTemplate || scaffoldBaseConfig) {
    boardData.scaffold = {};
    if (scaffoldTemplate) {
      boardData.scaffold.template = scaffoldTemplate;
    }
    if (scaffoldBaseConfig) {
      boardData.scaffold.baseConfig = scaffoldBaseConfig;
    }
  } else if (kconfigId && platformId) {
    // Auto-derive default scaffold
    const platformKconfigId = platformId.toUpperCase();
    boardData.scaffold = {
      template: 'tools/app_template/base',
      baseConfig: {
        [`CONFIG_BOARD_CHOICE_${platformKconfigId}`]: 'y',
        [`CONFIG_BOARD_CHOICE_${kconfigId}`]: 'y',
      },
    };
  }

  if (nameZh) {
    boardData.name['zh-CN'] = nameZh;
  }

  if (summaryZh) {
    boardData.summary['zh-CN'] = summaryZh;
  }

  // Add optional links
  if (schematicLink) {
    boardData.schematicLink = schematicLink;
  }

  if (guideDocsEn || guideDocsZh) {
    boardData.guideDocs = { en: guideDocsEn };
    if (guideDocsZh) {
      boardData.guideDocs['zh-CN'] = guideDocsZh;
    }
  }

  if (purchaseLinkEn || purchaseLinkZh) {
    boardData.purchaseLink = { en: purchaseLinkEn };
    if (purchaseLinkZh) {
      boardData.purchaseLink['zh-CN'] = purchaseLinkZh;
    }
  }

  if (threeDModelLink) {
    boardData.threeDModelLink = threeDModelLink;
  }

  // Collect source (BSP repo)
  const sourceRepo = document.getElementById('sourceRepo')?.value?.trim();
  const sourceSubpath = document.getElementById('sourceSubpath')?.value?.trim();
  if (sourceRepo) {
    boardData.source = { repo: sourceRepo };
    if (sourceSubpath) boardData.source.subpath = sourceSubpath;
  }

  try {
    let result;
    const isNew = formElement.dataset.isEdit !== 'true';

    if (isNew) {
      result = await apiClient.createBoard(boardData);
    } else {
      result = await apiClient.updateBoard(boardId, boardData);
    }

    if (result.success) {
      showNotification(`Board "${boardId}" ${isNew ? 'created' : 'updated'} successfully`);
      return true;
    }
  } catch (error) {
    showError('Save Failed', error.message);
    return false;
  }
}

function isValidTagFormat(tag) {
  return /^[a-z0-9-]+$/.test(tag);
}

export function setupFormValidation() {
  // Real-time HTTPS URL validation
  document.querySelectorAll('.url-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      const urlType = e.target.dataset.urlType;
      const errorEl = document.getElementById(urlType + 'Error');

      if (url && !validateHttpsUrl(url)) {
        e.target.classList.add('invalid');
        if (errorEl) {
          errorEl.textContent = '❌ Must be a valid HTTPS URL (https://...)';
          errorEl.classList.add('url-error');
        }
      } else {
        e.target.classList.remove('invalid');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('url-error');
        }
      }
    });

    // Initial check
    const url = input.value.trim();
    if (url && !validateHttpsUrl(url)) {
      input.classList.add('invalid');
      const errorEl = document.getElementById(input.dataset.urlType + 'Error');
      if (errorEl) {
        errorEl.textContent = '❌ Must be a valid HTTPS URL (https://...)';
        errorEl.classList.add('url-error');
      }
    }
  });

  // Initialize chip-based tag selector
  initTagsChipSelector();
}

// --- Chip-based Tag Selector ---

let selectedTagIds = [];

function initTagsChipSelector() {
  const chipsContainer = document.getElementById('selectedTags');
  const searchInput = document.getElementById('tagsSearchInput');
  const dropdown = document.getElementById('tagsDropdown');
  const pool = document.getElementById('tagsAvailablePool');

  if (!chipsContainer || !searchInput || !pool) return;

  selectedTagIds = [];

  renderAvailablePool();
  renderChips();

  // Search input — filter dropdown
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      dropdown.style.display = 'none';
      return;
    }
    const isZh = i18n.getLanguage() === 'zh-CN';
    const matches = globalTagsList.filter(t =>
      !selectedTagIds.includes(t.id) &&
      (t.id.includes(query) || (isZh ? t.zh : t.en).toLowerCase().includes(query))
    );
    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }
    dropdown.innerHTML = matches.map(t =>
      `<div class="tags-dropdown-item" data-tag-id="${escapeHtml(t.id)}">${escapeHtml(isZh ? t.zh : t.en)}</div>`
    ).join('');
    dropdown.style.display = 'block';
  });

  // Click dropdown item
  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.tags-dropdown-item');
    if (!item) return;
    addTag(item.dataset.tagId);
    searchInput.value = '';
    dropdown.style.display = 'none';
  });

  // Hide dropdown on blur (with delay for click)
  searchInput.addEventListener('blur', () => {
    setTimeout(() => { dropdown.style.display = 'none'; }, 200);
  });

  // Pool click
  pool.addEventListener('click', (e) => {
    const chip = e.target.closest('.tag-pool-item');
    if (!chip) return;
    addTag(chip.dataset.tagId);
  });

  // Chips container — remove on × click
  chipsContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.tag-chip-remove');
    if (!removeBtn) return;
    const chip = removeBtn.closest('.tag-chip');
    if (chip) removeTag(chip.dataset.tagId);
  });
}

function addTag(tagId) {
  if (selectedTagIds.includes(tagId)) return;
  selectedTagIds.push(tagId);
  renderChips();
  renderAvailablePool();
  syncHiddenInput();
}

function removeTag(tagId) {
  selectedTagIds = selectedTagIds.filter(id => id !== tagId);
  renderChips();
  renderAvailablePool();
  syncHiddenInput();
}

function renderChips() {
  const container = document.getElementById('selectedTags');
  if (!container) return;
  container.innerHTML = selectedTagIds.map(id => {
    const tag = globalTagsList.find(t => t.id === id);
    const label = tag ? (i18n.getLanguage() === 'zh-CN' ? tag.zh : tag.en) : id;
    return `<span class="tag-chip" data-tag-id="${escapeHtml(id)}">${escapeHtml(label)}<button type="button" class="tag-chip-remove">&times;</button></span>`;
  }).join('');
}

function renderAvailablePool() {
  const pool = document.getElementById('tagsAvailablePool');
  if (!pool) return;
  let html = '';
  for (const cat of globalTagCategories) {
    const available = cat.tags.filter(t => !selectedTagIds.includes(t.id));
    if (available.length === 0) continue;
    const catLabel = i18n.getLanguage() === 'zh-CN' ? cat.name['zh-CN'] : cat.name.en;
    html += `<div class="tag-category-group"><span class="tag-category-label">${escapeHtml(catLabel)}</span>`;
    html += available.map(t => {
      const label = i18n.getLanguage() === 'zh-CN' ? t['zh-CN'] : t.en;
      return `<span class="tag-pool-item" data-tag-id="${escapeHtml(t.id)}">${escapeHtml(label)}</span>`;
    }).join('');
    html += '</div>';
  }
  pool.innerHTML = html;
}

function syncHiddenInput() {
  const hidden = document.getElementById('tags');
  if (hidden) hidden.value = selectedTagIds.join(',');
}

export function getSelectedTags() {
  return [...selectedTagIds];
}

export function setSelectedTags(tags) {
  selectedTagIds = Array.isArray(tags) ? [...tags] : [];
  renderChips();
  renderAvailablePool();
  syncHiddenInput();
}

export async function deleteBoardPrompt(boardId) {
  // First confirmation
  if (!confirm(`⚠️ WARNING: Delete board "${boardId}"?\n\nThis action CANNOT be undone!`)) {
    return false;
  }

  // Second confirmation with explicit requirement
  const confirmText = prompt(
    `🔴 FINAL CONFIRMATION\n\nType the board ID to confirm deletion:\n\n"${boardId}"\n\n(This cannot be undone!)`,
    ''
  );

  if (confirmText !== boardId) {
    if (confirmText !== null) {
      showError('Confirmation Failed', `You entered "${confirmText}". Please enter exactly "${boardId}" to confirm.`);
    }
    return false;
  }

  try {
    const result = await apiClient.deleteBoard(boardId, true);
    if (result.success) {
      showNotification(`✅ Board "${boardId}" has been permanently deleted`);
      return true;
    }
  } catch (error) {
    showError('Delete Failed', error.message);
    return false;
  }
}
