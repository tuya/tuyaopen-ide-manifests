// Demo Editor Module — card rendering, form, save/delete logic

import { apiClient } from './api-client.js';
import { showNotification, showError, escapeHtml } from './utils.js';
import i18n from './i18n.js';

// ========== Card Rendering ==========

// Unified fallback shown in the image slot when a demo has no image of its own.
const demoImagePlaceholder = () => `
  <svg class="demo-card-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <path d="M21 15l-5-5L5 21"></path>
  </svg>
  <span class="demo-card-placeholder-text">${escapeHtml(i18n.t('demoNoImage') || 'No image')}</span>`;

export function renderDemoCard(demo) {
  const lang = i18n.getLanguage();
  const pick = (loc) => (typeof loc === 'object' && loc) ? (loc[lang] || loc.en || loc['zh-CN'] || '') : (loc || '');
  const name = pick(demo.name) || demo.id;
  const summary = pick(demo.summary);
  const isUnpublished = demo.publish === false;

  const imageUrl = demo.image?.url || '';
  const imageInner = imageUrl
    ? `<img src="/api/demo-images/${imageUrl.replace('images/', '')}" alt="${escapeHtml(name)}" loading="lazy">`
    : demoImagePlaceholder();
  const imageHtml = `<div class="demo-card-image${imageUrl ? '' : ' demo-card-image--empty'}">${imageInner}</div>`;

  return `
    <div class="demo-card${isUnpublished ? ' demo-card--unpublished' : ''}" data-demo-id="${escapeHtml(demo.id)}">
      ${isUnpublished ? '<span class="demo-card-unpublished-badge">Unpublished / 未发布</span>' : ''}
      ${imageHtml}
      <div class="demo-card-header">
        <div>
          <div class="demo-card-title">${escapeHtml(name)}</div>
          <div class="demo-card-id">${escapeHtml(demo.id)}</div>
        </div>
      </div>
      ${summary ? `<p class="demo-card-summary">${escapeHtml(summary)}</p>` : ''}
      <div class="demo-card-footer">
        <button class="btn btn-sm btn-outline demo-edit-btn" data-demo-id="${escapeHtml(demo.id)}">✏️ ${escapeHtml(i18n.t('demoEdit') || 'Edit')}</button>
        <button class="btn btn-sm btn-danger demo-delete-btn" data-demo-id="${escapeHtml(demo.id)}">🗑️ ${escapeHtml(i18n.t('demoDelete') || 'Delete')}</button>
      </div>
    </div>
  `;
}

// ========== Form Rendering ==========

export function renderDemoForm(demo = null) {
  const isEdit = !!demo;
  const d = demo || {};
  const nameEn = typeof d.name === 'object' ? (d.name?.en || '') : '';
  const nameZh = typeof d.name === 'object' ? (d.name?.['zh-CN'] || '') : '';
  const summaryEn = typeof d.summary === 'object' ? (d.summary?.en || '') : '';
  const summaryZh = typeof d.summary === 'object' ? (d.summary?.['zh-CN'] || '') : '';
  // Classification: single-feature example vs complete-product app.
  const typeVal = d.type === 'app' ? 'app' : 'example';
  const tags = (d.tags || []).filter(t => t !== 'app' && t !== 'example').join(', ');
  const boards = (d.boards || []).join(', ');
  // Compatibility scope: 'universal' (any board) | 'platform' (any board of the
  // listed platform variants) | 'board-specific' (the listed boards + configs).
  const scope = d.compatibilityType === 'platform' || d.compatibilityType === 'board-specific'
    ? d.compatibilityType : 'universal';
  const isPublished = d.publish !== false;
  const source = typeof d.source === 'string' ? d.source : '';
  // Cloud demo: needs a PID. `true` = auto-detect; object = method (`via`) + overrides.
  const cloudEnabled = !!d.cloud;
  const cloudPid = (d.cloud && typeof d.cloud === 'object' && d.cloud.pid) ? d.cloud.pid : {};
  const cloudVia = cloudPid.via === 'kconfig' || cloudPid.via === 'macro' ? cloudPid.via : 'auto';
  const cloudKKey = cloudPid.kconfigKey || '';
  const cloudMacro = cloudPid.macro || '';
  const cloudFile = cloudPid.file || '';
  const cloudOemUrl = (d.cloud && typeof d.cloud === 'object' && d.cloud.oemUrl) ? d.cloud.oemUrl : '';
  const readmeEn = d.documentation?.readme?.en || '';
  const readmeZh = d.documentation?.readme?.['zh-CN'] || '';
  const currentImageUrl = d.image?.url || '';

  return `
    <form id="demoForm" class="demo-form" style="max-width: none; width: 100%; padding: 24px;">
      <div class="demo-form-tabs">
        <button type="button" class="demo-form-tab active" data-pane="basic" data-i18n="demoTabBasic">Basic Info</button>
        <button type="button" class="demo-form-tab" data-pane="config" data-i18n="demoTabConfig">Board Config Mapping</button>
        <button type="button" class="demo-form-tab" data-pane="deps" data-i18n="demoTabDeps">Dependencies</button>
      </div>

      <!-- ============ Pane: Basic Info ============ -->
      <div class="demo-pane" data-pane="basic">
      <!-- ID + Type — both fixed at creation, locked on edit -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label required" for="demoId" data-i18n="demoId">ID</label>
          <input type="text" id="demoId" class="form-input" value="${escapeHtml(d.id || '')}"
            ${isEdit ? 'readonly aria-readonly="true" style="background: var(--color-hover); cursor: not-allowed;"' : ''} placeholder="my-demo-name" pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" required>
          ${isEdit
            ? '<small style="color: var(--color-muted);" data-i18n="demoIdLockedHint">ID is fixed at creation and cannot be changed.</small>'
            : '<small style="color: var(--color-muted);" data-i18n="demoIdHint">Kebab-case: lowercase letters, numbers, hyphens only. Fixed at creation.</small>'}
        </div>
        <div class="form-col-half">
          <label class="form-label required" for="demoCategory" data-i18n="demoCategory">Type</label>
          <select id="demoCategory" class="form-select"
            ${isEdit ? 'disabled aria-disabled="true" style="background: var(--color-hover); cursor: not-allowed;"' : ''}>
            <option value="example" ${typeVal === 'example' ? 'selected' : ''} data-i18n="demoCategoryExample">Example — single-feature sample</option>
            <option value="app" ${typeVal === 'app' ? 'selected' : ''} data-i18n="demoCategoryApp">App — complete product sample</option>
          </select>
          ${isEdit ? '<small style="color: var(--color-muted);" data-i18n="demoCategoryLockedHint">Type is fixed at creation and cannot be changed.</small>' : ''}
        </div>
      </div>

      <!-- Published Toggle -->
      <div class="form-group" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--color-hover); border-radius: 6px;">
        <input type="checkbox" id="demoPublish" ${isPublished ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        <label for="demoPublish" style="margin: 0; cursor: pointer; font-weight: 500;" data-i18n="demoPublish">Publish</label>
        <small style="color: var(--color-muted); margin-left: auto;" data-i18n="demoPublishHint">Visible in IDE when checked</small>
      </div>

      <!-- EN/ZH Pair: Name -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label required" for="demoNameEn" data-i18n="demoNameEn">Name (EN)</label>
          <input type="text" id="demoNameEn" class="form-input" value="${escapeHtml(nameEn)}" required>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="demoNameZh" data-i18n="demoNameZh">Name (zh-CN)</label>
          <input type="text" id="demoNameZh" class="form-input" value="${escapeHtml(nameZh)}">
        </div>
      </div>

      <!-- EN/ZH Pair: Summary -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="demoSummaryEn" data-i18n="demoSummaryEn">Summary (EN)</label>
          <textarea id="demoSummaryEn" class="form-textarea" rows="3">${escapeHtml(summaryEn)}</textarea>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="demoSummaryZh" data-i18n="demoSummaryZh">Summary (zh-CN)</label>
          <textarea id="demoSummaryZh" class="form-textarea" rows="3">${escapeHtml(summaryZh)}</textarea>
        </div>
      </div>

      <!-- Tags — same chip-input + search + available pool as the board form -->
      <div class="form-group">
        <label class="form-label" data-i18n="demoTags">Tags</label>
        <input type="hidden" id="demoTags" value="${escapeHtml(tags)}">
        <div id="demoTagsContainer" class="tags-chip-input">
          <div id="demoSelectedTags" class="tags-chips"></div>
          <div class="tags-add-wrapper">
            <input type="text" id="demoTagsSearchInput" class="form-input tags-search" autocomplete="off" placeholder="Search tags…" data-i18n-placeholder="demoTagsSearch">
            <div id="demoTagsDropdown" class="tags-dropdown" style="display: none;"></div>
          </div>
        </div>
        <div id="demoTagsAvailablePool" class="tags-available-pool"></div>
      </div>

      <!-- Source — path in the TuyaOpen repo (e.g. apps/tuya.ai/your_chat_bot) -->
      <div class="form-group">
        <label class="form-label required" for="demoSource" data-i18n="demoSource">Source URL</label>
        <input type="url" id="demoSource" class="form-input" value="${escapeHtml(source)}" required placeholder="https://github.com/tuya/TuyaOpen/tree/master/apps/my_app">
        <small style="color: var(--color-muted);" data-i18n="demoSourceHint">Full URL to the example's source directory (repo + branch + path).</small>
      </div>

      <!-- EN/ZH Pair: Documentation -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="demoReadmeEn" data-i18n="demoReadmeEn">README (EN)</label>
          <input type="url" id="demoReadmeEn" class="form-input url-input" value="${escapeHtml(readmeEn)}" placeholder="https://github.com/...">
        </div>
        <div class="form-col-half">
          <label class="form-label" for="demoReadmeZh" data-i18n="demoReadmeZh">README (zh-CN)</label>
          <input type="url" id="demoReadmeZh" class="form-input url-input" value="${escapeHtml(readmeZh)}" placeholder="https://github.com/...">
        </div>
      </div>

      <!-- Image -->
      <div class="form-group">
        <label class="form-label">${i18n.t('demoImage')}</label>
        ${isEdit ? `
          <div class="image-upload-inline" id="demoImageUploadSection">
            <!-- Image Source Tabs -->
            <div style="display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
              <button type="button" class="image-source-tab active" data-source="file" style="background: none; border: none; padding: 8px; cursor: pointer; font-weight: 500; color: var(--color-primary);">
                ${i18n.t('demoImageUploadFile')}
              </button>
              <button type="button" class="image-source-tab" data-source="url" style="background: none; border: none; padding: 8px; cursor: pointer; font-weight: 500; color: var(--color-muted);">
                ${i18n.t('demoImageFromUrl')}
              </button>
            </div>

            <!-- File Upload -->
            <div id="demoImageSourceFile" class="image-source-content">
              <div class="image-upload-zone" data-demo-id="${escapeHtml(d.id)}">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p class="upload-text">${i18n.t('demoImageDrop')}</p>
                <p class="image-recommendation">${i18n.t('demoImageRecommend')}</p>
                <input type="file" id="demoImageInput" style="display: none;" accept="image/*">
              </div>
            </div>

            <!-- URL Input -->
            <div id="demoImageSourceUrl" class="image-source-content" style="display: none;">
              <input type="url" id="demoImageUrl" class="form-input url-input" placeholder="https://example.com/image.jpg" style="margin-bottom: 8px;">
              <small style="color: var(--color-muted); display: block; margin-bottom: 8px;">${i18n.t('demoImageUrlHint')}</small>
              <div style="display: flex; gap: 8px;">
                <button type="button" id="demoConfirmUrlBtn" class="btn btn-primary">${i18n.t('demoImageUseUrl')}</button>
              </div>
            </div>

            ${currentImageUrl ? `
              <div class="current-image-preview" id="demoCurrentImage" style="margin-top: 12px; padding: 12px; background-color: var(--color-hover); border-radius: 8px; text-align: center;">
                <img src="/api/demo-images/${currentImageUrl.replace('images/', '')}" alt="Current demo image" style="max-width: 200px; max-height: 200px; object-fit: contain; border-radius: 4px; border: 1px solid var(--color-border);">
                <small style="display: block; margin-top: 8px; color: var(--color-muted);">${i18n.t('demoImageCurrentLabel')}: ${escapeHtml(currentImageUrl)}</small>
                <button type="button" class="btn btn-sm btn-danger" id="demoDeleteImageBtn" style="margin-top: 8px;">${i18n.t('demoImageDelete')}</button>
              </div>
            ` : `<small style="color: var(--color-muted);">${i18n.t('demoImageNoneSet')}</small>`}
          </div>
        ` : `<small style="color: var(--color-muted);">${i18n.t('demoImageSaveFirst')}</small>`}
      </div>
      </div>

      <!-- ============ Pane: Board Config Mapping ============ -->
      <div class="demo-pane" data-pane="config" style="display:none">
        <!-- Compatibility scope: universal / platform / board-specific -->
        <div class="form-group" style="padding: 8px 12px; background: var(--color-hover); border-radius: 6px;">
          <label class="form-label" style="margin:0 0 6px;" data-i18n="demoScopeLabel">Compatibility scope</label>
          <div style="display:flex; gap:18px; flex-wrap:wrap;">
            <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-weight:500;"><input type="radio" name="demoScope" value="universal" ${scope === 'universal' ? 'checked' : ''}> <span data-i18n="demoScopeUniversal">Universal — any board</span></label>
            <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-weight:500;"><input type="radio" name="demoScope" value="platform" ${scope === 'platform' ? 'checked' : ''}> <span data-i18n="demoScopePlatform">Platform — any board of…</span></label>
            <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-weight:500;"><input type="radio" name="demoScope" value="board-specific" ${scope === 'board-specific' ? 'checked' : ''}> <span data-i18n="demoScopeBoard">Board-specific</span></label>
          </div>
        </div>

        <div id="demoPlatformsSection" style="${scope === 'platform' ? '' : 'display:none'}">
          <div class="form-group">
            <label class="form-label" data-i18n="demoPlatformsLabel">Supported platforms</label>
            <small style="color: var(--color-muted); display:block; margin:6px 0 8px;" data-i18n="demoPlatformsHint">Any board of these platforms can run this demo.</small>
            <div id="demoPlatforms" class="demo-platforms-checks"></div>
          </div>
        </div>

        <div id="demoConfigSection" style="${scope === 'board-specific' ? '' : 'display:none'}">
          <div class="form-group">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <label class="form-label" style="margin:0;" data-i18n="demoTargets">Supported boards &amp; configs</label>
              <button type="button" class="btn btn-primary btn-sm" id="addTargetBtn" data-i18n="demoTargetAddBtn">+ Add board</button>
            </div>
            <small style="color: var(--color-muted); display:block; margin:6px 0 8px;" data-i18n="demoTargetsHint">Each row: a board and its config file(s) + the peripherals each uses.</small>
            <div id="demoTargets"></div>
          </div>
        </div>
      </div>

      <!-- ============ Pane: Dependencies ============ -->
      <div class="demo-pane" data-pane="deps" style="display:none">
        <!-- Hardware drivers — what this demo needs, by dependency strength.
             Required = won't run without it; Optional = enhances but not needed.
             Vocabulary mirrors the board "peripherals" tags so they can be matched. -->
        <div class="form-group">
          <label class="form-label" data-i18n="demoDrivers">Hardware drivers</label>
          <small style="color: var(--color-muted); display:block; margin:2px 0 8px;" data-i18n="demoDriversHint">Hardware this demo uses. Required = won't run without it; Optional = enhances but works without.</small>
          <div id="demoDriversContainer" class="demo-drivers"></div>
        </div>

        <!-- Cloud dependency — this demo connects to Tuya Cloud and needs a PID.
             When enabled, the IDE lets the developer bind their own PID at create
             time and rewrites it in the scaffolded source (Kconfig key if present,
             else the C macro). Override fields are only for demos that deviate
             from the convention (CONFIG_TUYA_PRODUCT_ID / TUYA_PRODUCT_ID). -->
        <div class="form-group">
          <label class="form-label" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="demoCloud" ${cloudEnabled ? 'checked' : ''} style="width:auto;">
            <span data-i18n="demoCloud">Inject PID</span>
          </label>
          <small style="color: var(--color-muted); display:block; margin:2px 0 8px;" data-i18n="demoCloudHint">When on, the create-from-demo flow asks the developer for their own Product ID and injects it into the project instead of the demo's PID.</small>
          <div id="demoCloudOverrides" style="${cloudEnabled ? '' : 'display:none;'} padding-left:24px;">
            <!-- Step 1: pick the injection method. -->
            <div class="form-group">
              <label class="form-label" for="demoCloudVia" data-i18n="demoCloudVia">Injection method</label>
              <select id="demoCloudVia" class="form-input">
                <option value="auto" ${cloudVia === 'auto' ? 'selected' : ''} data-i18n="demoCloudViaAuto">Auto-detect (recommended)</option>
                <option value="kconfig" ${cloudVia === 'kconfig' ? 'selected' : ''} data-i18n="demoCloudViaKconfig">Kconfig (app_default.config)</option>
                <option value="macro" ${cloudVia === 'macro' ? 'selected' : ''} data-i18n="demoCloudViaMacro">Macro (header / source)</option>
              </select>
            </div>
            <!-- Step 2: fill the data for the chosen method (auto needs none). -->
            <div class="form-group demo-cloud-field" data-via="kconfig" style="${cloudVia === 'kconfig' ? '' : 'display:none;'}">
              <label class="form-label" for="demoCloudKKey" data-i18n="demoCloudKKey">Kconfig key</label>
              <input type="text" id="demoCloudKKey" class="form-input" value="${escapeHtml(cloudKKey)}" placeholder="CONFIG_TUYA_PRODUCT_ID">
              <small style="color: var(--color-muted);" data-i18n="demoCloudOptionalHint">Optional — leave empty to use the convention.</small>
            </div>
            <div class="form-group demo-cloud-field" data-via="macro" style="${cloudVia === 'macro' ? '' : 'display:none;'}">
              <label class="form-label" for="demoCloudMacro" data-i18n="demoCloudMacro">Macro name</label>
              <input type="text" id="demoCloudMacro" class="form-input" value="${escapeHtml(cloudMacro)}" placeholder="TUYA_PRODUCT_ID">
              <label class="form-label" for="demoCloudFile" style="margin-top:8px;" data-i18n="demoCloudFile">Macro file</label>
              <input type="text" id="demoCloudFile" class="form-input" value="${escapeHtml(cloudFile)}" placeholder="src/tuya_config.h">
              <small style="color: var(--color-muted);" data-i18n="demoCloudOptionalHint">Optional — leave empty to use the convention.</small>
            </div>
            <!-- OEM link — independent of method; opened by the IDE's
                 "Create product on platform" button. -->
            <div class="form-group">
              <label class="form-label" for="demoCloudOemUrl" data-i18n="demoCloudOem">OEM / create-product link</label>
              <input type="url" id="demoCloudOemUrl" class="form-input" value="${escapeHtml(cloudOemUrl)}" placeholder="https://platform.tuya.com/pmg">
              <small style="color: var(--color-muted);" data-i18n="demoCloudOemHint">Optional — where the developer creates their product. Leave empty for the IDE default.</small>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" id="demoCancelBtn" data-i18n="cancelBtn">Cancel</button>
        <button type="submit" class="btn btn-primary" data-i18n="demoSave">${isEdit ? 'Save Changes' : 'Create Demo'}</button>
      </div>
    </form>
  `;
}

// ========== Save Logic ==========

export async function saveDemoForm(form, demoId = null) {
  const id = demoId || document.getElementById('demoId').value.trim();
  const isEdit = !!demoId;

  // On create, the ID is fixed and must be unique — pre-check before POST for
  // immediate feedback (the backend also rejects duplicates with a 409).
  if (!isEdit) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      showError('Invalid ID', i18n.t('demoIdHint'));
      return false;
    }
    try {
      const existing = await apiClient.getDemos();
      if ((existing?.demos || []).some(d => d.id === id)) {
        showError('Duplicate ID', (i18n.t('demoIdDuplicate') || 'ID "{id}" already exists.').replace('{id}', id));
        return false;
      }
    } catch {
      // If the check fails (e.g. network), fall through — backend still enforces uniqueness.
    }
  }

  const compatType = document.querySelector('input[name="demoScope"]:checked')?.value || 'universal';
  const type = document.getElementById('demoCategory')?.value === 'app' ? 'app' : 'example';
  const tagsRaw = document.getElementById('demoTags').value.trim();

  // Tags hold capability labels only — type is a dedicated field now.
  const tags = (tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [])
    .filter(t => t !== 'app' && t !== 'example');

  // Collect config targets keyed by board (board-specific) or platform.
  //   board-specific → { board, options:[{name?,file,peripherals?}] }
  //   platform       → { platform, options:[{file}] } for each checked platform
  //                    that carries a config file (the demo's defconfig base).
  const configs = [];
  if (compatType === 'board-specific') {
    document.querySelectorAll('#demoTargets .demo-target').forEach(row => {
      const board = row.querySelector('.target-board')?.value || '';
      if (!board) return;
      const options = [];
      row.querySelectorAll('.target-option').forEach(o => {
        const file = o.querySelector('.opt-file')?.value?.trim();
        if (!file) return;
        const en = o.querySelector('.opt-name-en')?.value?.trim();
        const zh = o.querySelector('.opt-name-zh')?.value?.trim();
        const opt = { file };
        if (en || zh) opt.name = { en: en || '', 'zh-CN': zh || '' };
        // Peripherals this option uses (board peripheral/group ids, checkboxes).
        const peripherals = [...o.querySelectorAll('.opt-peri-cb:checked')].map(cb => cb.value);
        if (peripherals.length) opt.peripherals = peripherals;
        options.push(opt);
      });
      const target = { board };
      if (options.length) target.options = options;
      configs.push(target);
    });
  } else if (compatType === 'platform') {
    document.querySelectorAll('#demoPlatforms .demo-plat-row').forEach(row => {
      const cb = row.querySelector('.demo-plat-cb');
      if (!cb || !cb.checked) return;
      const file = row.querySelector('.demo-plat-config')?.value?.trim();
      if (!file) return;  // a platform without a config file just contributes to platforms[]
      configs.push({ platform: cb.value, options: [{ file }] });
    });
  }

  // boards[] derived from target boards (board-specific only).
  const boards = compatType === 'board-specific' ? [...new Set(configs.map(t => t.board))] : [];
  // platforms[] (platform variant ids) — only for platform scope.
  const platforms = compatType === 'platform'
    ? [...document.querySelectorAll('#demoPlatforms .demo-plat-cb:checked')].map(cb => cb.value)
    : [];

  // Hardware drivers: [{ driver, level }] read from the driver rows in the DOM.
  const drivers = [];
  document.querySelectorAll('#demoDriversContainer .demo-driver-row').forEach(row => {
    const driver = row.dataset.driver;
    if (!driver) return;
    drivers.push({ driver, level: row.dataset.level === 'required' ? 'required' : 'optional' });
  });

  // Cloud dependency: when enabled, send `true` for auto-detect, or an object
  // carrying the chosen method (`via`) + only that method's overrides. Disabled →
  // false (backend drops the field).
  let cloud = false;
  if (document.getElementById('demoCloud')?.checked) {
    const via = document.getElementById('demoCloudVia')?.value || 'auto';
    const oemUrl = document.getElementById('demoCloudOemUrl')?.value.trim();
    const obj = {};
    if (via === 'kconfig') {
      const pid = { via };
      const kk = document.getElementById('demoCloudKKey')?.value.trim();
      if (kk) pid.kconfigKey = kk;
      obj.pid = pid;
    } else if (via === 'macro') {
      const pid = { via };
      const mc = document.getElementById('demoCloudMacro')?.value.trim();
      const fl = document.getElementById('demoCloudFile')?.value.trim();
      if (mc) pid.macro = mc;
      if (fl) pid.file = fl;
      obj.pid = pid;
    }
    if (oemUrl) obj.oemUrl = oemUrl;
    // Bare `true` when nothing beyond enabling (auto method, no OEM link).
    cloud = Object.keys(obj).length ? obj : true;
  }

  const data = {
    id,
    type,
    publish: document.getElementById('demoPublish').checked,
    name: {
      en: document.getElementById('demoNameEn').value.trim(),
      'zh-CN': document.getElementById('demoNameZh').value.trim(),
    },
    summary: {
      en: document.getElementById('demoSummaryEn').value.trim(),
      'zh-CN': document.getElementById('demoSummaryZh').value.trim(),
    },
    tags,
    boards,
    platforms: platforms.length > 0 ? platforms : undefined,
    compatibilityType: compatType,
    source: document.getElementById('demoSource').value.trim(),
    cloud,
    configs: configs.length > 0 ? configs : undefined,
    drivers: drivers.length > 0 ? drivers : [],
    documentation: {
      readme: {
        en: document.getElementById('demoReadmeEn').value.trim() || null,
        'zh-CN': document.getElementById('demoReadmeZh').value.trim() || null,
      },
    },
  };

  try {
    if (isEdit) {
      await apiClient.updateDemo(id, data);
      showNotification(i18n.t('demoUpdated') || `Demo "${id}" updated`);
    } else {
      await apiClient.createDemo(data);
      showNotification(i18n.t('demoCreated') || `Demo "${id}" created`);
    }
    return true;
  } catch (error) {
    showError('Save Failed', error.message);
    return false;
  }
}

// ========== Delete Logic ==========

export async function deleteDemoAction(demoId) {
  const msg = (i18n.t('demoDeleteConfirm') || 'Delete demo "{id}"?').replace('{id}', demoId);
  if (!confirm(msg)) return false;

  try {
    await apiClient.deleteDemo(demoId);
    showNotification(i18n.t('demoDeleted') || `Demo "${demoId}" deleted`);
    return true;
  } catch (error) {
    showError('Delete Failed', error.message);
    return false;
  }
}
