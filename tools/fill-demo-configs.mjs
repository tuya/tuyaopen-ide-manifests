#!/usr/bin/env node
// One-shot: fill demo detail `configs` (new board+accessory+options shape) from
// the real SDK config/*.config files. Only catalogue boards (9 t5ai) are filled;
// non-catalogue boards are skipped and reported.
//   node tools/fill-demo-configs.mjs            # dry-run report
//   node tools/fill-demo-configs.mjs --apply     # write detail files
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SDK = '/home/share/samba/TuyaOpen';
const DEMOS = path.join(ROOT, 'demos');

// catalogue boardSymbol -> board id (exact match for these 8; prefix for the board below)
const EXACT = {
  TUYA_T5AI_EVB: 'tuya-t5ai-evb',
  TUYA_T5AI_POCKET: 'tuya-t5ai-pocket',
  TUYA_T5AI_CORE: 'tuya-t5ai-core',
  T5AI_CORE: 'tuya-t5ai-core',           // alias
  TUYA_T5AI_PIXEL: 'tuya-t5ai-pixel',
  TUYA_T5AI_EINK_NFC: 'tuya-t5ai-eink-nfc',
  T5AI_MINI: 't5ai-mini',
  WAVESHARE_T5AI_TOUCH_AMOLED_1_75: 'waveshare-t5ai-touch-amoled-175',
  T5AI_MODULE: 'tuya-t5-e1',
};
const T5AI_BOARD_PREFIX = 'TUYA_T5AI_BOARD';
const T5AI_BOARD_ID = 'tuya-t5ai-board';

// tuya-t5ai-board accessory by remainder (after the board prefix)
function boardAccessory(rem) {
  if (rem === '') return '';                          // bare board
  if (/^_EYES_TWO_LCD/.test(rem)) return 'lcd-eyes-b';
  if (/^_EYES/.test(rem)) return 'lcd-eyes-a';
  if (/LCD_3\.5/.test(rem)) return 'group-mpxn93yq';  // 3.5" LCD (also CAMERA_LCD_3.5)
  if (/096_OLED|0\.96OLED/.test(rem)) return 'display-oled';
  return '';                                          // 29_E-INK etc. — no declared accessory
}
// option name for a tuya-t5ai-board 3.5-LCD variant (by remainder)
function lcdVariantName(rem) {
  if (/CAM_PRINTER/.test(rem)) return { en: '+ Camera + Printer', 'zh-CN': '带摄像头+打印机' };
  if (/CAMERA/.test(rem)) return { en: '+ Camera', 'zh-CN': '带摄像头' };
  if (/v101/i.test(rem)) return { en: 'V101', 'zh-CN': 'V101' };
  return { en: 'Basic', 'zh-CN': '基础' };
}

// Display names for option labels
const boardName = Object.fromEntries(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'boards-and-chips', 'index.json'), 'utf8'))
    .items.map(b => [b.id, b.name]));
const t5aiBoard = JSON.parse(fs.readFileSync(path.join(DEMOS, '..', 'boards-and-chips', 't5ai', 'tuya-t5ai-board.json'), 'utf8'));
const accName = {};
for (const [g, v] of Object.entries(t5aiBoard.peripheralGroups || {})) accName[g] = v.name;
for (const arr of Object.values(t5aiBoard.peripheralPatterns || {})) for (const p of (arr || [])) if (p.name) accName[p.id] = p.name;

// Human EN/zh name for one config option, by its board + accessory + symbol suffix.
function nameFor(symbol, boardId, accessory) {
  if (boardId === 'tuya-t5ai-board') {
    const rem = symbol.slice(T5AI_BOARD_PREFIX.length);
    if (accessory === 'group-mpxn93yq') {
      if (/CAM_PRINTER/.test(rem)) return { en: '3.5" LCD + Camera + Printer', 'zh-CN': '3.5寸 LCD + 摄像头 + 打印机' };
      if (/CAMERA/.test(rem)) return { en: '3.5" LCD + Camera', 'zh-CN': '3.5寸 LCD + 摄像头' };
      if (/v101/i.test(rem)) return { en: '3.5" LCD (V101)', 'zh-CN': '3.5寸 LCD（V101）' };
      return { en: '3.5" LCD', 'zh-CN': '3.5寸 LCD 触摸屏' };
    }
    if (accessory && accName[accessory]) return accName[accessory];
    if (/29_E-INK/.test(rem)) return { en: '2.9" E-Ink', 'zh-CN': '2.9 寸墨水屏' };
  }
  return boardName[boardId] || { en: boardId, 'zh-CN': boardId };
}

function resolve(symbol) {
  // returns {board, accessory, name?} or null (skip)
  if (symbol === T5AI_BOARD_PREFIX || symbol.startsWith(T5AI_BOARD_PREFIX + '_')) {
    const rem = symbol.slice(T5AI_BOARD_PREFIX.length);
    const accessory = boardAccessory(rem);
    let name;
    if (accessory === 'group-mpxn93yq') name = lcdVariantName(rem);
    else if (rem === '_29_E-INK') name = { en: '2.9" E-Ink', 'zh-CN': '2.9 寸墨水屏' };
    return { board: T5AI_BOARD_ID, accessory, name };
  }
  if (EXACT[symbol]) return { board: EXACT[symbol], accessory: '' };
  return null; // non-catalogue
}

const index = JSON.parse(fs.readFileSync(path.join(DEMOS, 'index.json'), 'utf8'));
const report = [];
let filledDemos = 0, totalTargets = 0, skippedFiles = [];

for (const item of index.items) {
  const sub = item.source?.subpath;
  if (!sub) continue;
  let files = [];
  try { files = fs.readdirSync(path.join(SDK, sub, 'config')).filter(f => f.endsWith('.config')); } catch { continue; }
  if (!files.length) continue;

  const groups = new Map(); // key board||accessory -> {board, accessory, options:[]}
  const skipped = [];
  for (const f of files) {
    const symbol = f.replace(/\.config$/, '');
    const r = resolve(symbol);
    if (!r) { skipped.push(f); skippedFiles.push(`${item.id}: ${f}`); continue; }
    const key = r.board + '||' + r.accessory;
    if (!groups.has(key)) groups.set(key, { board: r.board, accessory: r.accessory, options: [] });
    groups.get(key).options.push({ file: f, name: nameFor(symbol, r.board, r.accessory) });
  }

  const targets = [...groups.values()].map(g => {
    const t = { board: g.board };
    if (g.accessory) t.accessory = g.accessory;
    t.options = g.options;
    return t;
  });

  report.push({ id: item.id, targets, skipped });
  if (targets.length) { filledDemos++; totalTargets += targets.length; }

  if (APPLY) {
    const sub = item.type === 'app' ? 'app' : 'example';      // demos/<type>/<id>.json
    const dir = path.join(DEMOS, sub);
    fs.mkdirSync(dir, { recursive: true });
    const detailPath = path.join(dir, `${item.id}.json`);
    let detail = { id: item.id };
    try { detail = JSON.parse(fs.readFileSync(detailPath, 'utf8')); } catch {}
    if (targets.length) detail.configs = targets; else delete detail.configs;
    // keep id first, then defaultConfig, configs, documentation order
    const ordered = { id: detail.id };
    if (detail.defaultConfig && Object.keys(detail.defaultConfig).length) ordered.defaultConfig = detail.defaultConfig;
    if (detail.configs) ordered.configs = detail.configs;
    if (detail.documentation) ordered.documentation = detail.documentation;
    if (Object.keys(ordered).length > 1) fs.writeFileSync(detailPath, JSON.stringify(ordered, null, 2) + '\n');
    else { try { fs.unlinkSync(detailPath); } catch {} }
  }
}

// ---- report ----
console.log(APPLY ? 'APPLIED.\n' : 'DRY-RUN (no files written).\n');
for (const r of report) {
  const tgt = r.targets.map(t => `${t.board}${t.accessory ? '+' + t.accessory : ''}(${t.options.length})`).join(', ');
  console.log(`${r.id}`);
  console.log(`   targets: ${tgt || '(none)'}`);
  if (r.skipped.length) console.log(`   skipped: ${r.skipped.join(', ')}`);
}
console.log(`\n=== ${filledDemos} demos filled, ${totalTargets} targets total ===`);
console.log(`=== ${skippedFiles.length} skipped config files (non-catalogue boards) ===`);
