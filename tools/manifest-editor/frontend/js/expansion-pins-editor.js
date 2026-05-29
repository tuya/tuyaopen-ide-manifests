import { apiClient } from './api-client.js';
import i18n, { t } from './i18n.js';

let currentBoardId = null;
let currentPlatformId = null;
let expansionPins = [];
let platformPinout = [];

function esc(str) {
  if (!str) return '';
  const el = document.createElement('span');
  el.textContent = String(str);
  return el.innerHTML;
}

export async function renderExpansionPinsEditor(containerId, boardId, platformId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  currentBoardId = boardId;
  currentPlatformId = platformId;

  try {
    const [pinsResp, pinoutResp] = await Promise.all([
      apiClient.getExpansionPins(boardId),
      apiClient.getPlatformPinout(platformId),
    ]);
    expansionPins = pinsResp.expansionPins || [];
    platformPinout = pinoutResp.pinout || [];
  } catch {
    expansionPins = [];
    platformPinout = [];
  }

  container.innerHTML = '<div class="exp-pins-editor" id="expPinsEditorRoot"></div>';
  renderList();
}

function getUsedGpios() {
  return new Set(expansionPins.map(p => p.gpio));
}

function getAvailableGpios() {
  const used = getUsedGpios();
  return platformPinout
    .filter(p => p.gpio !== null && !used.has(p.gpio))
    .sort((a, b) => a.gpio - b.gpio);
}

function renderList() {
  const root = document.getElementById('expPinsEditorRoot');
  if (!root) return;

  const isZh = i18n.getLanguage() === 'zh-CN';
  const available = getAvailableGpios();

  let html = `<div class="exp-pins-header">
    <span class="exp-pins-count">${expansionPins.length} ${isZh ? '个扩展引脚' : 'expansion pin' + (expansionPins.length !== 1 ? 's' : '')}</span>
  </div>`;

  if (expansionPins.length === 0) {
    html += `<div class="exp-pins-empty">${isZh ? '暂无扩展引脚，请从下方添加' : 'No expansion pins yet. Add from below.'}</div>`;
  } else {
    html += `<table class="exp-pins-table">
      <thead><tr>
        <th>GPIO</th>
        <th>${isZh ? '复用功能' : 'Functions'}</th>
        <th></th>
      </tr></thead><tbody>`;
    for (const pin of expansionPins) {
      const funcs = (pin.functions || []).join(' / ');
      html += `<tr class="exp-pins-row" data-gpio="${pin.gpio}">
        <td class="exp-pins-gpio">${pin.gpio}</td>
        <td class="exp-pins-funcs">${esc(funcs)}</td>
        <td><button class="btn btn-sm btn-danger exp-pins-remove" data-gpio="${pin.gpio}">×</button></td>
      </tr>`;
    }
    html += `</tbody></table>`;
  }

  // Add GPIO selector
  html += `<div class="exp-pins-add-section">
    <select id="expPinsGpioSelect" class="exp-pins-select">
      <option value="">${isZh ? '-- 选择 GPIO 添加 --' : '-- Select GPIO to add --'}</option>`;
  for (const p of available) {
    const label = `GPIO ${p.gpio} (${p.name}) — ${p.functions.slice(0, 3).join(', ')}${p.functions.length > 3 ? '...' : ''}`;
    html += `<option value="${p.gpio}">${esc(label)}</option>`;
  }
  html += `</select>
    <button class="btn btn-sm btn-primary" id="expPinsAddBtn">+ ${isZh ? '添加' : 'Add'}</button>
  </div>`;

  root.innerHTML = html;
  bindEvents(root);
}

function bindEvents(root) {
  root.querySelector('#expPinsAddBtn')?.addEventListener('click', () => {
    const select = root.querySelector('#expPinsGpioSelect');
    const gpio = parseInt(select?.value);
    if (isNaN(gpio)) return;
    addPin(gpio);
  });

  root.querySelectorAll('.exp-pins-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const gpio = parseInt(btn.dataset.gpio);
      removePin(gpio);
    });
  });
}

async function addPin(gpio) {
  const pinEntry = platformPinout.find(p => p.gpio === gpio);
  expansionPins.push({
    gpio,
    functions: pinEntry?.functions || [`GPIO${gpio}`],
  });
  expansionPins.sort((a, b) => a.gpio - b.gpio);
  await persist();
}

async function removePin(gpio) {
  expansionPins = expansionPins.filter(p => p.gpio !== gpio);
  await persist();
}

async function persist() {
  try {
    const gpios = expansionPins.map(p => p.gpio);
    const resp = await apiClient.updateExpansionPins(currentBoardId, gpios);
    expansionPins = resp.expansionPins || expansionPins;
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
  renderList();
}
