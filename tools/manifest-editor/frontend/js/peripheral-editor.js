import { apiClient } from './api-client.js';
import i18n, { t } from './i18n.js';

let currentBoardId = null;
let peripheralData = {};
let editingKey = null; // "type:index"
let dirty = false;

function esc(str) {
  if (!str) return '';
  const el = document.createElement('span');
  el.textContent = String(str);
  return el.innerHTML;
}

export function isDirty() { return dirty; }

export async function renderPeripheralEditor(containerId, boardId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  currentBoardId = boardId;
  editingKey = null;
  dirty = false;

  try {
    const resp = await apiClient.getPeripherals(boardId);
    peripheralData = resp.peripheralPatterns || {};
  } catch {
    peripheralData = {};
  }

  container.innerHTML = '<div class="peri-editor" id="periEditorRoot"></div>';
  renderList();
}

function flatItems() {
  const items = [];
  for (const [type, arr] of Object.entries(peripheralData)) {
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i < arr.length; i++) {
      items.push({ type, index: i, item: arr[i] });
    }
  }
  return items;
}

function renderList() {
  const root = document.getElementById('periEditorRoot');
  if (!root) return;

  const items = flatItems();
  let html = `<div class="peri-list-header">
    <span class="peri-list-count">${items.length} peripheral${items.length !== 1 ? 's' : ''}</span>
    <button class="btn btn-primary btn-sm" id="periAddBtn">+ ${esc(t('periAddPeripheral'))}</button>
  </div>`;

  if (items.length === 0 && editingKey !== 'new') {
    html += `<div class="peri-empty">${esc(t('periEmpty'))}</div>`;
  }

  // Organize items: ungrouped first (onboard before accessory), then grouped
  const ungrouped = items.filter(i => !i.item.group);
  ungrouped.sort((a, b) => {
    const aOnboard = a.item.mounting !== 'accessory' ? 0 : 1;
    const bOnboard = b.item.mounting !== 'accessory' ? 0 : 1;
    return aOnboard - bOnboard;
  });
  const grouped = {};
  for (const entry of items) {
    if (!entry.item.group) continue;
    const g = entry.item.group;
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(entry);
  }

  // Render ungrouped items
  for (const { type, index, item } of ungrouped) {
    const key = `${type}:${index}`;
    if (editingKey === key) {
      html += renderForm(type, item, index);
    } else {
      html += renderCard(type, item, index);
    }
  }

  // Render grouped items
  for (const [groupName, entries] of Object.entries(grouped)) {
    const groupDisplayName = (i18n.getLanguage() === 'zh-CN'
      ? entries[0]?.item?.name?.['zh-CN'] || entries[0]?.item?.name?.en
      : entries[0]?.item?.name?.en || entries[0]?.item?.name?.['zh-CN']) || groupName;
    html += `<div class="peri-group">
      <div class="peri-group-header">
        <span class="peri-group-icon">⛓</span>
        <span class="peri-group-name">${esc(groupDisplayName)}</span>
        <span class="peri-group-count">${entries.length}</span>
      </div>
      <div class="peri-group-items">`;
    for (const { type, index, item } of entries) {
      const key = `${type}:${index}`;
      if (editingKey === key) {
        html += renderForm(type, item, index);
      } else {
        html += renderCard(type, item, index);
      }
    }
    html += `</div></div>`;
  }

  if (editingKey === 'new') {
    html += renderForm('', null, -1);
  }

  root.innerHTML = html;
  bindEvents(root);
}

function renderCard(type, item, index) {
  const isZh = i18n.getLanguage() === 'zh-CN';
  const name = (isZh ? item.name?.['zh-CN'] || item.name?.en : item.name?.en || item.name?.['zh-CN']) || item.model || 'Unnamed';
  const iface = item.interface || '';
  const model = item.model || '';
  const mountingLabel = i18n.getLanguage() === 'zh-CN'
    ? (item.mounting === 'accessory' ? '配件' : '板载')
    : (item.mounting === 'accessory' ? 'accessory' : 'onboard');
  const mountingTag = `<span class="peri-card-mounting peri-card-mounting--${item.mounting === 'accessory' ? 'accessory' : 'onboard'}">${esc(mountingLabel)}</span>`;
  const roleTag = item.role ? `<span class="peri-card-role">${esc(item.role)}</span>` : '';
  const key = `${type}:${index}`;

  return `<div class="peri-card" data-key="${esc(key)}">
    <div class="peri-card-info">
      <div class="peri-card-name">
        <span class="peri-card-type-badge">${esc(type)}</span>
        ${esc(name)} ${roleTag} ${mountingTag}
      </div>
      <div class="peri-card-meta">${model ? esc(model) + ' · ' : ''}${esc(iface)}</div>
    </div>
    <div class="peri-card-actions">
      <button class="btn btn-sm btn-outline peri-card-edit" data-key="${esc(key)}">${esc(t('periEdit'))}</button>
      <button class="btn btn-sm btn-danger peri-card-delete" data-key="${esc(key)}">${esc(t('periDelete'))}</button>
    </div>
  </div>`;
}

function renderForm(type, item, index) {
  const iface = item?.interface || '';
  const existingPins = item?.pins || {};
  const allPins = [];
  for (const [ifName, pins] of Object.entries(existingPins)) {
    if (Array.isArray(pins)) {
      for (const p of pins) allPins.push({ iface: ifName, role: p.role, gpio: p.gpio, activeLevel: p.activeLevel || '' });
    }
  }

  let html = `<div class="peri-form" data-form-type="${esc(type)}" data-form-index="${index}">
    <div class="peri-form-title">${index >= 0 ? esc(t('periEdit')) : esc(t('periAddPeripheral'))}</div>
    <div class="peri-field-grid">
      <div class="peri-field-row">
        <label>${esc(t('periType'))}</label>
        <input type="text" class="peri-input" name="type" value="${esc(type)}" placeholder="audio, display, button, ...">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periInterface'))}</label>
        <input type="text" class="peri-input" name="interface" value="${esc(iface)}" placeholder="I2S, SPI, GPIO, I2C, ...">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periNameEn'))}</label>
        <input type="text" class="peri-input" name="name_en" value="${esc(item?.name?.en || '')}">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periNameZh'))}</label>
        <input type="text" class="peri-input" name="name_zh" value="${esc(item?.name?.['zh-CN'] || '')}">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periModel'))}</label>
        <input type="text" class="peri-input" name="model" value="${esc(item?.model || '')}" placeholder="ES8311, ST7789, ...">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periCount'))}</label>
        <input type="number" class="peri-input" name="count" min="1" value="${item?.count || ''}" placeholder="optional">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periResolution'))}</label>
        <input type="text" class="peri-input" name="resolution" value="${esc(item?.resolution || '')}" placeholder="240x240">
      </div>
      <div class="peri-field-row">
        <label>Mounting</label>
        <select class="peri-input" name="mounting">
          <option value="onboard" ${item?.mounting !== 'accessory' ? 'selected' : ''}>Onboard / 板载</option>
          <option value="accessory" ${item?.mounting === 'accessory' ? 'selected' : ''}>Accessory / 配件</option>
        </select>
      </div>
      <div class="peri-field-row">
        <label class="peri-checkbox-label">
          <input type="checkbox" name="pinLocked" ${item?.pinLocked !== false ? 'checked' : ''}> Pin Locked / 引脚锁定
        </label>
      </div>
    </div>

    <div class="peri-pin-section">
      <label>${esc(t('periPinMapping'))}</label>
      <table class="peri-pin-table">
        <thead><tr><th>Interface</th><th>Role</th><th>GPIO</th><th>Active</th><th></th></tr></thead>
        <tbody>`;

  for (const pin of allPins) {
    html += renderPinRow(pin.iface, pin.role, pin.gpio, pin.activeLevel);
  }
  if (allPins.length === 0) {
    html += renderPinRow(iface, '', '', '');
  }

  html += `</tbody></table>
      <button type="button" class="btn btn-sm btn-outline peri-pin-add-btn">+ Pin</button>
    </div>

    <div class="peri-field-grid" style="margin-top:12px">
      <div class="peri-field-row">
        <label>Kconfig</label>
        <input type="text" class="peri-input" name="kconfig" placeholder='{"SYMBOL": "value"} or empty' value="${esc(item?.kconfig ? JSON.stringify(item.kconfig) : '')}">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periGroup'))}</label>
        <input type="text" class="peri-input" name="group" value="${esc(item?.group || '')}">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periRole'))}</label>
        <input type="text" class="peri-input" name="role" value="${esc(item?.role || '')}">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periNoteEn'))}</label>
        <input type="text" class="peri-input" name="note_en" value="${esc(item?.note?.en || '')}">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periNoteZh'))}</label>
        <input type="text" class="peri-input" name="note_zh" value="${esc(item?.note?.['zh-CN'] || '')}">
      </div>
    </div>

    <div class="peri-form-actions">
      <button class="btn btn-sm btn-outline peri-form-cancel">${esc(t('periCancel'))}</button>
      <button class="btn btn-sm btn-primary peri-form-save">${esc(t('periSave'))}</button>
    </div>
  </div>`;
  return html;
}

function renderPinRow(iface, role, gpio, activeLevel) {
  return `<tr class="peri-pin-row">
    <td><input type="text" class="peri-pin-iface" value="${esc(iface)}" placeholder="I2S"></td>
    <td><input type="text" class="peri-pin-role" value="${esc(role)}" placeholder="role"></td>
    <td><input type="text" class="peri-pin-gpio" value="${esc(gpio)}" placeholder="GPIO"></td>
    <td><select class="peri-pin-active">
      <option value="" ${!activeLevel ? 'selected' : ''}>—</option>
      <option value="high" ${activeLevel === 'high' ? 'selected' : ''}>High</option>
      <option value="low" ${activeLevel === 'low' ? 'selected' : ''}>Low</option>
    </select></td>
    <td><button type="button" class="peri-pin-remove-btn" title="Remove">×</button></td>
  </tr>`;
}

function bindEvents(root) {
  root.querySelector('#periAddBtn')?.addEventListener('click', () => {
    editingKey = 'new';
    renderList();
  });

  root.querySelectorAll('.peri-card-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      editingKey = btn.dataset.key;
      renderList();
    });
  });

  root.querySelectorAll('.peri-card-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm(t('periDeleteConfirm'))) return;
      const [type, idx] = btn.dataset.key.split(':');
      deletePeripheral(type, parseInt(idx));
    });
  });

  const form = root.querySelector('.peri-form');
  if (!form) return;

  form.querySelector('.peri-form-cancel')?.addEventListener('click', () => {
    editingKey = null;
    renderList();
  });

  form.querySelector('.peri-form-save')?.addEventListener('click', () => {
    saveFromForm(form);
  });

  form.querySelector('.peri-pin-add-btn')?.addEventListener('click', () => {
    const tbody = form.querySelector('.peri-pin-table tbody');
    const ifaceVal = form.querySelector('[name="interface"]')?.value || '';
    tbody.insertAdjacentHTML('beforeend', renderPinRow(ifaceVal, '', '', ''));
    bindPinRemoveButtons(form);
  });

  bindPinRemoveButtons(form);
}

function bindPinRemoveButtons(form) {
  form.querySelectorAll('.peri-pin-remove-btn').forEach(btn => {
    btn.onclick = () => {
      btn.closest('tr').remove();
    };
  });
}

function saveFromForm(form) {
  const type = form.querySelector('[name="type"]').value.trim();
  const nameEn = form.querySelector('[name="name_en"]').value.trim();
  const nameZh = form.querySelector('[name="name_zh"]').value.trim();
  const iface = form.querySelector('[name="interface"]').value.trim();
  const mounting = form.querySelector('[name="mounting"]').value;
  const pinLocked = form.querySelector('[name="pinLocked"]').checked;

  if (!type) { alert(t('periTypeRequired')); return; }
  if (!nameEn) { alert(t('periNameRequired')); return; }

  const item = { name: { en: nameEn }, interface: iface || undefined, mounting, pinLocked };
  if (nameZh) item.name['zh-CN'] = nameZh;

  const model = form.querySelector('[name="model"]')?.value.trim();
  if (model) item.model = model;

  const resolution = form.querySelector('[name="resolution"]')?.value.trim();
  if (resolution) item.resolution = resolution;

  const count = form.querySelector('[name="count"]')?.value.trim();
  if (count) item.count = parseInt(count);

  // Collect pins grouped by interface
  const pins = {};
  form.querySelectorAll('.peri-pin-row').forEach(tr => {
    const pIface = tr.querySelector('.peri-pin-iface')?.value.trim();
    const pRole = tr.querySelector('.peri-pin-role')?.value.trim();
    const pGpio = tr.querySelector('.peri-pin-gpio')?.value.trim();
    const pActive = tr.querySelector('.peri-pin-active')?.value || '';
    if (pIface && pRole && pGpio) {
      if (!pins[pIface]) pins[pIface] = [];
      const gpioVal = /^\d+$/.test(pGpio) ? parseInt(pGpio) : pGpio;
      const pinEntry = { role: pRole, gpio: gpioVal };
      if (pActive) pinEntry.activeLevel = pActive;
      pins[pIface].push(pinEntry);
    }
  });
  if (Object.keys(pins).length > 0) item.pins = pins;

  const kconfigStr = form.querySelector('[name="kconfig"]')?.value.trim();
  if (kconfigStr) {
    try { item.kconfig = JSON.parse(kconfigStr); }
    catch { alert('Kconfig must be valid JSON or empty'); return; }
  } else {
    item.kconfig = null;
  }

  const group = form.querySelector('[name="group"]')?.value.trim();
  if (group) item.group = group;
  const role = form.querySelector('[name="role"]')?.value.trim();
  if (role) item.role = role;

  const noteEn = form.querySelector('[name="note_en"]')?.value.trim();
  const noteZh = form.querySelector('[name="note_zh"]')?.value.trim();
  if (noteEn || noteZh) {
    item.note = {};
    if (noteEn) item.note.en = noteEn;
    if (noteZh) item.note['zh-CN'] = noteZh;
  } else {
    item.note = null;
  }

  const formIndex = parseInt(form.dataset.formIndex);
  const origType = form.dataset.formType;

  if (formIndex >= 0 && origType) {
    if (origType === type) {
      // Same type: replace in place
      peripheralData[origType][formIndex] = item;
    } else {
      // Type changed: remove from old, add to new
      if (peripheralData[origType]) {
        peripheralData[origType].splice(formIndex, 1);
        if (peripheralData[origType].length === 0) delete peripheralData[origType];
      }
      if (!peripheralData[type]) peripheralData[type] = [];
      peripheralData[type].push(item);
    }
  } else {
    // New item
    if (!peripheralData[type]) peripheralData[type] = [];
    peripheralData[type].push(item);
  }

  dirty = true;
  editingKey = null;
  persistAndRender();
}

function deletePeripheral(type, index) {
  if (!peripheralData[type]) return;
  peripheralData[type].splice(index, 1);
  if (peripheralData[type].length === 0) delete peripheralData[type];
  dirty = true;
  editingKey = null;
  persistAndRender();
}

async function persistAndRender() {
  try {
    await apiClient.updatePeripherals(currentBoardId, { peripheralPatterns: peripheralData });
    // Re-fetch from server to ensure consistency
    const resp = await apiClient.getPeripherals(currentBoardId);
    peripheralData = resp.peripheralPatterns || {};
    dirty = false;
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
  renderList();
}
