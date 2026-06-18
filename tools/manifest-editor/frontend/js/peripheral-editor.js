import { apiClient } from './api-client.js';
import i18n, { t } from './i18n.js';
import PERIPHERAL_TEMPLATES from './peripheral-templates.data.js';

let currentBoardId = null;
let currentPlatformId = null;
let peripheralData = {};
let peripheralGroups = {};
let platformPeripherals = {};
let dirty = false;

// ─── Peripheral type templates ───
// Defines per-type: interfaces, pin roles per interface, extra fields, model suggestions
/* PERIPHERAL_TEMPLATES is imported from the shared catalog (see import at top). */

function esc(str) {
  if (!str) return '';
  const el = document.createElement('span');
  el.textContent = String(str);
  return el.innerHTML.replace(/"/g, '&quot;');
}

function localLabel(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return (i18n.getLanguage() === 'zh-CN' ? obj['zh-CN'] || obj.en : obj.en || obj['zh-CN']) || '';
}

export function isDirty() { return dirty; }

export async function renderPeripheralEditor(containerId, boardId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  currentBoardId = boardId;
  dirty = false;

  try {
    const resp = await apiClient.getPeripherals(boardId);
    peripheralData = resp.peripheralPatterns || {};
    peripheralGroups = resp.peripheralGroups || {};
  } catch {
    peripheralData = {};
    peripheralGroups = {};
  }

  // Load board, then load that chip's peripherals for GPIO defaults. Peripherals
  // are per-chip, so resolve by the board's variantId (chip id); fall back to
  // platformId for older data.
  try {
    const boardResp = await apiClient.getBoard(boardId);
    const board = boardResp.board || boardResp;
    currentPlatformId = board.variantId || board.platformId || null;
    if (currentPlatformId) {
      const platResp = await apiClient.getPlatformPeripherals(currentPlatformId);
      platformPeripherals = platResp.peripherals || {};
    }
  } catch {
    currentPlatformId = null;
    platformPeripherals = {};
  }

  container.innerHTML = '<div class="peri-editor" id="periEditorRoot"></div>';
  ensureModal();
  renderList();
}

// ─── Platform GPIO defaults resolution ───

function getExistingGroups() {
  const groups = new Set();
  for (const arr of Object.values(peripheralData)) {
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (item.group) groups.add(item.group);
    }
  }
  return [...groups].sort();
}

function generateUniqueId(type, editingType, editingIndex) {
  // Collect all existing IDs except the one being edited
  const existingIds = new Set();
  for (const [t, arr] of Object.entries(peripheralData)) {
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i < arr.length; i++) {
      if (t === editingType && i === editingIndex) continue;
      if (arr[i].id) existingIds.add(arr[i].id);
    }
  }
  // Try base type name first, then append -1, -2...
  const base = type.replace(/_/g, '-');
  if (!existingIds.has(base)) return base;
  let n = 1;
  while (existingIds.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function getPlatformDefaultPins(type, iface) {
  const pp = platformPeripherals;
  if (!pp) return {};

  if (type === 'display' && iface === 'RGB' && pp.rgb?.spec?.ports?.[0]?.pins) {
    const p = pp.rgb.spec.ports[0].pins;
    const defaults = { pclk: p.dclk, de: p.de, hsync: p.hsync, vsync: p.vsync };
    if (Array.isArray(p.r)) p.r.forEach((v, i) => { defaults[`r${i}`] = v; });
    if (Array.isArray(p.g)) p.g.forEach((v, i) => { defaults[`g${i}`] = v; });
    if (Array.isArray(p.b)) p.b.forEach((v, i) => { defaults[`b${i}`] = v; });
    return defaults;
  }

  if (type === 'display' && iface === 'MCU8080' && pp.i8080?.spec?.ports?.[0]?.pins) {
    const p = pp.i8080.spec.ports[0].pins;
    const defaults = { wr: p.wdx, rd: p.rdx, cs: p.csx, dc: p.rsx, rst: p.reset };
    if (Array.isArray(p.data)) p.data.forEach((v, i) => { if (v !== null) defaults[`d${i}`] = v; });
    return defaults;
  }

  if (type === 'display' && iface === 'QSPI' && pp.qspi?.spec?.ports) {
    const port = pp.qspi.spec.ports[0];
    const pins = port?.pinGroups?.[0] || port?.pins; // pinGroups (new) or legacy pins
    if (pins) {
      return { sck: pins.clk, cs: pins.cs, d0: pins.d0, d1: pins.d1, d2: pins.d2, d3: pins.d3 };
    }
  }

  if ((type === 'display' || type === 'led-pixel') && iface === 'SPI' && pp.spi?.spec?.ports) {
    const port = pp.spi.spec.ports[0];
    if (port?.pinGroups?.[0]) {
      const pg = port.pinGroups[0];
      return { sck: pg.clk, mosi: pg.mosi, cs: pg.cs };
    }
  }

  if (iface === 'I2C' && pp.i2c?.spec?.ports) {
    const port = pp.i2c.spec.ports[0];
    if (port?.pinGroups?.[0]) {
      const pg = port.pinGroups[0];
      return { scl: pg.scl, sda: pg.sda };
    }
  }

  if (type === 'camera' && iface === 'DVP' && pp.dvp?.spec?.ports?.[0]?.pins) {
    const p = pp.dvp.spec.ports[0].pins;
    const defaults = { pclk: p.pclk, vsync: p.vsync, hsync: p.hsync, mclk: p.mclk };
    if (Array.isArray(p.data)) p.data.forEach((v, i) => { defaults[`d${i}`] = v; });
    return defaults;
  }

  return {};
}

// ─── Modal management ───

let modalEl = null;

function ensureModal() {
  if (modalEl) return;
  modalEl = document.createElement('div');
  modalEl.id = 'periModal';
  modalEl.className = 'modal hidden';
  modalEl.style.zIndex = '1100';
  modalEl.innerHTML = `
    <div class="modal-content" style="max-width:680px; width:92%;">
      <div class="modal-header">
        <h2 id="periModalTitle"></h2>
        <button class="close-btn" id="periModalClose">&times;</button>
      </div>
      <div class="modal-body" id="periModalBody" style="max-height:70vh; overflow-y:auto;"></div>
      <div class="modal-footer" id="periModalFooter">
        <button class="btn btn-outline" id="periModalCancel">${esc(t('periCancel'))}</button>
        <button class="btn btn-primary" id="periModalSave">${esc(t('periSave'))}</button>
      </div>
    </div>`;
  document.body.appendChild(modalEl);

  modalEl.querySelector('#periModalClose').addEventListener('click', closeModal);
  modalEl.querySelector('#periModalCancel').addEventListener('click', closeModal);
}

function openModalForAdd() {
  ensureModal();
  modalEl.querySelector('#periModalTitle').textContent = t('periAddPeripheral');
  modalEl.querySelector('#periModalBody').innerHTML = buildTypeSelectorHtml();
  modalEl.querySelector('#periModalFooter').style.display = 'none';
  modalEl.classList.remove('hidden');
  bindTypeSelectorEvents();
}

function openModalForEdit(type, item, index) {
  ensureModal();
  modalEl.querySelector('#periModalTitle').textContent = t('periEdit');
  showFormInModal(type, item, index);
}

function showFormInModal(type, item, index) {
  const template = PERIPHERAL_TEMPLATES[type] || null;
  modalEl.querySelector('#periModalBody').innerHTML = buildFormHtml(type, item, index, template);
  modalEl.querySelector('#periModalFooter').style.display = '';
  modalEl.classList.remove('hidden');

  const form = modalEl.querySelector('#periModalBody');
  bindFormEvents(form, template);

  const saveBtn = modalEl.querySelector('#periModalSave');
  saveBtn.onclick = () => saveFromForm(form, type, index);
}

function closeModal() {
  if (modalEl) modalEl.classList.add('hidden');
}

// ─── Type selector (step 1 of add) ───

function buildTypeSelectorHtml() {
  const types = Object.entries(PERIPHERAL_TEMPLATES);
  let html = '<div class="peri-type-selector"><div class="peri-type-grid">';
  for (const [key, tmpl] of types) {
    html += `<button class="peri-type-card" data-type="${esc(key)}">
      <span class="peri-type-card-name">${esc(localLabel(tmpl.label))}</span>
      <span class="peri-type-card-ifaces">${tmpl.interfaces.join(', ')}</span>
    </button>`;
  }
  html += `<button class="peri-type-card peri-type-card--custom" data-type="__custom__">
    <span class="peri-type-card-name">${i18n.getLanguage() === 'zh-CN' ? '自定义' : 'Custom'}</span>
    <span class="peri-type-card-ifaces">${i18n.getLanguage() === 'zh-CN' ? '通用表单' : 'Free-form'}</span>
  </button>`;
  html += '</div></div>';
  return html;
}

function bindTypeSelectorEvents() {
  const body = modalEl.querySelector('#periModalBody');
  body.querySelectorAll('.peri-type-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      if (type === '__custom__') {
        showFormInModal('', null, -1);
      } else {
        showFormInModal(type, null, -1);
      }
    });
  });
}

// ─── List rendering ───

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
    <div class="peri-list-actions">
      <button class="btn btn-outline btn-sm" id="periGroupBtn">${i18n.getLanguage() === 'zh-CN' ? '分组管理' : 'Groups'}</button>
      <button class="btn btn-primary btn-sm" id="periAddBtn">+ ${esc(t('periAddPeripheral'))}</button>
    </div>
  </div>`;

  if (items.length === 0) {
    html += `<div class="peri-empty">${esc(t('periEmpty'))}</div>`;
  }

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

  for (const { type, index, item } of ungrouped) {
    html += renderCard(type, item, index);
  }

  for (const [groupId, entries] of Object.entries(grouped)) {
    const meta = peripheralGroups[groupId];
    const isZh = i18n.getLanguage() === 'zh-CN';
    const groupDisplayName = meta?.name
      ? (isZh ? meta.name['zh-CN'] || meta.name.en : meta.name.en || meta.name['zh-CN']) || groupId
      : groupId;
    html += `<div class="peri-group">
      <div class="peri-group-header">
        <span class="peri-group-icon">⛓</span>
        <span class="peri-group-name">${esc(groupDisplayName)}</span>
        <span class="peri-group-count">${entries.length}</span>
      </div>
      <div class="peri-group-items">`;
    for (const { type, index, item } of entries) {
      html += renderCard(type, item, index);
    }
    html += `</div></div>`;
  }

  root.innerHTML = html;
  bindListEvents(root);
}

function renderCard(type, item, index) {
  const isZh = i18n.getLanguage() === 'zh-CN';
  const name = (isZh ? item.name?.['zh-CN'] || item.name?.en : item.name?.en || item.name?.['zh-CN']) || item.model || 'Unnamed';
  const iface = item.interface || '';
  const model = item.decoder || item.model || '';
  const resStr = (item.width && item.height) ? `${item.width}×${item.height}` : (item.resolution || '');
  const pfStr = item.pixelFormat || '';
  const mountingLabel = item.mounting === 'accessory' ? t('periMountingAccessory') : t('periMountingOnboard');
  const mountingTag = `<span class="peri-card-mounting peri-card-mounting--${item.mounting === 'accessory' ? 'accessory' : 'onboard'}">${esc(mountingLabel)}</span>`;
  const key = `${type}:${index}`;

  return `<div class="peri-card" data-key="${esc(key)}">
    <div class="peri-card-info">
      <div class="peri-card-name">
        <span class="peri-card-type-badge">${esc(type)}</span>
        ${esc(name)} ${mountingTag}
      </div>
      <div class="peri-card-meta">${model ? esc(model) + ' · ' : ''}${resStr ? esc(resStr) + ' · ' : ''}${pfStr ? esc(pfStr) + ' · ' : ''}${esc(iface)}</div>
    </div>
    <div class="peri-card-actions">
      <button class="btn btn-sm btn-outline peri-card-edit" data-key="${esc(key)}">${esc(t('periEdit'))}</button>
      <button class="btn btn-sm btn-danger peri-card-delete" data-key="${esc(key)}">${esc(t('periDelete'))}</button>
    </div>
  </div>`;
}

// ─── Port options ───

function getPlatformPortOptions(iface) {
  if (!platformPeripherals) return [];
  const ifaceKey = { I2C: 'i2c', SPI: 'spi', SW_SPI: 'spi', UART: 'uart', I2S: 'i2s' }[iface];
  if (!ifaceKey) return [];
  const ports = platformPeripherals[ifaceKey]?.spec?.ports;
  if (!ports?.length) return [];
  return ports.map((port, i) => ({ origIndex: i, label: `${iface.replace('SW_', '')}${port.id ?? i}` }));
}

function getPlatformPinsForPort(type, iface, portIdx) {
  if (!platformPeripherals || portIdx === null || portIdx === undefined) return {};
  const idx = parseInt(portIdx);
  const ifaceKey = { I2C: 'i2c', SPI: 'spi', SW_SPI: 'spi', UART: 'uart', I2S: 'i2s' }[iface];
  if (!ifaceKey) return {};
  const port = platformPeripherals[ifaceKey]?.spec?.ports?.[idx];
  if (!port) return {};
  const pg = port.pinGroups?.[0] || {};
  // For SPI ports backed by QSPI hardware, d0 = mosi
  const isQspiBackend = port.backend === 'qspi';
  const roleMap = {
    I2C:    { scl: 'scl', sda: 'sda' },
    SPI:    isQspiBackend
              ? { clk: 'sck', d0: 'mosi', cs: 'cs' }
              : { clk: 'sck', mosi: 'mosi', miso: 'miso', cs: 'cs' },
    SW_SPI: { clk: 'sck', mosi: 'mosi', miso: 'miso', cs: 'cs' },
    UART:   { tx: 'tx', rx: 'rx', cts: 'cts', rts: 'rts' },
    I2S:    { bck: 'bck', ws: 'ws', din: 'din', dout: 'dout', mclk: 'mclk' },
  }[iface] || {};
  const result = {};
  for (const [platKey, roleKey] of Object.entries(roleMap)) {
    if (pg[platKey] !== undefined && pg[platKey] !== null) result[roleKey] = pg[platKey];
  }
  return result;
}

function getPlatformPixelFormats(iface) {
  const pp = platformPeripherals;
  const specKey = { RGB: 'rgb', MCU8080: 'i8080' }[iface];
  if (!specKey || !pp?.[specKey]?.spec?.pixelFmt) return null;
  return pp[specKey].spec.pixelFmt.map(s => s.replace('TUYA_PIXEL_FMT_', ''));
}

function getPlatformDataBitsForPixelFmt(pixelFmt) {
  const spec = platformPeripherals?.i8080?.spec;
  if (!spec?.pixelFmtDataBits) return null;
  const key = `TUYA_PIXEL_FMT_${pixelFmt}`;
  return spec.pixelFmtDataBits[key]?.map(String) || null;
}

// Map Tuya platform constant strings to short keys
const TUYA_CONST_MAP = {
  'TUYA_PWM_NEGATIVE': 'negative', 'TUYA_PWM_POSITIVE': 'positive',
  'TUYA_PWM_CNT_UP': 'up', 'TUYA_PWM_CNT_UP_DOWN': 'up_down',
  'TUYA_RGB_DATA_IN_FALLING_EDGE': 'falling', 'TUYA_RGB_DATA_IN_RISING_EDGE': 'rising',
};
function mapTuyaConst(s) { return TUYA_CONST_MAP[s] ?? s.replace(/^TUYA_[A-Z0-9]+_/, '').toLowerCase(); }

function getPlatformFieldOptions(iface, fieldKey) {
  const pp = platformPeripherals;
  if (!pp) return null;
  if (iface === 'RGB' && fieldKey === 'clkEdge') {
    const edges = pp.rgb?.spec?.outDataClkEdge;
    return edges?.length ? edges.map(mapTuyaConst) : null;
  }
  if (iface === 'PWM' && fieldKey === 'polarity') {
    const opts = pp.pwm?.spec?.polarity;
    return opts?.length ? opts.map(mapTuyaConst) : null;
  }
  if (iface === 'PWM' && fieldKey === 'countMode') {
    const opts = pp.pwm?.spec?.countMode;
    return opts?.length ? opts.map(mapTuyaConst) : null;
  }
  if ((iface === 'DVP' || iface === 'I2C') && fieldKey === 'i2cPort') {
    const ports = pp.i2c?.spec?.ports;
    if (!ports?.length) return null;
    return ports.map(p => `I2C${p.id}`);
  }
  if (['SPI+PWM', 'PWM'].includes(iface) && ['motorA1', 'motorA2', 'motorB1', 'motorB2', 'pwmCh0', 'pwmCh1'].includes(fieldKey)) {
    const channels = pp.pwm?.spec?.channels;
    if (!channels?.length) return null;
    return channels.map(ch => String(ch.id));
  }
  return null;
}

function getPlatformFieldRange(iface, fieldKey) {
  const pp = platformPeripherals;
  if (!pp) return null;
  if (iface === 'RGB' && fieldKey === 'clk') return pp.rgb?.spec?.dclkFreq || null;
  if (iface === 'MCU8080' && fieldKey === 'clk') return pp.i8080?.spec?.clkFreq || null;
  if (iface === 'DVP' && fieldKey === 'clk') {
    const freq = pp.dvp?.spec?.mclkFreq;
    if (freq) return { min: 0, max: freq.max };
    return null;
  }
  if (iface === 'PWM' && fieldKey === 'duty') return pp.pwm?.spec?.duty || null;
  if (iface === 'PWM' && fieldKey === 'freq') return pp.pwm?.spec?.freq || null;
  return null;
}

function getPlatformPwmOptions() {
  const channels = platformPeripherals?.pwm?.spec?.channels;
  if (!channels?.length) return [];
  return channels.map(ch => ({ id: ch.id, pin: ch.pin, label: `PWM${ch.id}` }));
}

function getPlatformPwmPinForChannel(channelId) {
  const channels = platformPeripherals?.pwm?.spec?.channels;
  if (!channels) return null;
  const ch = channels.find(c => c.id === channelId);
  return ch?.pin ?? null;
}

function buildBlPwmPortHtml(currentChannel, hidden) {
  const options = getPlatformPwmOptions();
  if (!options.length) return '';
  const cur = currentChannel !== undefined && currentChannel !== null ? String(currentChannel) : '';
  const isZh = i18n.getLanguage() === 'zh-CN';
  let html = `<div class="peri-field-row" id="periBlPwmPortRow"${hidden ? ' style="display:none;"' : ''}>
    <label>${esc(t('periBlPwmChannel'))}</label>
    <select class="peri-input" id="periBlPwmSelect">
      <option value="">— (${isZh ? '手动' : 'manual'})</option>`;
  options.forEach(ch => {
    html += `<option value="${ch.id}" ${cur === String(ch.id) ? 'selected' : ''}>${esc(ch.label)}</option>`;
  });
  html += `</select></div>`;
  return html;
}

function buildBlPwmConfigHtml(currentChannel, blPwm, hidden) {
  const cfg = blPwm || {};
  const isZh = i18n.getLanguage() === 'zh-CN';
  const cur = currentChannel !== undefined && currentChannel !== null ? String(currentChannel) : '';
  let html = `<div id="periBlPwmConfigSection" style="${hidden ? 'display:none;' : ''}margin-top:8px; padding-bottom:8px; border-bottom:1px solid var(--color-border);">
    <div class="peri-pin-section-label" style="padding-bottom:6px; border-bottom:1px solid var(--color-border); margin-bottom:6px;">${esc(t('periBlPwmConfig'))}</div>
    <div class="peri-blpwm-grid">`;
  // PWM channel
  const pwmOptions = getPlatformPwmOptions();
  if (pwmOptions.length) {
    html += `<div class="peri-field-row"><label>${esc(t('periBlPwmChannel'))}</label>
      <select class="peri-input" id="periBlPwmSelect">`;
    pwmOptions.forEach(ch => {
      html += `<option value="${ch.id}" ${cur === String(ch.id) ? 'selected' : ''}>${esc(ch.label)}</option>`;
    });
    html += `</select></div>`;
  }
  // Polarity — from platform or fallback
  const polarityOpts = getPlatformFieldOptions('PWM', 'polarity') || ['positive', 'negative'];
  html += `<div class="peri-field-row"><label>${esc(t('periBlPwmPolarity'))}</label>
    <select class="peri-input" data-blpwm-key="polarity">`;
  for (const opt of polarityOpts) {
    const label = opt === 'positive' ? t('periBlPwmPolarityPos') : opt === 'negative' ? t('periBlPwmPolarityNeg') : opt;
    html += `<option value="${esc(opt)}" ${(cfg.polarity || 'positive') === opt ? 'selected' : ''}>${esc(label)}</option>`;
  }
  html += `</select></div>`;
  // Count mode — from platform or fallback
  const countModeOpts = getPlatformFieldOptions('PWM', 'countMode') || ['up', 'up_down'];
  html += `<div class="peri-field-row"><label>${esc(t('periBlPwmCountMode'))}</label>
    <select class="peri-input" data-blpwm-key="countMode">`;
  for (const opt of countModeOpts) {
    const label = opt === 'up' ? t('periBlPwmCountUp') : opt === 'up_down' ? t('periBlPwmCountUpDown') : opt;
    html += `<option value="${esc(opt)}" ${(cfg.countMode || 'up') === opt ? 'selected' : ''}>${esc(label)}</option>`;
  }
  html += `</select></div>`;
  // Duty, cycle, frequency — use platform ranges where available
  const dutyRange = getPlatformFieldRange('PWM', 'duty');
  const freqRange  = getPlatformFieldRange('PWM', 'freq');
  for (const [key, labelKey, range] of [
    ['duty', 'periBlPwmDuty', dutyRange],
    ['cycle', 'periBlPwmCycle', null],
    ['freq',  'periBlPwmFreq',  freqRange],
  ]) {
    const val = cfg[key] ?? '';
    const unitStr = range ? ` (${range.min ?? 0}–${range.max ?? ''})` : '';
    const minAttr = range?.min !== undefined ? ` min="${range.min}"` : ' min="0"';
    const maxAttr = range?.max !== undefined ? ` max="${range.max}"` : '';
    html += `<div class="peri-field-row"><label>${esc(t(labelKey) + unitStr)}</label>
      <input type="number" class="peri-input" data-blpwm-key="${esc(key)}" value="${esc(String(val))}" placeholder="—"${minAttr}${maxAttr}></div>`;
  }
  html += `</div></div>`;
  return html;
}

function buildPortSelectorHtml(iface, currentPort) {
  const portOptions = getPlatformPortOptions(iface);
  if (!portOptions.length) return '';
  const cur = currentPort !== undefined && currentPort !== null ? String(currentPort) : '';
  let html = `<div class="peri-field-row" id="periPortRow">
    <label>${esc(t('periPort'))}</label>
    <select class="peri-input" id="periPortSelect">`;
  portOptions.forEach(p => {
    html += `<option value="${p.origIndex}" ${cur === String(p.origIndex) ? 'selected' : ''}>${esc(p.label)}</option>`;
  });
  html += `</select></div>`;
  return html;
}

// ─── Form HTML ───

function buildFormHtml(type, item, index, template) {
  const rawIface = item?.interface || (template?.interfaces?.[0] || '');
  // Filter interfaces by platform support, fall back to first supported if stored value is unavailable
  const supportedIfacesList = template
    ? template.interfaces.filter(i => { const req = template.interfacePlatformRequires?.[i]; return !req || !!platformPeripherals[req]; })
    : null;
  const iface = (supportedIfacesList && !supportedIfacesList.includes(rawIface))
    ? (supportedIfacesList[0] || rawIface)
    : rawIface;
  const existingPins = item?.pins || {};

  // Build interface selector
  let ifaceHtml;
  if (template) {
    const supportedIfaces = supportedIfacesList || template.interfaces;
    ifaceHtml = `<select class="peri-input" name="interface" id="periIfaceSelect">`;
    for (const i of supportedIfaces) {
      ifaceHtml += `<option value="${esc(i)}" ${i === iface ? 'selected' : ''}>${esc(i)}</option>`;
    }
    ifaceHtml += `</select>`;
  } else {
    ifaceHtml = `<input type="text" class="peri-input" name="interface" value="${esc(iface)}" placeholder="I2S, SPI, GPIO, I2C, ...">`;
  }

  // Extra fields based on template
  const showModel = !template || template.fields?.includes('model');
  const showResolution = !template || template.fields?.includes('resolution');
  const showPixelFormat = template?.fields?.includes('pixelFormat');
  const showBacklight = template?.fields?.includes('backlight');
  const showAxes = template?.fields?.includes('axes');
  const showTouchRange = template?.fields?.includes('touchRange');
  const showTouchTransform = template?.fields?.includes('touchTransform');

  let html = `<div class="peri-form" data-form-type="${esc(type)}" data-form-index="${index}">
    <div class="peri-field-grid">
      <div class="peri-field-row">
        <label>${esc(t('periType'))}</label>
        <input type="text" class="peri-input" name="type" value="${esc(type)}" readonly style="background:var(--color-sidebar); color:var(--color-muted);">
      </div>
      <div class="peri-field-row">
        <label>ID</label>
        <input type="text" class="peri-input" name="periId" value="${esc(item?.id || '')}" readonly style="background:var(--color-sidebar); color:var(--color-muted);">
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
        <label>${esc(t('periMounting'))}</label>
        <select class="peri-input" name="mounting">
          <option value="onboard" ${item?.mounting !== 'accessory' ? 'selected' : ''}>${esc(t('periMountingOnboard'))}</option>
          <option value="accessory" ${item?.mounting === 'accessory' ? 'selected' : ''}>${esc(t('periMountingAccessory'))}</option>
        </select>
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periInterface'))}</label>
        ${ifaceHtml}
      </div>`;

  html += buildPortSelectorHtml(iface, item?.port);

  if (showModel) {
    const suggestions = template?.modelSuggestionsByInterface?.[iface] ?? template?.modelSuggestions;
    const listId = suggestions ? `periModelList-${type}` : '';
    const hideForIface = template?.hideModelForInterface || [];
    const modelHidden = hideForIface.includes(iface);
    const modelLabel = template?.modelLabel ? localLabel(template.modelLabel) : t('periModel');
    html += `<div class="peri-field-row" id="periModelRow" style="${modelHidden ? 'display:none;' : ''}">
        <label>${esc(modelLabel)}</label>`;
    if (template?.modelAsSelect && suggestions?.length) {
      html += `<select class="peri-input" name="model" id="periModelSelect">`;
      for (const s of suggestions) {
        html += `<option value="${esc(s)}" ${item?.model === s ? 'selected' : ''}>${esc(s)}</option>`;
      }
      html += `</select>`;
    } else {
      html += `<input type="text" class="peri-input" name="model" value="${esc(item?.model || '')}" placeholder="IC model" autocomplete="off" ${listId ? `list="${listId}"` : ''}>
        ${suggestions ? `<datalist id="${listId}">${suggestions.map(s => `<option value="${esc(s)}">`).join('')}</datalist>` : ''}`;
    }
    html += `</div>`;
  }

  if (showPixelFormat) {
    const currentPf = item?.pixelFormat || '';
    const allPfOptions = ['RGB565', 'RGB888', 'MONOCHROME', 'GRAYSCALE2'];
    const pfOptions = getPlatformPixelFormats(iface)
      ?? template?.pixelFormatByInterface?.[iface]
      ?? allPfOptions;
    html += `<div class="peri-field-row">
        <label>${esc(t('periPixelFormat'))}</label>
        <select class="peri-input" name="pixelFormat" id="periPixelFormatSelect">`;
    for (const pf of pfOptions) {
      html += `<option value="${esc(pf)}" ${currentPf === pf ? 'selected' : ''}>${esc(pf)}</option>`;
    }
    html += `</select></div>`;
  }

  if (showBacklight) {
    const currentBl = item?.backlight || 'GPIO';
    const blLabels = { GPIO: 'GPIO', PWM: 'PWM', CUSTOM: t('periBlCustom'), NONE: t('periBlNone') };
    html += `<div class="peri-field-row">
        <label>${esc(t('periBacklight'))}</label>
        <select class="peri-input" name="backlight" id="periBlModeSelect">`;
    for (const opt of ['GPIO', 'PWM', 'CUSTOM', 'NONE']) {
      html += `<option value="${esc(opt)}" ${currentBl === opt ? 'selected' : ''}>${esc(blLabels[opt])}</option>`;
    }
    html += `</select></div>`;
    html += buildBlPwmConfigHtml(item?.blPwmChannel, item?.blPwm, currentBl !== 'PWM');
  }

  // Audio decoder select (replaces generic model for audio type)
  if (template?.audioDecoder) {
    const isZh = i18n.getLanguage() === 'zh-CN';
    const currentDecoder = item?.decoder || 'NONE';
    const decoderHidden = iface === 'INTERNAL';
    html += `<div class="peri-field-row" id="periAudioDecoderRow" style="${decoderHidden ? 'display:none;' : ''}">
        <label>${isZh ? '音频解码器' : 'Audio Decoder'}</label>
        <select class="peri-input" name="audioDecoder" id="periAudioDecoderSelect">`;
    for (const opt of template.audioDecoder.options) {
      html += `<option value="${esc(opt)}" ${currentDecoder === opt ? 'selected' : ''}>${esc(opt)}</option>`;
    }
    html += `</select></div>`;
  }

  if (showResolution) {
    const resW = item?.width || '';
    const resH = item?.height || '';
    html += `<div class="peri-field-row" style="grid-column:1/-1;">
        <label>${esc(t('periResolution'))}</label>
        <div class="peri-res-inputs">
          <input type="number" class="peri-input" name="res_width" value="${esc(String(resW))}" placeholder="W" min="1">
          <span class="peri-res-sep">×</span>
          <input type="number" class="peri-input" name="res_height" value="${esc(String(resH))}" placeholder="H" min="1">
        </div>
      </div>`;
  }

  if (showAxes) {
    html += `<div class="peri-field-row">
        <label>${esc(t('periAxes'))}</label>
        <select class="peri-input" name="axes">
          <option value="3" ${item?.axes === 3 || !item?.axes ? 'selected' : ''}>3 (${esc(t('periAxesAccel'))})</option>
          <option value="6" ${item?.axes === 6 ? 'selected' : ''}>6 (${esc(t('periAxesAccel'))} + ${esc(t('periAxesGyro'))})</option>
          <option value="9" ${item?.axes === 9 ? 'selected' : ''}>9 (${esc(t('periAxesAccel'))} + ${esc(t('periAxesGyro'))} + ${esc(t('periAxesMag'))})</option>
        </select>
      </div>`;
  }

  if (showTouchRange) {
    const xMax = item?.xMax ?? '';
    const yMax = item?.yMax ?? '';
    html += `<div class="peri-field-row" style="grid-column:1/-1;">
        <label>${esc(t('periTouchRange'))}</label>
        <div class="peri-res-inputs">
          <input type="number" class="peri-input" name="touch_x_max" value="${esc(String(xMax))}" placeholder="X Max" min="0">
          <span class="peri-res-sep">×</span>
          <input type="number" class="peri-input" name="touch_y_max" value="${esc(String(yMax))}" placeholder="Y Max" min="0">
        </div>
      </div>`;
  }

  if (showTouchTransform) {
    const mirrorX = item?.mirrorX === true;
    const mirrorY = item?.mirrorY === true;
    const swapXY = item?.swapXY === true;
    html += `<div class="peri-field-row" style="grid-column:1/-1;">
        <label>${esc(t('periTouchTransform'))}</label>
        <div class="peri-touch-transform">
          <label class="peri-checkbox-label"><input type="checkbox" name="mirror_x" ${mirrorX ? 'checked' : ''}> ${esc(t('periTouchFlipH'))}</label>
          <label class="peri-checkbox-label"><input type="checkbox" name="mirror_y" ${mirrorY ? 'checked' : ''}> ${esc(t('periTouchFlipV'))}</label>
          <label class="peri-checkbox-label"><input type="checkbox" name="swap_xy" ${swapXY ? 'checked' : ''}> ${esc(t('periTouchSwapXY'))}</label>
        </div>
      </div>`;
  }

  html += `</div>`;

  // Interface-specific extra fields (e.g. RGB timing)
  const extraFields = template?.interfaceExtraFields?.[iface];
  const isZhLang = i18n.getLanguage() === 'zh-CN';
  if (template?.interfaceExtraFields) {
    const allIfaceHaveExtra = Object.keys(template.interfaceExtraFields);
    html += `<div class="peri-iface-extra-section" id="periIfaceExtraSection" style="${extraFields ? '' : 'display:none;'}">`;
    html += `<div class="peri-pin-section-label" id="periIfaceExtraTitle">${esc(iface)} ${esc(t('periIfaceConfig'))}</div>`;
    // Render fields for current iface (or first found, hidden ones won't matter since section is hidden)
    const fieldsToRender = extraFields || template.interfaceExtraFields[allIfaceHaveExtra[0]] || [];
    const timing = item?.timing || {};
    const currentPfForExtra = item?.pixelFormat || '';
    html += `<div class="peri-iface-extra-grid">`;
    for (const f of fieldsToRender) {
      const val = timing[f.key] ?? '';
      html += `<div class="peri-field-row"><label>${esc(t(f.labelKey))}</label>`;
      if (f.type === 'select') {
        // Platform-driven options take priority; dataBits filtered by current pixel format
        const platOpts = f.key === 'dataBits' && currentPfForExtra
          ? getPlatformDataBitsForPixelFmt(currentPfForExtra)
          : getPlatformFieldOptions(iface, f.key);
        const opts = platOpts || f.options;
        const isZh = i18n.getLanguage() === 'zh-CN';
        html += `<select class="peri-input" data-timing-key="${esc(f.key)}">`;
        if (f.allowEmpty) html += `<option value="">${isZh ? '无' : 'None'}</option>`;
        for (const opt of opts) {
          const syncLabels = { VH: t('periRgbSyncVH'), DE: t('periRgbSyncDE'), 'VH+DE': t('periRgbSyncVHDE') };
          const edgeLabels = { rising: t('periRgbEdgeRising'), falling: t('periRgbEdgeFalling') };
          const activeLevelLabels = { high: t('periActiveLevelHigh'), low: t('periActiveLevelLow') };
          const pwmChs = platformPeripherals?.pwm?.spec?.channels || [];
          const pwmLabels = Object.fromEntries(pwmChs.map(ch => [String(ch.id), `PWM${ch.id}`]));
          const label = syncLabels[opt] ?? edgeLabels[opt] ?? activeLevelLabels[opt] ?? pwmLabels[opt] ?? opt;
          html += `<option value="${esc(opt)}" ${val === opt ? 'selected' : ''}>${esc(label)}</option>`;
        }
        html += `</select>`;
      } else {
        const range = getPlatformFieldRange(iface, f.key) ?? (f.min !== undefined ? { min: f.min, max: f.max } : null);
        const minAttr = range?.min !== undefined ? ` min="${range.min}"` : ' min="0"';
        const maxAttr = range?.max !== undefined ? ` max="${range.max}"` : '';
        const placeholder = range ? `${range.min ?? 0}–${range.max ?? ''}` : '—';
        html += `<input type="number" class="peri-input" data-timing-key="${esc(f.key)}" value="${esc(String(val))}" placeholder="${esc(placeholder)}"${minAttr}${maxAttr}>`;
      }
      html += `</div>`;
    }
    html += `</div></div>`;
  }

  // Pin mapping section
  html += `<div class="peri-pin-section">
      <div class="peri-pin-locked-row">
        <label class="peri-checkbox-label">
          <input type="checkbox" name="pinLocked" ${item?.pinLocked !== false ? 'checked' : ''}> Pin Locked / 引脚锁定
        </label>
      </div>
      <label>${esc(t('periPinMapping'))}</label>
      <table class="peri-pin-table">
        <thead><tr><th>Role</th><th>GPIO</th><th>Active</th></tr></thead>
        <tbody id="periPinTbody">`;

  html += buildPinRows(type, iface, template, existingPins, template?.audioDecoder ? (item?.decoder || 'NONE') : null, item?.pixelFormat);

  html += `</tbody></table>`;
  if (!template) {
    html += `<button type="button" class="btn btn-sm btn-outline peri-pin-add-btn">+ Pin</button>`;
  }
  html += `</div>`;

  // Bottom fields
  html += `
    <div class="peri-kconfig-section" style="margin-top:12px;">
      <label>Kconfig</label>
      <table class="peri-pin-table peri-kconfig-table">
        <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
        <tbody id="periKconfigTbody">`;

  const kconfigEntries = item?.kconfig ? Object.entries(item.kconfig) : [];
  if (kconfigEntries.length > 0) {
    for (const [k, v] of kconfigEntries) {
      html += renderKconfigRow(k, v);
    }
  }

  html += `</tbody></table>
      <button type="button" class="btn btn-sm btn-outline peri-kconfig-add-btn">+ Kconfig</button>
    </div>

    <div class="peri-field-grid" style="margin-top:12px;">
      <div class="peri-field-row">
        <label>${esc(t('periNoteEn'))}</label>
        <input type="text" class="peri-input" name="note_en" value="${esc(item?.note?.en || '')}">
      </div>
      <div class="peri-field-row">
        <label>${esc(t('periNoteZh'))}</label>
        <input type="text" class="peri-input" name="note_zh" value="${esc(item?.note?.['zh-CN'] || '')}">
      </div>
    </div>
  </div>`;
  return html;
}

function buildPinRows(type, iface, template, existingPins, decoderVal, pixelFormat) {
  let html = '';

  if (template && template.pins[iface] && template.pins[iface].length > 0) {
    // Template mode: show all defined pin roles, pre-fill from existing data or platform defaults
    const existingForIface = existingPins[iface] || [];
    const defaults = getPlatformDefaultPins(type, iface);

    const groups = template.pinGroupsByPixelFormat?.[iface]?.[pixelFormat]
      ?? template.pinGroupsByPixelFormat?.[iface]?.RGB565
      ?? template.pinGroups?.[iface];
    if (groups) {
      // Grouped rendering
      for (const group of groups) {
        html += `<tr class="peri-pin-group-header" data-group="${esc(group.labelKey)}"><td colspan="3">${esc(t(group.labelKey))}</td></tr>`;
        for (const role of group.pins) {
          const existing = existingForIface.find(p => p.role === role);
          const gpio = existing ? existing.gpio : (defaults[role] !== undefined ? defaults[role] : '');
          const activeLevel = existing?.activeLevel || '';
          html += renderTemplatedPinRow(role, gpio, activeLevel, iface, !!group.readonly);
        }
      }
    } else {
      // Flat rendering
      const roles = template.pins[iface];
      for (const role of roles) {
        const existing = existingForIface.find(p => p.role === role);
        const gpio = existing ? existing.gpio : (defaults[role] !== undefined ? defaults[role] : '');
        const activeLevel = existing?.activeLevel || '';
        html += renderTemplatedPinRow(role, gpio, activeLevel, iface);
      }
    }

    // Audio decoder I2C pins
    if (template.audioDecoder && iface !== 'INTERNAL' && decoderVal && decoderVal !== 'NONE') {
      const dpIface = template.audioDecoder.decoderPinInterface;
      html += `<tr class="peri-pin-section-row"><td colspan="3" style="padding:4px 8px; color:var(--color-muted); font-size:0.82em; background:var(--color-sidebar);">${esc(dpIface)} · Decoder</td></tr>`;
      const decoderDefaults = getPlatformDefaultPins(type, dpIface);
      const existingDecoderPins = existingPins[dpIface] || [];
      for (const role of template.audioDecoder.decoderPins) {
        const existing = existingDecoderPins.find(p => p.role === role);
        const gpio = existing ? existing.gpio : (decoderDefaults[role] !== undefined ? decoderDefaults[role] : '');
        const activeLevel = existing?.activeLevel || '';
        html += renderTemplatedPinRow(role, gpio, activeLevel, dpIface);
      }
    }
  } else if (!template) {
    // Custom mode: show existing pins or one empty row
    const allPins = [];
    for (const [ifName, pins] of Object.entries(existingPins)) {
      if (Array.isArray(pins)) {
        for (const p of pins) allPins.push({ iface: ifName, role: p.role, gpio: p.gpio, activeLevel: p.activeLevel || '' });
      }
    }
    if (allPins.length === 0) {
      html += renderCustomPinRow(iface, '', '', '');
    } else {
      for (const pin of allPins) {
        html += renderCustomPinRow(pin.iface, pin.role, pin.gpio, pin.activeLevel);
      }
    }
  }

  return html;
}

function renderTemplatedPinRow(role, gpio, activeLevel, iface, readonly) {
  const gpioVal = gpio !== '' && gpio !== undefined ? gpio : '';
  if (readonly) {
    return `<tr class="peri-pin-row" data-role="${esc(role)}" data-iface="${esc(iface || '')}">
    <td><code class="peri-pin-role-label">${esc(role)}</code></td>
    <td><input type="number" class="peri-pin-gpio" value="${gpioVal}" readonly></td>
    <td>—</td>
  </tr>`;
  }
  return `<tr class="peri-pin-row" data-role="${esc(role)}" data-iface="${esc(iface || '')}">
    <td><code class="peri-pin-role-label">${esc(role)}</code></td>
    <td><input type="number" class="peri-pin-gpio" value="${gpioVal}" placeholder="—" min="0" max="55"></td>
    <td><select class="peri-pin-active">
      <option value="" ${!activeLevel ? 'selected' : ''}>—</option>
      <option value="high" ${activeLevel === 'high' ? 'selected' : ''}>High</option>
      <option value="low" ${activeLevel === 'low' ? 'selected' : ''}>Low</option>
    </select></td>
  </tr>`;
}

function renderKconfigRow(key, value) {
  return `<tr class="peri-kconfig-row">
    <td><input type="text" class="peri-kconfig-key" value="${esc(key || '')}" placeholder="CONFIG_SYMBOL"></td>
    <td><input type="text" class="peri-kconfig-val" value="${esc(String(value ?? ''))}" placeholder="value"></td>
    <td><button type="button" class="peri-pin-remove-btn" title="Remove">×</button></td>
  </tr>`;
}

function renderCustomPinRow(iface, role, gpio, activeLevel) {
  return `<tr class="peri-pin-row">
    <td><input type="text" class="peri-pin-iface" value="${esc(iface)}" placeholder="I2S" style="width:60px;"></td>
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

// ─── Event binding ───

function bindListEvents(root) {
  root.querySelector('#periAddBtn')?.addEventListener('click', () => {
    openModalForAdd();
  });

  root.querySelector('#periGroupBtn')?.addEventListener('click', () => {
    openGroupModal();
  });

  root.querySelectorAll('.peri-card-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const [type, idx] = btn.dataset.key.split(':');
      const index = parseInt(idx);
      const item = peripheralData[type]?.[index];
      if (item) openModalForEdit(type, item, index);
    });
  });

  root.querySelectorAll('.peri-card-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm(t('periDeleteConfirm'))) return;
      const [type, idx] = btn.dataset.key.split(':');
      deletePeripheral(type, parseInt(idx));
    });
  });
}

function bindFormEvents(form, template) {
  // Helper: show/hide hsync/vsync rows based on RGB sync mode
  const applySyncModeVisibility = (syncMode) => {
    const hideHV = syncMode === 'DE';
    ['hsync', 'vsync'].forEach(role => {
      const row = form.querySelector(`[data-role="${role}"]`);
      if (row) row.style.display = hideHV ? 'none' : '';
    });
  };

  // Helper: apply I2C port selection → update i2c_scl/i2c_sda pin rows for DVP camera
  const applyI2CPortPins = (portLabel) => {
    const isNone = !portLabel;
    const tbody = form.querySelector('#periPinTbody');
    // Show/hide i2c pin rows and group header
    ['i2c_scl', 'i2c_sda'].forEach(role => {
      const row = tbody?.querySelector(`[data-role="${role}"]`);
      if (row) row.style.display = isNone ? 'none' : '';
    });
    const i2cHeader = tbody?.querySelector('[data-group="periPinGroupI2C"]');
    if (i2cHeader) i2cHeader.style.display = isNone ? 'none' : '';
    if (isNone) return;
    const portId = parseInt(portLabel.replace('I2C', '') ?? '');
    if (isNaN(portId)) return;
    const port = platformPeripherals?.i2c?.spec?.ports?.find(p => p.id === portId);
    if (!port?.pinGroups?.[0]) return;
    const pg = port.pinGroups[0];
    [['i2c_scl', 'scl'], ['i2c_sda', 'sda'], ['scl', 'scl'], ['sda', 'sda']].forEach(([role, key]) => {
      const row = tbody?.querySelector(`[data-role="${role}"]`);
      const sel = row?.querySelector('select');
      if (sel && pg[key] !== undefined) sel.value = String(pg[key]);
    });
  };

  // Helper: show/hide mclk pin row when clk = 0
  const applyMclkVisibility = (val) => {
    const hide = String(val).trim() === '0';
    const tbody = form.querySelector('#periPinTbody');
    const row = tbody?.querySelector('[data-role="mclk"]');
    if (row) row.style.display = hide ? 'none' : '';
  };

  // Helper: show d0..d(N-1), hide dN..d17 based on data bits width
  const applyDataBitsVisibility = (dataBits) => {
    const n = parseInt(dataBits) || 18;
    for (let i = 0; i <= 17; i++) {
      const row = form.querySelector(`[data-role="d${i}"]`);
      if (row) row.style.display = i < n ? '' : 'none';
    }
  };

  // Helper: motor PWM channel select → auto-fill GPIO pin for SPI+PWM printer
  const applyMotorPins = (extraSection) => {
    const tbody = form.querySelector('#periPinTbody');
    const map = { motorA1: 'motor_a1', motorA2: 'motor_a2', motorB1: 'motor_b1', motorB2: 'motor_b2' };
    Object.entries(map).forEach(([timingKey, pinRole]) => {
      const sel = (extraSection || form).querySelector(`[data-timing-key="${timingKey}"]`);
      if (!sel) return;
      const update = (val) => {
        const chId = parseInt(val);
        if (isNaN(chId)) return;
        const ch = platformPeripherals?.pwm?.spec?.channels?.find(c => c.id === chId);
        if (ch?.pin === undefined) return;
        const pinSel = tbody?.querySelector(`[data-role="${pinRole}"]`)?.querySelector('select');
        if (pinSel) pinSel.value = String(ch.pin);
      };
      sel.addEventListener('change', () => update(sel.value));
      update(sel.value);
    });
  };

  // Helper: pixel LED PWM channel select → auto-fill cold/warm GPIO pin for SPI+PWM led-pixel
  const applyPixelPwmPins = (extraSection) => {
    const tbody = form.querySelector('#periPinTbody');
    const map = { pwmCh0: 'cold', pwmCh1: 'warm' };
    Object.entries(map).forEach(([timingKey, pinRole]) => {
      const sel = (extraSection || form).querySelector(`[data-timing-key="${timingKey}"]`);
      if (!sel) return;
      const update = (val) => {
        const chId = parseInt(val);
        if (isNaN(chId)) return;
        const ch = platformPeripherals?.pwm?.spec?.channels?.find(c => c.id === chId);
        if (ch?.pin === undefined) return;
        const pinSel = tbody?.querySelector(`[data-role="${pinRole}"]`)?.querySelector('select');
        if (pinSel) pinSel.value = String(ch.pin);
      };
      sel.addEventListener('change', () => update(sel.value));
      update(sel.value);
    });
  };

  // Interface change → re-render pin rows + toggle model/decoder visibility
  const ifaceSelect = form.querySelector('#periIfaceSelect');
  if (ifaceSelect && template) {
    ifaceSelect.addEventListener('change', () => {
      const newIface = ifaceSelect.value;
      const type = form.querySelector('[name="type"]').value;
      const tbody = form.querySelector('#periPinTbody');
      // Toggle model field visibility
      const modelRow = form.querySelector('#periModelRow');
      if (modelRow && template.hideModelForInterface) {
        modelRow.style.display = template.hideModelForInterface.includes(newIface) ? 'none' : '';
      }
      // Refresh model select options when interface-specific suggestions exist
      if (template.modelSuggestionsByInterface) {
        const newSuggestions = template.modelSuggestionsByInterface[newIface] || [];
        const modelSel = form.querySelector('#periModelSelect');
        if (modelSel) {
          modelSel.innerHTML = newSuggestions.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
        }
      }
      // Refresh pixel format options when interface-specific formats exist
      if (template.pixelFormatByInterface || template.fields?.includes('pixelFormat')) {
        const allPfOptions = ['RGB565', 'RGB888', 'MONOCHROME', 'GRAYSCALE2'];
        const newPfOptions = getPlatformPixelFormats(newIface)
          ?? template.pixelFormatByInterface?.[newIface]
          ?? allPfOptions;
        const pfSel = form.querySelector('#periPixelFormatSelect');
        if (pfSel) {
          pfSel.innerHTML = newPfOptions.map(pf => `<option value="${esc(pf)}">${esc(pf)}</option>`).join('');
        }
      }
      // Toggle audio decoder row
      const decoderRow = form.querySelector('#periAudioDecoderRow');
      if (decoderRow) {
        decoderRow.style.display = newIface === 'INTERNAL' ? 'none' : '';
      }
      const decoderVal = (template.audioDecoder && newIface !== 'INTERNAL')
        ? (form.querySelector('#periAudioDecoderSelect')?.value || 'NONE')
        : null;
      tbody.innerHTML = buildPinRows(type, newIface, template, {}, decoderVal, form.querySelector('#periPixelFormatSelect')?.value);
      applySyncModeVisibility(form.querySelector('[data-timing-key="syncMode"]')?.value || '');
      // Update port selector for new interface
      const existingPortRow = form.querySelector('#periPortRow');
      const newPortHtml = buildPortSelectorHtml(newIface, null);
      if (existingPortRow) {
        if (newPortHtml) existingPortRow.outerHTML = newPortHtml;
        else existingPortRow.remove();
      } else if (newPortHtml) {
        form.querySelector('#periIfaceSelect')?.closest('.peri-field-row')?.insertAdjacentHTML('afterend', newPortHtml);
      }
      bindPortSelectEvents(form, template);
      // Show/hide interface extra fields section (e.g. RGB timing)
      if (template.interfaceExtraFields) {
        const extraSection = form.querySelector('#periIfaceExtraSection');
        const newExtra = template.interfaceExtraFields[newIface];
        if (extraSection) {
          extraSection.style.display = newExtra ? '' : 'none';
          const titleEl = extraSection.querySelector('#periIfaceExtraTitle');
          if (titleEl) titleEl.textContent = `${newIface} ${t('periIfaceConfig')}`;
          if (newExtra) {
            const grid = extraSection.querySelector('.peri-iface-extra-grid');
            if (grid) {
              grid.innerHTML = newExtra.map(f => {
                let input = '';
                if (f.type === 'select') {
                  const currentPf = form.querySelector('#periPixelFormatSelect')?.value || '';
                  const platOpts2 = (f.key === 'dataBits' && currentPf)
                    ? (getPlatformDataBitsForPixelFmt(currentPf) || f.options)
                    : (getPlatformFieldOptions(newIface, f.key) || f.options);
                  const isZh2 = i18n.getLanguage() === 'zh-CN';
                  const emptyOpt = f.allowEmpty ? `<option value="">${isZh2 ? '无' : 'None'}</option>` : '';
                  input = `<select class="peri-input" data-timing-key="${esc(f.key)}">${emptyOpt}${platOpts2.map(opt => {
                    const syncLabels = { VH: t('periRgbSyncVH'), DE: t('periRgbSyncDE'), 'VH+DE': t('periRgbSyncVHDE') };
                    const edgeLabels = { rising: t('periRgbEdgeRising'), falling: t('periRgbEdgeFalling') };
                    const activeLevelLabels2 = { high: t('periActiveLevelHigh'), low: t('periActiveLevelLow') };
                    const pwmChs2 = platformPeripherals?.pwm?.spec?.channels || [];
                    const pwmLabels2 = Object.fromEntries(pwmChs2.map(ch => [String(ch.id), `PWM${ch.id}`]));
                    const label = syncLabels[opt] ?? edgeLabels[opt] ?? activeLevelLabels2[opt] ?? pwmLabels2[opt] ?? opt;
                    return `<option value="${esc(opt)}">${esc(label)}</option>`;
                  }).join('')}</select>`;
                } else {
                  const range2 = getPlatformFieldRange(newIface, f.key) ?? (f.min !== undefined ? { min: f.min, max: f.max } : null);
                  const minA = range2?.min !== undefined ? ` min="${range2.min}"` : ' min="0"';
                  const maxA = range2?.max !== undefined ? ` max="${range2.max}"` : '';
                  const ph2 = range2 ? `${range2.min ?? 0}–${range2.max ?? ''}` : '—';
                  input = `<input type="number" class="peri-input" data-timing-key="${esc(f.key)}" value="" placeholder="${esc(ph2)}"${minA}${maxA}>`;
                }
                return `<div class="peri-field-row"><label>${esc(t(f.labelKey))}</label>${input}</div>`;
              }).join('');
            }
          }
          // Re-bind dataBits listener and apply initial visibility after grid rebuild
          const newDbSel = extraSection.querySelector('[data-timing-key="dataBits"]');
          if (newDbSel) {
            newDbSel.addEventListener('change', () => applyDataBitsVisibility(newDbSel.value));
            applyDataBitsVisibility(newDbSel.value);
          }
          // Re-bind i2cPort listener after grid rebuild
          const newI2cPortSel = extraSection.querySelector('[data-timing-key="i2cPort"]');
          if (newI2cPortSel) {
            newI2cPortSel.addEventListener('change', () => applyI2CPortPins(newI2cPortSel.value));
            applyI2CPortPins(newI2cPortSel.value);
          }
          // Re-bind clk/mclk visibility after grid rebuild
          const newClkInput = extraSection.querySelector('[data-timing-key="clk"]');
          if (newClkInput) {
            newClkInput.addEventListener('input', () => applyMclkVisibility(newClkInput.value));
            applyMclkVisibility(newClkInput.value);
          }
          // Re-bind motor PWM channel → GPIO after grid rebuild
          applyMotorPins(extraSection);
          applyPixelPwmPins(extraSection);
        }
      }
    });
  }

  // Audio decoder change → re-render decoder pin rows
  const audioDecoderSel = form.querySelector('#periAudioDecoderSelect');
  if (audioDecoderSel && template?.audioDecoder) {
    audioDecoderSel.addEventListener('change', () => {
      const decoderVal = audioDecoderSel.value;
      const tbody = form.querySelector('#periPinTbody');
      const type = form.querySelector('[name="type"]').value;
      const ifaceVal = form.querySelector('#periIfaceSelect')?.value || '';
      tbody.innerHTML = buildPinRows(type, ifaceVal, template, {}, decoderVal, form.querySelector('#periPixelFormatSelect')?.value);
      applySyncModeVisibility(form.querySelector('[data-timing-key="syncMode"]')?.value || '');
    });
  }

  // Sync mode change → show/hide hsync/vsync pin rows
  const syncModeSel = form.querySelector('[data-timing-key="syncMode"]');
  if (syncModeSel) {
    syncModeSel.addEventListener('change', () => applySyncModeVisibility(syncModeSel.value));
    applySyncModeVisibility(syncModeSel.value);
  }

  // Custom mode: add pin button
  form.querySelector('.peri-pin-add-btn')?.addEventListener('click', () => {
    const tbody = form.querySelector('#periPinTbody');
    const ifaceVal = form.querySelector('[name="interface"]')?.value || '';
    tbody.insertAdjacentHTML('beforeend', renderCustomPinRow(ifaceVal, '', '', ''));
    bindPinRemoveButtons(form);
  });

  // Kconfig: add row button
  form.querySelector('.peri-kconfig-add-btn')?.addEventListener('click', () => {
    const tbody = form.querySelector('#periKconfigTbody');
    tbody.insertAdjacentHTML('beforeend', renderKconfigRow('', ''));
    bindPinRemoveButtons(form);
  });

  bindPinRemoveButtons(form);
  bindPortSelectEvents(form, template);

  // Pixel format change → rebuild pin rows + update MCU8080 dataBits
  const pfSelect = form.querySelector('#periPixelFormatSelect');
  if (pfSelect) {
    pfSelect.addEventListener('change', () => {
      const ifaceVal = form.querySelector('#periIfaceSelect')?.value || '';
      const type = form.querySelector('[name="type"]').value;
      const tbody = form.querySelector('#periPinTbody');
      if (template?.pinGroupsByPixelFormat) {
        const decoderVal = template.audioDecoder ? (form.querySelector('#periAudioDecoderSelect')?.value || 'NONE') : null;
        tbody.innerHTML = buildPinRows(type, ifaceVal, template, {}, decoderVal, pfSelect.value);
        applySyncModeVisibility(form.querySelector('[data-timing-key="syncMode"]')?.value || '');
      }
      // MCU8080: update dataBits options from platform data
      if (ifaceVal === 'MCU8080') {
        const dbSel = form.querySelector('[data-timing-key="dataBits"]');
        if (dbSel) {
          const dbOptions = getPlatformDataBitsForPixelFmt(pfSelect.value) || ['8', '9', '16', '18', '24'];
          dbSel.innerHTML = dbOptions.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
          applyDataBitsVisibility(dbSel.value);
        }
      }
    });
  }

  // dataBits change → show/hide MCU8080 data pin rows
  const dataBitsSel = form.querySelector('[data-timing-key="dataBits"]');
  if (dataBitsSel) {
    dataBitsSel.addEventListener('change', () => applyDataBitsVisibility(dataBitsSel.value));
    applyDataBitsVisibility(dataBitsSel.value);
  }

  // i2cPort change → update i2c_scl/i2c_sda pins for DVP camera
  const i2cPortSel = form.querySelector('[data-timing-key="i2cPort"]');
  if (i2cPortSel) {
    i2cPortSel.addEventListener('change', () => applyI2CPortPins(i2cPortSel.value));
    applyI2CPortPins(i2cPortSel.value);
  }

  // clk input → show/hide mclk pin row for DVP camera
  const clkInput = form.querySelector('[data-timing-key="clk"]');
  if (clkInput && form.querySelector('[name="type"]')?.value === 'camera') {
    clkInput.addEventListener('input', () => applyMclkVisibility(clkInput.value));
    applyMclkVisibility(clkInput.value);
  }

  // Motor PWM channel → GPIO pin for SPI+PWM printer (initial bind)
  applyMotorPins(null);
  // Pixel LED PWM channel → cold/warm GPIO pin for SPI+PWM led-pixel (initial bind)
  applyPixelPwmPins(null);

  // Backlight mode change → show/hide bl pin row and PWM channel row
  const blModeSelect = form.querySelector('#periBlModeSelect');
  if (blModeSelect) {
    const updateBlVisibility = () => {
      const blMode = blModeSelect.value;
      const blPinRow = form.querySelector('[data-role="bl"]');
      const blGroupHeader = form.querySelector('[data-group="periPinGroupBacklight"]');
      const hideBlPin = blMode === 'NONE' || blMode === 'CUSTOM';
      if (blPinRow) blPinRow.style.display = hideBlPin ? 'none' : '';
      if (blGroupHeader) blGroupHeader.style.display = hideBlPin ? 'none' : '';
      const blPwmCfg = form.querySelector('#periBlPwmConfigSection');
      if (blPwmCfg) blPwmCfg.style.display = blMode === 'PWM' ? '' : 'none';
      // Leaving PWM mode releases the GPIO lock the PWM-channel binding applies.
      if (blMode !== 'PWM') {
        const blPinInput = form.querySelector('[data-role="bl"] .peri-pin-gpio');
        if (blPinInput) blPinInput.readOnly = false;
      }
    };
    blModeSelect.addEventListener('change', updateBlVisibility);
    updateBlVisibility();
    // Lock bl pin only in PWM mode with a channel selected; in GPIO/other modes
    // the channel select still defaults to "0" but must not lock the GPIO input.
    const initPwmSel = form.querySelector('#periBlPwmSelect');
    if (blModeSelect.value === 'PWM' && initPwmSel?.value !== '' && initPwmSel?.value !== undefined) {
      const blPinInput = form.querySelector('[data-role="bl"] .peri-pin-gpio');
      if (blPinInput) blPinInput.readOnly = true;
    }
  }

  // PWM channel change → auto-fill bl GPIO
  const blPwmSel = form.querySelector('#periBlPwmSelect');
  if (blPwmSel) {
    blPwmSel.addEventListener('change', () => {
      const channelId = blPwmSel.value !== '' ? parseInt(blPwmSel.value) : null;
      const blPinInput = form.querySelector('[data-role="bl"] .peri-pin-gpio');
      if (channelId !== null) {
        const pin = getPlatformPwmPinForChannel(channelId);
        if (pin !== null && blPinInput) {
          blPinInput.value = pin;
          blPinInput.readOnly = true;
        }
      } else if (blPinInput) {
        blPinInput.readOnly = false;
      }
    });
  }
}

function bindPortSelectEvents(form, template) {
  const portSel = form.querySelector('#periPortSelect');
  if (!portSel) return;

  const applyPortPins = () => {
    const portIdx = portSel.value;
    if (portIdx === '') return;
    const type = form.querySelector('[name="type"]').value;
    const ifaceVal = form.querySelector('#periIfaceSelect')?.value || '';
    const portPins = getPlatformPinsForPort(type, ifaceVal, portIdx);
    form.querySelectorAll('.peri-pin-row').forEach(tr => {
      const role = tr.dataset.role;
      const rowIface = tr.dataset.iface || ifaceVal;
      if (rowIface === ifaceVal && portPins[role] !== undefined) {
        const gpioInput = tr.querySelector('.peri-pin-gpio');
        if (gpioInput && !gpioInput.readOnly) gpioInput.value = portPins[role];
      }
    });
  };

  portSel.addEventListener('change', applyPortPins);
}

function bindPinRemoveButtons(form) {
  form.querySelectorAll('.peri-pin-remove-btn').forEach(btn => {
    btn.onclick = () => btn.closest('tr').remove();
  });
}

// ─── Save / Delete ───

function saveFromForm(form, origType, formIndex) {
  const type = form.querySelector('[name="type"]').value.trim();
  const nameEn = form.querySelector('[name="name_en"]').value.trim();
  const nameZh = form.querySelector('[name="name_zh"]').value.trim();
  const iface = form.querySelector('[name="interface"]')?.value?.trim() || '';
  const mounting = form.querySelector('[name="mounting"]').value;
  const pinLocked = form.querySelector('[name="pinLocked"]').checked;

  if (!type) { alert(t('periTypeRequired')); return; }
  if (!nameEn) { alert(t('periNameRequired')); return; }

  const template = PERIPHERAL_TEMPLATES[type] || null;

  let periId = form.querySelector('[name="periId"]')?.value.trim();
  if (!periId) {
    periId = generateUniqueId(type, origType, formIndex);
  }
  const item = { id: periId, name: { en: nameEn }, interface: iface || undefined, mounting, pinLocked };
  if (nameZh) item.name['zh-CN'] = nameZh;

  const portEl = form.querySelector('#periPortSelect');
  if (portEl?.value !== '' && portEl?.value !== undefined) item.port = parseInt(portEl.value);

  const hideModelIfaces = template?.hideModelForInterface || [];
  const model = !hideModelIfaces.includes(iface) ? form.querySelector('[name="model"]')?.value.trim() : null;
  if (model) item.model = model;

  const audioDecoder = (template?.audioDecoder && iface !== 'INTERNAL')
    ? (form.querySelector('[name="audioDecoder"]')?.value || null)
    : null;
  if (audioDecoder && audioDecoder !== 'NONE') item.decoder = audioDecoder;

  const resWidth = form.querySelector('[name="res_width"]')?.value.trim();
  const resHeight = form.querySelector('[name="res_height"]')?.value.trim();
  if (resWidth) item.width = parseInt(resWidth);
  if (resHeight) item.height = parseInt(resHeight);

  const pixelFormat = form.querySelector('[name="pixelFormat"]')?.value;
  if (pixelFormat) item.pixelFormat = pixelFormat;

  const backlight = form.querySelector('[name="backlight"]')?.value;
  if (backlight) item.backlight = backlight;

  const blPwmChannel = form.querySelector('#periBlPwmSelect')?.value;
  if (blPwmChannel !== undefined && blPwmChannel !== '') item.blPwmChannel = parseInt(blPwmChannel);

  const blPwmInputs = form.querySelectorAll('[data-blpwm-key]');
  if (blPwmInputs.length > 0 && item.backlight === 'PWM') {
    const blPwm = {};
    blPwmInputs.forEach(el => {
      const key = el.dataset.blpwmKey;
      const val = el.value.trim();
      if (val !== '') blPwm[key] = el.tagName === 'SELECT' ? val : (isNaN(Number(val)) ? val : Number(val));
    });
    if (Object.keys(blPwm).length > 0) item.blPwm = blPwm;
  }

  // Collect interface extra fields (timing etc.)
  const timingInputs = form.querySelectorAll('[data-timing-key]');
  if (timingInputs.length > 0) {
    const timing = {};
    timingInputs.forEach(el => {
      const key = el.dataset.timingKey;
      const val = el.value.trim();
      if (val !== '') timing[key] = el.tagName === 'SELECT' ? val : (isNaN(Number(val)) ? val : Number(val));
    });
    if (Object.keys(timing).length > 0) item.timing = timing;
  }

  const axes = form.querySelector('[name="axes"]')?.value;
  if (axes) item.axes = parseInt(axes);

  const touchXMax = form.querySelector('[name="touch_x_max"]')?.value.trim();
  const touchYMax = form.querySelector('[name="touch_y_max"]')?.value.trim();
  if (touchXMax !== '' && touchXMax !== undefined) item.xMax = parseInt(touchXMax);
  if (touchYMax !== '' && touchYMax !== undefined) item.yMax = parseInt(touchYMax);

  const mirrorX = form.querySelector('[name="mirror_x"]');
  const mirrorY = form.querySelector('[name="mirror_y"]');
  const swapXY = form.querySelector('[name="swap_xy"]');
  if (mirrorX) item.mirrorX = mirrorX.checked;
  if (mirrorY) item.mirrorY = mirrorY.checked;
  if (swapXY) item.swapXY = swapXY.checked;

  // Collect pins
  const pins = {};

  if (template) {
    // Template mode: rows are grouped by data-iface attribute (falls back to selected interface)
    const pinRows = form.querySelectorAll('.peri-pin-row');
    pinRows.forEach(tr => {
      const role = tr.dataset.role;
      const rowIface = tr.dataset.iface || iface;
      const gpioVal = tr.querySelector('.peri-pin-gpio')?.value.trim();
      const activeLevel = tr.querySelector('.peri-pin-active')?.value || '';
      if (role && gpioVal !== '' && gpioVal !== undefined) {
        if (!pins[rowIface]) pins[rowIface] = [];
        const gpio = /^\d+$/.test(gpioVal) ? parseInt(gpioVal) : gpioVal;
        const pinEntry = { role, gpio };
        if (activeLevel) pinEntry.activeLevel = activeLevel;
        pins[rowIface].push(pinEntry);
      }
    });
    // DVP camera: write null gpio for pins disabled by config
    if (type === 'camera' && iface === 'DVP') {
      const dvpPins = pins[iface] || (pins[iface] = []);
      const nullRole = (role) => {
        const idx = dvpPins.findIndex(p => p.role === role);
        if (idx >= 0) dvpPins.splice(idx, 1);
        dvpPins.push({ role, gpio: null });
      };
      if (!item.timing?.i2cPort) {
        nullRole('i2c_scl');
        nullRole('i2c_sda');
      }
      if (item.timing?.clk === 0) {
        nullRole('mclk');
      }
    }
    // MCU8080 display: null out data pins beyond dataBits width
    if (type === 'display' && iface === 'MCU8080') {
      const mcuPins = pins[iface] || (pins[iface] = []);
      const dataBits = parseInt(item.timing?.dataBits) || 18;
      for (let i = dataBits; i <= 17; i++) {
        const role = `d${i}`;
        const idx = mcuPins.findIndex(p => p.role === role);
        if (idx >= 0) mcuPins.splice(idx, 1);
        mcuPins.push({ role, gpio: null });
      }
    }
    // RGB display: null out hsync/vsync when syncMode is DE
    if (type === 'display' && iface === 'RGB' && item.timing?.syncMode === 'DE') {
      const rgbPins = pins[iface] || (pins[iface] = []);
      ['hsync', 'vsync'].forEach(role => {
        const idx = rgbPins.findIndex(p => p.role === role);
        if (idx >= 0) rgbPins.splice(idx, 1);
        rgbPins.push({ role, gpio: null });
      });
    }
  } else {
    // Custom mode
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
  }
  if (Object.keys(pins).length > 0) item.pins = pins;

  // Collect kconfig from key-value rows
  const kconfig = {};
  form.querySelectorAll('.peri-kconfig-row').forEach(tr => {
    const key = tr.querySelector('.peri-kconfig-key')?.value.trim();
    const val = tr.querySelector('.peri-kconfig-val')?.value.trim();
    if (key) {
      kconfig[key] = /^\d+$/.test(val) ? parseInt(val) : val;
    }
  });
  item.kconfig = Object.keys(kconfig).length > 0 ? kconfig : null;

  const noteEn = form.querySelector('[name="note_en"]')?.value.trim();
  const noteZh = form.querySelector('[name="note_zh"]')?.value.trim();
  if (noteEn || noteZh) {
    item.note = {};
    if (noteEn) item.note.en = noteEn;
    if (noteZh) item.note['zh-CN'] = noteZh;
  } else {
    item.note = null;
  }

  if (formIndex >= 0 && origType) {
    // Preserve group/role from original item
    const origItem = peripheralData[origType]?.[formIndex];
    if (origItem?.group) item.group = origItem.group;
    if (origItem?.role) item.role = origItem.role;

    if (origType === type) {
      peripheralData[origType][formIndex] = item;
    } else {
      if (peripheralData[origType]) {
        peripheralData[origType].splice(formIndex, 1);
        if (peripheralData[origType].length === 0) delete peripheralData[origType];
      }
      if (!peripheralData[type]) peripheralData[type] = [];
      peripheralData[type].push(item);
    }
  } else {
    if (!peripheralData[type]) peripheralData[type] = [];
    peripheralData[type].push(item);
  }

  dirty = true;
  closeModal();
  persistAndRender();
}

function deletePeripheral(type, index) {
  if (!peripheralData[type]) return;
  peripheralData[type].splice(index, 1);
  if (peripheralData[type].length === 0) delete peripheralData[type];
  dirty = true;
  persistAndRender();
}

async function persistAndRender() {
  try {
    await apiClient.updatePeripherals(currentBoardId, { peripheralPatterns: peripheralData, peripheralGroups });
    const resp = await apiClient.getPeripherals(currentBoardId);
    peripheralData = resp.peripheralPatterns || {};
    peripheralGroups = resp.peripheralGroups || {};
    dirty = false;
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
  renderList();
}

// ─── Group management modal ───

let groupModalEl = null;
let pendingGroups = new Set();

function ensureGroupModal() {
  if (groupModalEl) return;
  groupModalEl = document.createElement('div');
  groupModalEl.id = 'periGroupModal';
  groupModalEl.className = 'modal hidden';
  groupModalEl.style.zIndex = '1100';
  groupModalEl.innerHTML = `
    <div class="modal-content" style="max-width:580px; width:90%;">
      <div class="modal-header">
        <h2 id="periGroupModalTitle">${i18n.getLanguage() === 'zh-CN' ? '分组管理' : 'Manage Groups'}</h2>
        <button class="close-btn" id="periGroupModalClose">&times;</button>
      </div>
      <div class="modal-body" id="periGroupModalBody" style="max-height:70vh; overflow-y:auto;"></div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="periGroupModalDone">${i18n.getLanguage() === 'zh-CN' ? '完成' : 'Done'}</button>
      </div>
    </div>`;
  document.body.appendChild(groupModalEl);

  groupModalEl.querySelector('#periGroupModalClose').addEventListener('click', closeGroupModal);
  groupModalEl.querySelector('#periGroupModalDone').addEventListener('click', closeGroupModal);
  groupModalEl.addEventListener('click', (e) => {
    if (e.target === groupModalEl) closeGroupModal();
  });
}

function openGroupModal() {
  ensureGroupModal();
  pendingGroups = new Set();
  groupModalEl.querySelector('#periGroupModalBody').innerHTML = buildGroupManagementHtml();
  groupModalEl.classList.remove('hidden');
  bindGroupModalEvents();
}

function closeGroupModal() {
  if (groupModalEl) groupModalEl.classList.add('hidden');
  persistAndRender();
}

function buildGroupManagementHtml() {
  const dataGroups = getExistingGroups();
  // Pending groups always at top, then remaining data groups not in pending
  const remainingDataGroups = dataGroups.filter(g => !pendingGroups.has(g));
  const allGroupNames = [...pendingGroups, ...remainingDataGroups];
  const allItems = flatItems();
  const isZh = i18n.getLanguage() === 'zh-CN';

  let html = `<div class="peri-group-mgmt">`;

  // New group creation - just a button
  html += `<div class="peri-group-mgmt-new">
    <button class="btn btn-sm btn-primary" id="periNewGroupBtn">${isZh ? '+ 创建分组' : '+ Create Group'}</button>
  </div>`;

  if (allGroupNames.length === 0 && allItems.length === 0) {
    html += `<p class="peri-group-mgmt-empty">${isZh ? '暂无外设，请先添加外设' : 'No peripherals yet. Add peripherals first.'}</p>`;
  }

  // Each group (data + pending)
  for (const groupId of allGroupNames) {
    const meta = peripheralGroups[groupId];
    const nameEn = meta?.name?.en || '';
    const nameZh = meta?.name?.['zh-CN'] || '';
    const members = allItems.filter(i => i.item.group === groupId);
    html += `<div class="peri-group-mgmt-section" data-group="${esc(groupId)}">
      <div class="peri-group-mgmt-header">
        <div class="peri-group-mgmt-name-inputs">
          <input type="text" class="peri-input peri-group-id-input" value="${esc(groupId)}" placeholder="ID (kebab-case)" data-group="${esc(groupId)}" style="flex:0.7;">
          <input type="text" class="peri-input peri-group-name-en" value="${esc(nameEn)}" placeholder="Name (EN)" data-group="${esc(groupId)}" style="flex:1;">
          <input type="text" class="peri-input peri-group-name-zh" value="${esc(nameZh)}" placeholder="名称 (中文)" data-group="${esc(groupId)}" style="flex:1;">
        </div>
        <button class="btn btn-sm btn-danger peri-group-delete-btn" data-group="${esc(groupId)}">${isZh ? '删除' : 'Delete'}</button>
      </div>
      <div class="peri-group-mgmt-members">`;
    for (const { type, index, item } of members) {
      const name = (isZh ? item.name?.['zh-CN'] || item.name?.en : item.name?.en || item.name?.['zh-CN']) || item.model || 'Unnamed';
      html += `<div class="peri-group-mgmt-member">
        <span><span class="peri-card-type-badge">${esc(type)}</span> ${esc(name)}</span>
        <div class="peri-group-mgmt-member-actions">
          <button class="btn btn-sm btn-outline peri-group-remove-btn" data-type="${esc(type)}" data-index="${index}">${isZh ? '移出' : 'Remove'}</button>
        </div>
      </div>`;
    }
    html += `</div>`;

    // Ungrouped items available to add to this group
    const ungrouped = allItems.filter(i => !i.item.group);
    if (ungrouped.length > 0) {
      html += `<div class="peri-group-mgmt-add">
        <select class="peri-input peri-group-add-select" data-group="${esc(groupId)}">
          <option value="">— ${isZh ? '添加成员...' : 'Add member...'} —</option>`;
      for (const { type, index, item } of ungrouped) {
        const name = (isZh ? item.name?.['zh-CN'] || item.name?.en : item.name?.en || item.name?.['zh-CN']) || item.model || 'Unnamed';
        html += `<option value="${esc(type)}:${index}">${esc(type)} · ${esc(name)}</option>`;
      }
      html += `</select></div>`;
    }

    // Kconfig section for group
    const groupKconfig = meta?.kconfig ? Object.entries(meta.kconfig) : [];
    html += `<div class="peri-group-kconfig" data-group="${esc(groupId)}">
      <div class="peri-group-kconfig-label">Kconfig</div>
      <table class="peri-pin-table peri-kconfig-table">
        <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
        <tbody class="peri-group-kconfig-tbody">`;
    for (const [k, v] of groupKconfig) {
      html += `<tr class="peri-kconfig-row">
        <td><input type="text" class="peri-kconfig-key" value="${esc(k)}" placeholder="CONFIG_SYMBOL"></td>
        <td><input type="text" class="peri-kconfig-val" value="${esc(String(v ?? ''))}" placeholder="value"></td>
        <td><button type="button" class="btn btn-sm peri-kconfig-del-btn">✕</button></td>
      </tr>`;
    }
    html += `</tbody></table>
      <button type="button" class="btn btn-sm btn-outline peri-group-kconfig-add" data-group="${esc(groupId)}">+ Kconfig</button>
    </div>`;

    html += `</div>`;
  }

  // Ungrouped peripherals section
  const ungrouped = allItems.filter(i => !i.item.group);
  if (ungrouped.length > 0 && allGroupNames.length > 0) {
    html += `<div class="peri-group-mgmt-section peri-group-mgmt-ungrouped">
      <div class="peri-group-mgmt-header">
        <span class="peri-group-mgmt-name" style="color:var(--color-muted);">${isZh ? '未分组' : 'Ungrouped'}</span>
      </div>
      <div class="peri-group-mgmt-members">`;
    for (const { type, index, item } of ungrouped) {
      const name = (isZh ? item.name?.['zh-CN'] || item.name?.en : item.name?.en || item.name?.['zh-CN']) || item.model || 'Unnamed';
      html += `<div class="peri-group-mgmt-member">
        <span><span class="peri-card-type-badge">${esc(type)}</span> ${esc(name)}</span>
      </div>`;
    }
    html += `</div></div>`;
  }

  html += `</div>`;
  return html;
}

function bindGroupModalEvents() {
  const body = groupModalEl.querySelector('#periGroupModalBody');

  // Create new group
  body.querySelector('#periNewGroupBtn')?.addEventListener('click', () => {
    // Generate a temporary unique ID
    const tempId = `group-${Date.now().toString(36)}`;
    peripheralGroups[tempId] = { name: { en: '', 'zh-CN': '' } };
    pendingGroups.add(tempId);
    dirty = true;
    groupModalEl.querySelector('#periGroupModalBody').innerHTML = buildGroupManagementHtml();
    bindGroupModalEvents();
    // Focus the ID input of the new group
    const newIdInput = groupModalEl.querySelector(`.peri-group-id-input[data-group="${tempId}"]`);
    if (newIdInput) newIdInput.focus();
  });

  // Delete group (ungroup all members)
  body.querySelectorAll('.peri-group-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const groupName = btn.dataset.group;
      pendingGroups.delete(groupName);
      delete peripheralGroups[groupName];
      for (const [type, arr] of Object.entries(peripheralData)) {
        if (!Array.isArray(arr)) continue;
        for (const item of arr) {
          if (item.group === groupName) {
            delete item.group;
            delete item.role;
          }
        }
      }
      dirty = true;
      groupModalEl.querySelector('#periGroupModalBody').innerHTML = buildGroupManagementHtml();
      bindGroupModalEvents();
    });
  });

  // Remove member from group
  body.querySelectorAll('.peri-group-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const index = parseInt(btn.dataset.index);
      if (peripheralData[type]?.[index]) {
        delete peripheralData[type][index].group;
        delete peripheralData[type][index].role;
        dirty = true;
      }
      groupModalEl.querySelector('#periGroupModalBody').innerHTML = buildGroupManagementHtml();
      bindGroupModalEvents();
    });
  });

  // Add member to group via select
  body.querySelectorAll('.peri-group-add-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const groupName = sel.dataset.group;
      const val = sel.value;
      if (!val) return;
      const [type, idx] = val.split(':');
      const index = parseInt(idx);
      if (peripheralData[type]?.[index]) {
        peripheralData[type][index].group = groupName;
        dirty = true;
      }
      groupModalEl.querySelector('#periGroupModalBody').innerHTML = buildGroupManagementHtml();
      bindGroupModalEvents();
    });
  });

  // Group name change
  body.querySelectorAll('.peri-group-name-en').forEach(input => {
    input.addEventListener('change', () => {
      const groupId = input.dataset.group;
      if (!peripheralGroups[groupId]) peripheralGroups[groupId] = { name: {} };
      peripheralGroups[groupId].name.en = input.value.trim();
      dirty = true;
    });
  });
  body.querySelectorAll('.peri-group-name-zh').forEach(input => {
    input.addEventListener('change', () => {
      const groupId = input.dataset.group;
      if (!peripheralGroups[groupId]) peripheralGroups[groupId] = { name: {} };
      const val = input.value.trim();
      if (val) {
        peripheralGroups[groupId].name['zh-CN'] = val;
      } else {
        delete peripheralGroups[groupId].name['zh-CN'];
      }
      dirty = true;
    });
  });

  // Group ID change (rename)
  body.querySelectorAll('.peri-group-id-input').forEach(input => {
    input.addEventListener('change', () => {
      const oldId = input.dataset.group;
      const newId = input.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!newId || newId === oldId) { input.value = oldId; return; }
      // Rename in peripheralGroups
      peripheralGroups[newId] = peripheralGroups[oldId] || { name: {} };
      delete peripheralGroups[oldId];
      // Rename in pendingGroups
      if (pendingGroups.has(oldId)) {
        pendingGroups.delete(oldId);
        pendingGroups.add(newId);
      }
      // Update all peripheral references
      for (const arr of Object.values(peripheralData)) {
        if (!Array.isArray(arr)) continue;
        for (const item of arr) {
          if (item.group === oldId) item.group = newId;
        }
      }
      dirty = true;
      groupModalEl.querySelector('#periGroupModalBody').innerHTML = buildGroupManagementHtml();
      bindGroupModalEvents();
    });
  });

  // Group kconfig: add row
  body.querySelectorAll('.peri-group-kconfig-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const tbody = btn.closest('.peri-group-kconfig').querySelector('.peri-group-kconfig-tbody');
      const row = document.createElement('tr');
      row.className = 'peri-kconfig-row';
      row.innerHTML = `<td><input type="text" class="peri-kconfig-key" placeholder="CONFIG_SYMBOL"></td>
        <td><input type="text" class="peri-kconfig-val" placeholder="value"></td>
        <td><button type="button" class="btn btn-sm peri-kconfig-del-btn">✕</button></td>`;
      tbody.appendChild(row);
      row.querySelector('.peri-kconfig-key').focus();
    });
  });

  // Group kconfig: delete row and update
  body.addEventListener('click', (e) => {
    if (!e.target.classList.contains('peri-kconfig-del-btn')) return;
    const section = e.target.closest('.peri-group-kconfig');
    if (!section) return;
    e.target.closest('tr').remove();
    syncGroupKconfig(section);
    dirty = true;
  });

  // Group kconfig: key/value change → sync to peripheralGroups
  body.querySelectorAll('.peri-group-kconfig').forEach(section => {
    section.addEventListener('change', (e) => {
      if (e.target.classList.contains('peri-kconfig-key') || e.target.classList.contains('peri-kconfig-val')) {
        syncGroupKconfig(section);
        dirty = true;
      }
    });
  });
}

function syncGroupKconfig(kconfigSection) {
  const groupId = kconfigSection.dataset.group;
  if (!peripheralGroups[groupId]) peripheralGroups[groupId] = { name: {} };
  const kconfig = {};
  kconfigSection.querySelectorAll('.peri-kconfig-row').forEach(row => {
    const key = row.querySelector('.peri-kconfig-key')?.value.trim();
    const val = row.querySelector('.peri-kconfig-val')?.value.trim();
    if (key) kconfig[key] = /^\d+$/.test(val) ? parseInt(val) : val;
  });
  peripheralGroups[groupId].kconfig = Object.keys(kconfig).length > 0 ? kconfig : null;
}
