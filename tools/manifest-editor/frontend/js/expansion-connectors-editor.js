import { apiClient } from './api-client.js';
import i18n, { t } from './i18n.js';
import PERIPHERAL_TEMPLATES from './peripheral-templates.data.js';

// Expansion connectors (接插件): hard-wired sockets with a fixed pinout and no
// device fitted. One physical connector may expose several interfaces via
// provides[] (e.g. J1 = RGB display + I2C touch on one 40-pin header).

let currentBoardId = null;
let connectors = [];
let expanderIds = [];   // io-expander instance ids on this board (for the datalist)
let modalEl = null;

function esc(str) {
  if (!str) return '';
  const el = document.createElement('span');
  el.textContent = String(str);
  return el.innerHTML.replace(/"/g, '&quot;');
}

function localName(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return (i18n.getLanguage() === 'zh-CN' ? obj['zh-CN'] || obj.en : obj.en || obj['zh-CN']) || '';
}

/** Device classes offered for a connector = peripheral template keys. */
function deviceClassKeys() {
  return Object.keys(PERIPHERAL_TEMPLATES);
}

function interfacesFor(deviceClass) {
  return PERIPHERAL_TEMPLATES[deviceClass]?.interfaces || [];
}

function rolesFor(deviceClass, iface) {
  return PERIPHERAL_TEMPLATES[deviceClass]?.pins?.[iface] || [];
}

export async function renderExpansionConnectorsEditor(containerId, boardId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  currentBoardId = boardId;

  try {
    const [connResp, periResp] = await Promise.all([
      apiClient.getExpansionConnectors(boardId),
      apiClient.getPeripherals(boardId).catch(() => ({ peripheralPatterns: {} })),
    ]);
    connectors = connResp.expansionConnectors || [];
    expanderIds = collectExpanderIds(periResp.peripheralPatterns || {});
  } catch {
    connectors = [];
    expanderIds = [];
  }

  container.innerHTML = '<div class="conn-editor" id="connEditorRoot"></div>';
  renderList();
}

function collectExpanderIds(peripheralPatterns) {
  const ids = [];
  for (const [cat, arr] of Object.entries(peripheralPatterns)) {
    if (!Array.isArray(arr)) continue;
    for (const it of arr) {
      if ((cat === 'io-expander' || Array.isArray(it.expanderPins)) && it.id) ids.push(it.id);
    }
  }
  return [...new Set(ids)];
}

function renderList() {
  const root = document.getElementById('connEditorRoot');
  if (!root) return;
  const isZh = i18n.getLanguage() === 'zh-CN';

  let html = `<div class="conn-header">
    <span class="conn-count">${connectors.length} ${isZh ? '个接插件' : 'connector' + (connectors.length !== 1 ? 's' : '')}</span>
    <button class="btn btn-sm btn-primary" id="connAddBtn">+ ${isZh ? '接插件' : 'Connector'}</button>
  </div>`;

  if (connectors.length === 0) {
    html += `<div class="conn-empty">${isZh ? '暂无扩展接插件。接插件是板上焊死、针脚固定、未接器件的接口（如 RGB 屏排针、摄像头排针）。' : 'No expansion connectors yet. A connector is a hard-wired socket with fixed pins and no device fitted (e.g. an RGB LCD header, a camera header).'}</div>`;
  }

  for (const conn of connectors) {
    const name = localName(conn.name) || conn.id || 'connector';
    const provs = (conn.provides || []).map(p => {
      const n = (p.pins?.[p.interface] || []).length;
      return `<span class="conn-prov"><span class="conn-prov-class">${esc(p.deviceClass)}</span> · ${esc(p.interface || '—')} · ${n} ${isZh ? '脚' : 'pins'}</span>`;
    }).join('');
    html += `<div class="conn-card" data-id="${esc(conn.id)}">
      <div class="conn-card-head">
        <span class="conn-card-name">${esc(name)}</span>
        <span class="conn-card-id">${esc(conn.id || '')}</span>
        <span class="conn-card-actions">
          <button class="btn btn-sm btn-outline conn-edit" data-id="${esc(conn.id)}">${isZh ? '编辑' : 'Edit'}</button>
          <button class="btn btn-sm btn-danger conn-del" data-id="${esc(conn.id)}">×</button>
        </span>
      </div>
      <div class="conn-card-provs">${provs}</div>
    </div>`;
  }

  root.innerHTML = html;
  root.querySelector('#connAddBtn')?.addEventListener('click', () => openModal(null));
  root.querySelectorAll('.conn-edit').forEach(b => b.addEventListener('click', () => openModal(b.dataset.id)));
  root.querySelectorAll('.conn-del').forEach(b => b.addEventListener('click', () => removeConnector(b.dataset.id)));
}

// ─── Modal ───

function ensureModal() {
  if (modalEl) return;
  modalEl = document.createElement('div');
  modalEl.id = 'connModal';
  modalEl.className = 'modal hidden';
  modalEl.style.zIndex = '1100';
  modalEl.innerHTML = `
    <div class="modal-content" style="max-width:720px; width:94%;">
      <div class="modal-header">
        <h2 id="connModalTitle"></h2>
        <button class="close-btn" id="connModalClose">&times;</button>
      </div>
      <div class="modal-body" id="connModalBody" style="max-height:72vh; overflow-y:auto;"></div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="connModalCancel">${esc(t('periCancel'))}</button>
        <button class="btn btn-primary" id="connModalSave">${esc(t('periSave'))}</button>
      </div>
    </div>`;
  document.body.appendChild(modalEl);
  modalEl.querySelector('#connModalClose').addEventListener('click', closeModal);
  modalEl.querySelector('#connModalCancel').addEventListener('click', closeModal);
}

function closeModal() { if (modalEl) modalEl.classList.add('hidden'); }

function openModal(id) {
  ensureModal();
  const isZh = i18n.getLanguage() === 'zh-CN';
  const conn = id ? connectors.find(c => c.id === id) : null;
  modalEl.querySelector('#connModalTitle').textContent = conn ? (isZh ? '编辑接插件' : 'Edit Connector') : (isZh ? '新增接插件' : 'Add Connector');
  const body = modalEl.querySelector('#connModalBody');
  body.innerHTML = buildFormHtml(conn);
  refreshExpanderDatalist(body);
  // Render each existing provision's pin table.
  body.querySelectorAll('.conn-prov-block').forEach(block => rebuildPinTable(block));
  bindFormEvents(body);
  modalEl.classList.remove('hidden');
  modalEl.querySelector('#connModalSave').onclick = () => saveFromForm(body, id);
}

function buildFormHtml(conn) {
  const provides = conn?.provides?.length ? conn.provides : [{ deviceClass: deviceClassKeys()[0], interface: '', pins: {} }];
  let html = `
    <datalist id="connExpanderIdList"></datalist>
    <div class="peri-field-row"><label>ID</label>
      <input type="text" class="peri-input" name="conn_id" value="${esc(conn?.id || '')}" placeholder="e.g. j1-lcd-panel"></div>
    <div class="peri-field-row"><label>${esc(t('periNameEn'))}</label>
      <input type="text" class="peri-input" name="conn_name_en" value="${esc(conn?.name?.en || '')}"></div>
    <div class="peri-field-row"><label>${esc(t('periNameZh'))}</label>
      <input type="text" class="peri-input" name="conn_name_zh" value="${esc(conn?.name?.['zh-CN'] || '')}"></div>
    <div class="conn-provs-section">
      <div class="conn-section-head">
        <span class="conn-section-label">${i18n.getLanguage() === 'zh-CN' ? '引出的接口' : 'Interfaces'}</span>
        <span class="conn-section-hint">${i18n.getLanguage() === 'zh-CN' ? '一路功能一项（如 RGB 显示、I2C 触摸）' : 'one per function it carries (e.g. RGB display, I2C touch)'}</span>
      </div>
      <div id="connProvsList">`;
  provides.forEach((p, i) => { html += buildProvisionHtml(p, i); });
  html += `</div>
      <button type="button" class="btn btn-sm btn-outline" id="connAddProvBtn">+ ${i18n.getLanguage() === 'zh-CN' ? '功能' : 'Function'}</button>
    </div>
    <div class="peri-field-row"><label>${esc(t('periNoteEn'))}</label>
      <input type="text" class="peri-input" name="conn_note_en" value="${esc(conn?.note?.en || '')}"></div>
    <div class="peri-field-row"><label>${esc(t('periNoteZh'))}</label>
      <input type="text" class="peri-input" name="conn_note_zh" value="${esc(conn?.note?.['zh-CN'] || '')}"></div>`;
  return html;
}

function buildProvisionHtml(prov, index) {
  const isZh = i18n.getLanguage() === 'zh-CN';
  const dc = prov.deviceClass || deviceClassKeys()[0];
  const ifaces = interfacesFor(dc);
  const iface = prov.interface || ifaces[0] || '';
  // Stash the existing pins as JSON so rebuildPinTable can pre-fill after a re-render.
  const existing = esc(JSON.stringify(prov.pins?.[iface] || []));
  let dcOpts = deviceClassKeys().map(k => `<option value="${esc(k)}" ${k === dc ? 'selected' : ''}>${esc(k)}</option>`).join('');
  let ifOpts = ifaces.map(f => `<option value="${esc(f)}" ${f === iface ? 'selected' : ''}>${esc(f)}</option>`).join('');
  return `<div class="conn-prov-block" data-existing="${existing}">
    <div class="conn-prov-head">
      <label>${isZh ? '接入器件' : 'Attach'}</label>
      <select class="peri-input conn-prov-class" style="width:auto">${dcOpts}</select>
      <label>${isZh ? '接口' : 'Interface'}</label>
      <select class="peri-input conn-prov-iface" style="width:auto">${ifOpts}</select>
      <button type="button" class="btn btn-sm btn-danger conn-prov-remove" title="Remove">×</button>
    </div>
    <table class="peri-pin-table">
      <thead><tr><th>Role</th><th>GPIO / ${esc(t('periPinSrcExpander'))}</th></tr></thead>
      <tbody class="conn-prov-tbody"></tbody>
    </table>
  </div>`;
}

/** (Re)build the pin-role rows of one provision block from its deviceClass+interface. */
function rebuildPinTable(block) {
  const dc = block.querySelector('.conn-prov-class').value;
  const iface = block.querySelector('.conn-prov-iface').value;
  const tbody = block.querySelector('.conn-prov-tbody');
  let existing = [];
  try { existing = JSON.parse(block.dataset.existing || '[]'); } catch { existing = [] }
  const byRole = {};
  for (const p of existing) byRole[p.role] = p;
  tbody.innerHTML = rolesFor(dc, iface).map(role => pinRowHtml(role, byRole[role])).join('');
}

function pinRowHtml(role, entry) {
  const isExp = !!entry && entry.expanderPin !== undefined && entry.expanderPin !== null;
  const gpioVal = entry && typeof entry.gpio === 'number' ? entry.gpio : '';
  const expId = isExp ? esc(entry.expanderId || '') : '';
  const expPin = isExp ? entry.expanderPin : '';
  return `<tr class="conn-pin-row" data-role="${esc(role)}">
    <td><code class="peri-pin-role-label">${esc(role)}</code></td>
    <td class="peri-pin-src-cell">
      <select class="peri-pin-src">
        <option value="mcu" ${!isExp ? 'selected' : ''}>MCU</option>
        <option value="exp" ${isExp ? 'selected' : ''}>${esc(t('periPinSrcExpander'))}</option>
      </select>
      <input type="number" class="peri-pin-gpio" value="${gpioVal}" placeholder="—" min="0" style="${isExp ? 'display:none;' : ''}">
      <span class="peri-pin-exp-fields" style="${isExp ? '' : 'display:none;'}">
        <input type="text" class="peri-pin-exp-id" value="${expId}" placeholder="${esc(t('periPinExpId'))}" list="connExpanderIdList" style="width:130px;">
        <input type="number" class="peri-pin-exp-pin" value="${expPin}" placeholder="#" min="0" style="width:52px;">
      </span>
    </td>
  </tr>`;
}

function refreshExpanderDatalist(body) {
  const dl = body.querySelector('#connExpanderIdList');
  if (dl) dl.innerHTML = expanderIds.map(id => `<option value="${esc(id)}">`).join('');
}

function bindFormEvents(body) {
  body.querySelector('#connAddProvBtn')?.addEventListener('click', () => {
    const list = body.querySelector('#connProvsList');
    const idx = list.querySelectorAll('.conn-prov-block').length;
    list.insertAdjacentHTML('beforeend', buildProvisionHtml({ deviceClass: deviceClassKeys()[0], interface: '', pins: {} }, idx));
    rebuildPinTable(list.lastElementChild);
  });

  // Delegated handlers for provision blocks (class/iface change, remove, pin-source toggle).
  body.querySelector('#connProvsList')?.addEventListener('change', (e) => {
    const block = e.target.closest('.conn-prov-block');
    if (!block) return;
    if (e.target.classList.contains('conn-prov-class')) {
      // deviceClass changed → refresh interface options, then pin table.
      const dc = e.target.value;
      const ifSel = block.querySelector('.conn-prov-iface');
      ifSel.innerHTML = interfacesFor(dc).map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('');
      block.dataset.existing = '[]';
      rebuildPinTable(block);
    } else if (e.target.classList.contains('conn-prov-iface')) {
      block.dataset.existing = '[]';
      rebuildPinTable(block);
    } else if (e.target.classList.contains('peri-pin-src')) {
      const row = e.target.closest('.conn-pin-row');
      const isExp = e.target.value === 'exp';
      row.querySelector('.peri-pin-gpio').style.display = isExp ? 'none' : '';
      row.querySelector('.peri-pin-exp-fields').style.display = isExp ? '' : 'none';
    }
  });

  body.querySelector('#connProvsList')?.addEventListener('click', (e) => {
    const rm = e.target.closest('.conn-prov-remove');
    if (!rm) return;
    const blocks = body.querySelectorAll('.conn-prov-block');
    if (blocks.length <= 1) { alert(i18n.getLanguage() === 'zh-CN' ? '至少保留一个功能' : 'Keep at least one function'); return; }
    rm.closest('.conn-prov-block').remove();
  });
}

function saveFromForm(body, originalId) {
  const id = body.querySelector('[name="conn_id"]').value.trim();
  const nameEn = body.querySelector('[name="conn_name_en"]').value.trim();
  const nameZh = body.querySelector('[name="conn_name_zh"]').value.trim();
  if (!id) { alert(i18n.getLanguage() === 'zh-CN' ? '请填写 ID' : 'ID is required'); return; }
  if (!nameEn) { alert(t('periNameRequired')); return; }

  const provides = [];
  const expIncomplete = [];
  for (const block of body.querySelectorAll('.conn-prov-block')) {
    const deviceClass = block.querySelector('.conn-prov-class').value;
    const iface = block.querySelector('.conn-prov-iface').value;
    const pins = [];
    for (const row of block.querySelectorAll('.conn-pin-row')) {
      const role = row.dataset.role;
      const src = row.querySelector('.peri-pin-src').value;
      if (src === 'exp') {
        const eid = row.querySelector('.peri-pin-exp-id').value.trim();
        const ep = row.querySelector('.peri-pin-exp-pin').value.trim();
        if (!eid && ep === '') continue;
        if (!eid || ep === '' || !/^\d+$/.test(ep)) { expIncomplete.push(`${deviceClass}.${role}`); continue; }
        pins.push({ role, expanderId: eid, expanderPin: parseInt(ep) });
      } else {
        const g = row.querySelector('.peri-pin-gpio').value.trim();
        if (g === '' || !/^\d+$/.test(g)) continue;
        pins.push({ role, gpio: parseInt(g) });
      }
    }
    const prov = { deviceClass, interface: iface || undefined };
    if (pins.length) prov.pins = { [iface]: pins };
    provides.push(prov);
  }
  if (expIncomplete.length) { alert(t('periPinExpIncomplete').replace('%s', expIncomplete.join(', '))); return; }

  const conn = { id, name: { en: nameEn }, provides };
  if (nameZh) conn.name['zh-CN'] = nameZh;
  const noteEn = body.querySelector('[name="conn_note_en"]').value.trim();
  const noteZh = body.querySelector('[name="conn_note_zh"]').value.trim();
  if (noteEn || noteZh) { conn.note = {}; if (noteEn) conn.note.en = noteEn; if (noteZh) conn.note['zh-CN'] = noteZh; }

  const idx = originalId ? connectors.findIndex(c => c.id === originalId) : -1;
  if (idx >= 0) connectors[idx] = conn; else connectors.push(conn);
  closeModal();
  persist();
}

async function removeConnector(id) {
  connectors = connectors.filter(c => c.id !== id);
  await persist();
}

async function persist() {
  try {
    const resp = await apiClient.updateExpansionConnectors(currentBoardId, connectors);
    connectors = resp.expansionConnectors || connectors;
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
  renderList();
}
