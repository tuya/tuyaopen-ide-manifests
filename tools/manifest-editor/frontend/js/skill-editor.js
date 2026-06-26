// Skill Editor Module — card rendering, edit form, save logic.
// Skills are payload-backed (SKILL.md lives under skills/<surface>/<id>/), so the
// editor only manages the index.json metadata of EXISTING skills. id / source /
// installPayload are payload-bound and shown read-only.

import { apiClient } from './api-client.js';
import { showNotification, showError, escapeHtml } from './utils.js';
import i18n from './i18n.js';

const SDKS = ['tuyaopen', 'tuyaos'];

const pickLoc = (loc) => {
  const lang = i18n.getLanguage();
  return (typeof loc === 'object' && loc) ? (loc[lang] || loc.en || loc['zh-CN'] || '') : (loc || '');
};

// Describe a skill's source provenance for read-only display.
function sourceLabel(source) {
  if (!source || typeof source !== 'object') return '—';
  if (source.devSkills) return `dev-skills: ${source.subpath || ''}`;
  if (source.localPath) return `local: ${source.localPath}`;
  return '—';
}

// ========== Card Rendering ==========

export function renderSkillCard(skill) {
  const name = pickLoc(skill.name) || skill.id;
  const summary = pickLoc(skill.summary);
  const surface = skill.surface || '—';
  const tags = Array.isArray(skill.tags) ? skill.tags : [];
  const sdks = Array.isArray(skill.sdks) ? skill.sdks : [];
  // defaultEnabled is install-by-default state, NOT publish state — show it as a
  // neutral chip, never grey the card out (that reads as "unpublished").
  const off = skill.defaultEnabled === false;

  return `
    <div class="demo-card" data-skill-id="${escapeHtml(skill.id)}">
      <div class="demo-card-header">
        <div>
          <div class="demo-card-title">${escapeHtml(name)}</div>
          <div class="demo-card-id">${escapeHtml(skill.id)}</div>
        </div>
        <div class="skill-card-badges">
          <span class="skill-surface-badge">${escapeHtml(surface)}</span>
          ${off ? `<span class="skill-default-off">${escapeHtml(i18n.t('skillDefaultOff') || 'Not default')}</span>` : ''}
        </div>
      </div>
      ${summary ? `<p class="demo-card-summary">${escapeHtml(summary)}</p>` : ''}
      ${tags.length ? `<div class="skill-card-tags">${tags.map((t) => `<span class="skill-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      ${sdks.length ? `<div class="skill-card-sdks">${sdks.map((s) => `<span class="skill-sdk">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
      <div class="demo-card-footer">
        <button class="btn btn-sm btn-outline skill-edit-btn" data-skill-id="${escapeHtml(skill.id)}">✏️ ${escapeHtml(i18n.t('skillEdit') || 'Edit')}</button>
      </div>
    </div>
  `;
}

// ========== Form Rendering ==========

export function renderSkillForm(skill) {
  const s = skill || {};
  const nameEn = typeof s.name === 'object' ? (s.name?.en || '') : '';
  const nameZh = typeof s.name === 'object' ? (s.name?.['zh-CN'] || '') : '';
  const summaryEn = typeof s.summary === 'object' ? (s.summary?.en || '') : '';
  const summaryZh = typeof s.summary === 'object' ? (s.summary?.['zh-CN'] || '') : '';
  const whenEn = typeof s.whenToUse === 'object' ? (s.whenToUse?.en || '') : '';
  const whenZh = typeof s.whenToUse === 'object' ? (s.whenToUse?.['zh-CN'] || '') : '';
  const surface = s.surface || 'embedded';
  const order = s.order != null ? s.order : '';
  const tags = (s.tags || []).join(', ');
  const commands = (s.commands || []).join(', ');
  const related = (s.related || []).join(', ');
  const enabled = s.defaultEnabled !== false;
  const sdks = Array.isArray(s.sdks) ? s.sdks : [];

  const surfaceOpt = (v, label) =>
    `<option value="${v}" ${surface === v ? 'selected' : ''}>${label}</option>`;
  const sdkCheck = (v) =>
    `<label class="skill-sdk-check"><input type="checkbox" class="skill-sdk-cb" value="${v}" ${sdks.includes(v) ? 'checked' : ''}> ${v}</label>`;

  return `
    <form id="skillForm" class="demo-form" style="max-width: none; width: 100%; padding: 24px;">
      <!-- ID (read-only) -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="skillId" data-i18n="skillId">ID</label>
          <input type="text" id="skillId" class="form-input" value="${escapeHtml(s.id || '')}" readonly aria-readonly="true" style="background: var(--color-hover); cursor: not-allowed;">
          <small style="color: var(--color-muted);" data-i18n="skillIdLockedHint">ID is bound to the skill payload and cannot be changed here.</small>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="skillSurface" data-i18n="skillSurface">Surface</label>
          <select id="skillSurface" class="form-select">
            ${surfaceOpt('embedded', 'embedded')}
            ${surfaceOpt('cloud', 'cloud')}
            ${surfaceOpt('miniapp', 'miniapp')}
          </select>
        </div>
      </div>

      <!-- Display order -->
      <div class="form-group">
        <label class="form-label" for="skillOrder" data-i18n="skillOrder">Display order</label>
        <input type="number" id="skillOrder" class="form-input" value="${escapeHtml(String(order))}" step="1">
      </div>

      <!-- Name -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label required" for="skillNameEn" data-i18n="skillNameEn">Name (EN)</label>
          <input type="text" id="skillNameEn" class="form-input" value="${escapeHtml(nameEn)}" required>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="skillNameZh" data-i18n="skillNameZh">Name (zh-CN)</label>
          <input type="text" id="skillNameZh" class="form-input" value="${escapeHtml(nameZh)}">
        </div>
      </div>

      <!-- Default enabled — own row, directly above the SDK selector -->
      <div class="form-group" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--color-hover); border-radius: 6px;">
        <input type="checkbox" id="skillEnabled" ${enabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        <label for="skillEnabled" style="margin: 0; cursor: pointer; font-weight: 500;" data-i18n="skillDefaultEnabled">Enabled by default</label>
        <small style="color: var(--color-muted); margin-left: auto;" data-i18n="skillDefaultEnabledHint">Installed into a project by default (the IDE still asks before installing).</small>
      </div>

      <!-- SDK applicability (kept directly under the name) -->
      <div class="form-group">
        <label class="form-label" data-i18n="skillSdks">Applies to SDK(s)</label>
        <div class="skill-sdks-checks">${SDKS.map(sdkCheck).join('')}</div>
        <small style="color: var(--color-muted);" data-i18n="skillSdksHint">Leave both unchecked = TuyaOpen only (default).</small>
      </div>

      <!-- Summary -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="skillSummaryEn" data-i18n="skillSummaryEn">Summary (EN)</label>
          <textarea id="skillSummaryEn" class="form-textarea" rows="2">${escapeHtml(summaryEn)}</textarea>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="skillSummaryZh" data-i18n="skillSummaryZh">Summary (zh-CN)</label>
          <textarea id="skillSummaryZh" class="form-textarea" rows="2">${escapeHtml(summaryZh)}</textarea>
        </div>
      </div>

      <!-- When to use -->
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="skillWhenEn" data-i18n="skillWhenEn">When to use (EN)</label>
          <textarea id="skillWhenEn" class="form-textarea" rows="2">${escapeHtml(whenEn)}</textarea>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="skillWhenZh" data-i18n="skillWhenZh">When to use (zh-CN)</label>
          <textarea id="skillWhenZh" class="form-textarea" rows="2">${escapeHtml(whenZh)}</textarea>
        </div>
      </div>

      <!-- Tags / commands / related (comma-separated) -->
      <div class="form-group">
        <label class="form-label" for="skillTags" data-i18n="skillTags">Tags</label>
        <input type="text" id="skillTags" class="form-input" value="${escapeHtml(tags)}" placeholder="build, tos.py">
        <small style="color: var(--color-muted);" data-i18n="skillCommaHint">Comma-separated.</small>
      </div>
      <div class="form-group">
        <label class="form-label" for="skillCommands" data-i18n="skillCommands">Commands</label>
        <input type="text" id="skillCommands" class="form-input" value="${escapeHtml(commands)}" placeholder="tuyaopen.skill.build">
        <small style="color: var(--color-muted);" data-i18n="skillCommaHint">Comma-separated.</small>
      </div>
      <div class="form-group">
        <label class="form-label" for="skillRelated" data-i18n="skillRelated">Related skills</label>
        <input type="text" id="skillRelated" class="form-input" value="${escapeHtml(related)}" placeholder="tuyaopen-dev-loop">
        <small style="color: var(--color-muted);" data-i18n="skillCommaHint">Comma-separated.</small>
      </div>

      <!-- Payload-bound, read-only -->
      <div class="form-group" style="padding: 8px 12px; background: var(--color-hover); border-radius: 6px;">
        <label class="form-label" style="margin:0 0 4px;" data-i18n="skillPayloadInfo">Payload (read-only)</label>
        <div style="font-size: 12px; color: var(--color-muted); line-height: 1.6;">
          <div><strong data-i18n="skillSource">Source</strong>: ${escapeHtml(sourceLabel(s.source))}</div>
          <div><strong data-i18n="skillInstallPayload">Install payload</strong>: ${escapeHtml(s.installPayload || '—')}</div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" id="skillCancelBtn" data-i18n="cancelBtn">Cancel</button>
        <button type="submit" class="btn btn-primary" data-i18n="skillSave">Save Changes</button>
      </div>
    </form>
  `;
}

// ========== Save Logic ==========

const splitCsv = (v) => (v ? v.split(',').map((x) => x.trim()).filter(Boolean) : []);

export async function saveSkillForm(skillId) {
  const orderRaw = document.getElementById('skillOrder').value.trim();
  const sdks = [...document.querySelectorAll('.skill-sdk-cb:checked')].map((cb) => cb.value);

  const data = {
    surface: document.getElementById('skillSurface').value,
    defaultEnabled: document.getElementById('skillEnabled').checked,
    name: {
      en: document.getElementById('skillNameEn').value.trim(),
      'zh-CN': document.getElementById('skillNameZh').value.trim(),
    },
    summary: {
      en: document.getElementById('skillSummaryEn').value.trim(),
      'zh-CN': document.getElementById('skillSummaryZh').value.trim(),
    },
    whenToUse: {
      en: document.getElementById('skillWhenEn').value.trim(),
      'zh-CN': document.getElementById('skillWhenZh').value.trim(),
    },
    tags: splitCsv(document.getElementById('skillTags').value),
    commands: splitCsv(document.getElementById('skillCommands').value),
    related: splitCsv(document.getElementById('skillRelated').value),
    sdks,
  };
  if (orderRaw !== '' && Number.isFinite(Number(orderRaw))) data.order = Number(orderRaw);

  if (!data.name.en) {
    showError('Invalid', i18n.t('skillNameRequired') || 'Name (EN) is required.');
    return false;
  }

  try {
    await apiClient.updateSkill(skillId, data);
    showNotification((i18n.t('skillUpdated') || 'Skill "{id}" updated').replace('{id}', skillId));
    return true;
  } catch (error) {
    showError('Save Failed', error.message);
    return false;
  }
}
