// Platform Editor module
//
// Flat per-variant model: each platform item IS a variant (chip) with its own
// id, a platformId for grouping (e.g. ESP32's chips all share platformId
// "esp32"), localized name/summary/image, and a detailUrl. The variant detail
// is a deep, heterogeneous hardware spec (connectivity, memory, every
// peripheral spec, pinmux, flash partitions, power, flash/debug guides,
// pinout) edited with a generic *structured* form (StructEditor) — every field
// is editable with correct types preserved and array add/remove.

import { apiClient } from './api-client.js';
import { escapeHtml, showNotification, showError, getLocalizedString } from './utils.js';
import i18n from './i18n.js';
import PERIPHERAL_SCHEMA from './platform-peripheral-schema.data.js';

// ---------------------------------------------------------------------------
// Generic structured-data editor
// ---------------------------------------------------------------------------

// Keys hidden from the generic editor (the backend re-stamps these; id is shown
// separately as a read-only field).
// These are edited as dedicated fields in the Platform Info tab (or no longer
// stored). The detail is split across dedicated areas: identity/memory/
// connectivity/power/flashAndDebug in the Platform Info tab, peripherals in the
// Peripheral tab, pinout in the Pinout tab — so no single "spec" editor remains.

const ARCH_OPTIONS = ['arm-cortex-m33', 'risc-v', 'xtensa-lx6', 'xtensa-lx7'];
const FLASH_INTERFACE_OPTIONS = ['qspi', 'spi'];
// Pin type (EE notation): digital I/O, input, output, power, analog in/out.
const PIN_TYPE_OPTIONS = ['I/O', 'I', 'O', 'P', 'AI', 'AO'];

let _dlSeq = 0; // unique <datalist> id counter

// Short display label for a HAL enum value (display only; the full value is
// still stored). Drops the leading `TUYA_<MODULE>_` / `TKL_<MODULE>_` namespace
// and a common sub-namespace token, so e.g. TUYA_GPIO_PUSH_PULL -> PUSH_PULL,
// TUYA_UART_DATA_LEN_8BIT -> 8BIT, TUYA_IIC_BUS_SPEED_400K -> 400K,
// TUYA_SPI_ROLE_MASTER -> MASTER. Values without that prefix are left as-is.
function prettyEnum(v) {
  return String(v)
    .replace(/^T(?:UYA|KL)_[A-Z0-9]+_/, '')
    .replace(/^(DATA_LEN_|STOP_LEN_|PARITY_TYPE_|FLOWCTRL_|BUS_SPEED_|ADDRESS_|SYNC_MODE_|MODE_|ROLE_|CNT_|ORDER_|TYPE_|OUTPUT_|DATA_IN_|FMT_|IRQ_|WAKEUP_|DATA_BIT)/, '');
}

// Natural sort: compare digit runs numerically so ADC2 < ADC10, D2 < D10, etc.
function naturalCompare(a, b) {
  const ax = String(a).match(/\d+|\D+/g) || [];
  const bx = String(b).match(/\d+|\D+/g) || [];
  for (let i = 0; i < Math.min(ax.length, bx.length); i++) {
    const an = ax[i], bn = bx[i];
    const aNum = /^\d+$/.test(an), bNum = /^\d+$/.test(bn);
    if (aNum && bNum) { const d = parseInt(an, 10) - parseInt(bn, 10); if (d) return d; }
    else if (an !== bn) return an < bn ? -1 : 1;
  }
  return ax.length - bx.length;
}

// Controlled vocabulary for a pinout row's "functions" combobox. The combobox is
// SELECTION-ONLY (no free text), so this list — merged with the tokens the
// platform already uses — IS the set of pickable functions. To allow a brand-new
// token, add it here (keeps function naming managed/consistent). Categorized by
// the combobox via COMBO_PREFIXES.
// Per the 2026-06-30 functions/caps split, `functions` is a SELECTION-ONLY controlled
// vocabulary of peripheral-BUS SIGNAL tokens (things you route a peripheral onto);
// pure pin ATTRIBUTES (RTC/LP domain, strapping, XTAL/clock, power rails, JTAG/SWD,
// dedicated flash bus, analog audio) live in the free-text `caps[]` instead and are
// intentionally NOT in this list.
const PINOUT_FUNC_SUGGEST = [
  // gpio — bare `GPIO` = matrix-routable candidate marker; GPIO{n} = pin identity
  'GPIO',
  ...Array.from({ length: 56 }, (_, i) => `GPIO${i}`),
  // uart (+ dedicated download uart)
  ...['0', '1', '2', '3', '4'].flatMap(n => [`UART${n}_TX`, `UART${n}_RX`, `UART${n}_CTS`, `UART${n}_RTS`]),
  'DL_UART_TX', 'DL_UART_RX',
  // i2c
  ...['0', '1', '2'].flatMap(n => [`I2C${n}_SCL`, `I2C${n}_SDA`]),
  // spi / qspi
  ...['0', '1', '2', '3'].flatMap(n => [`SPI${n}_SCK`, `SPI${n}_CSN`, `SPI${n}_MOSI`, `SPI${n}_MISO`]),
  ...['0', '1'].flatMap(n => [`QSPI${n}_SCK`, `QSPI${n}_CS`, `QSPI${n}_IO0`, `QSPI${n}_IO1`, `QSPI${n}_IO2`, `QSPI${n}_IO3`]),
  // pwm (+ grouped pwm)
  ...Array.from({ length: 16 }, (_, i) => `PWM${i}`),
  ...['0', '1'].flatMap(g => Array.from({ length: 6 }, (_, i) => `PWMG${g}_PWM${i}`)),
  // adc — unit+channel qualified (ADC{unit}_CH{channel}); units 0-2, channels 0-19
  ...[0, 1, 2].flatMap(u => Array.from({ length: 20 }, (_, c) => `ADC${u}_CH${c}`)),
  // dac
  ...Array.from({ length: 8 }, (_, i) => `DAC${i}`), 'DAC_1', 'DAC_2',
  // i2s / digital mic (audio bus)
  ...['', '0', '1', '2'].flatMap(n => [`I2S${n}_SCK`, `I2S${n}_WS`, `I2S${n}_SYNC`, `I2S${n}_DIN`, `I2S${n}_DOUT`, `I2S${n}_MCLK`]),
  'I2S_MCLK', 'DMIC_CLK', 'DMIC_DAT',
  // rgb lcd
  ...['R', 'G', 'B'].flatMap(ch => Array.from({ length: 8 }, (_, i) => `RGB_${ch}${i}`)),
  'RGB_DCLK', 'RGB_DE', 'RGB_DISP', 'RGB_HSYNC', 'RGB_VSYNC',
  // i8080 (mcu8080) lcd
  ...Array.from({ length: 18 }, (_, i) => `I8080_D${i}`),
  'I8080_CSX', 'I8080_RDX', 'I8080_RSX', 'I8080_WRX', 'I8080_RESET',
  // camera (cis / dvp)
  'CIS_MCLK', 'CIS_AUXCLK', 'CIS_PCLK', 'CIS_HSYNC', 'CIS_VSYNC',
  ...Array.from({ length: 8 }, (_, i) => `CIS_PXD${i}`),
  // sdio (up to 8-bit bus)
  'SDIO_CLK', 'SDIO_CMD', 'SDIO_INT',
  ...Array.from({ length: 8 }, (_, i) => `SDIO_DATA${i}`),
  // segment lcd (slcd)
  ...Array.from({ length: 32 }, (_, i) => `SEG${i}`),
  ...Array.from({ length: 8 }, (_, i) => `COM${i}`),
  // ethernet (rmii/mii)
  'ENET_MDC', 'ENET_MDIO', 'ENET_REF_CLK', 'ENET_PHY_INT', 'ENET_RX_CLK', 'ENET_TX_CLK',
  'ENET_RXDV', 'ENET_TXEN', 'ENET_RX_ER', 'ENET_TX_ER', 'ENET_CRS', 'ENET_COL',
  ...Array.from({ length: 4 }, (_, i) => `ENET_RXD${i}`),
  ...Array.from({ length: 4 }, (_, i) => `ENET_TXD${i}`),
  // can / lin
  'CAN_TX', 'CAN_RX', 'CAN_STBY', 'LIN_TXD', 'LIN_RXD', 'LIN_SLEEP',
  // smart card (iso7816) / irda
  'SC_CLK', 'SC_IO', 'SC_RSTN', 'SC_VCC', 'IRDA',
  // usb
  'USB_D+', 'USB_D-',
  // touch
  ...Array.from({ length: 16 }, (_, i) => `TOUCH${i}`),
];

// Leading peripheral prefixes used to categorize pin function names in the
// combobox. Order: longer/more-specific first so e.g. QSPI/I2S aren't shadowed.
const COMBO_PREFIXES = [
  // Full-token prefixes that must beat shorter ones (e.g. LINE before LIN).
  'VCOM', 'LINE',
  'GPIO', 'UART', 'QSPI', 'SPIC', 'SPI', 'I2S', 'I2C', 'I8080', 'PWM', 'ADC', 'DAC',
  'TIMER', 'RTC', 'WKUP',
  'RGB', 'DVP', 'CIS', 'SEG', 'COM', 'TOUCH', 'SDIO', 'CAN', 'LIN', 'ENET',
  'USB', 'SWCLK', 'SWDIO', 'JT', 'NJTRST', 'SC_',
  'MIC', 'AUDIO', 'DMIC',
  'CLK_OUT', 'XTAL', 'OSC', 'LPO', 'XI', 'XO',
];
// Prefixes that share a named category (i18n key) instead of standing alone.
const COMBO_GROUPS = {
  CLK_OUT: 'pfComboClock', XTAL: 'pfComboClock', OSC: 'pfComboClock',
  LPO: 'pfComboClock', XI: 'pfComboClock', XO: 'pfComboClock',
  MIC: 'pfComboAudio', AUDIO: 'pfComboAudio', DMIC: 'pfComboAudio',
  VCOM: 'pfComboAudio', LINE: 'pfComboAudio',
  SEG: 'pfComboSlcd', COM: 'pfComboSlcd',
  SWCLK: 'pfComboSwd', SWDIO: 'pfComboSwd',
  JT: 'pfComboJtag', NJTRST: 'pfComboJtag',
  SC_: 'pfComboIso7816',
};

// Peripheral pin fields → pinout function-name token. Used to turn a peripheral
// pin field (e.g. uart port 0 "tx") into a GPIO picker filtered to pins whose
// pinout `functions` include the matching token (e.g. "UART0_TX").
const PERI_PIN = {
  uart: { prefix: 'UART', fields: { tx: 'TX', rx: 'RX', cts: 'CTS', rts: 'RTS' } },
  i2c:  { prefix: 'I2C',  fields: { scl: 'SCL', sda: 'SDA' } },
  spi:  { prefix: 'SPI',  fields: { clk: 'SCK', cs: 'CSN', mosi: 'MOSI', miso: 'MISO' } },
  qspi: { prefix: 'QSPI', fields: { clk: 'SCK', cs: 'CS', d0: 'IO0', d1: 'IO1', d2: 'IO2', d3: 'IO3' } },
  pwm:  { prefix: 'PWM',  pinField: 'pin' },
  // ADC tokens are unit+channel qualified (e.g. "ADC1_CH0") so multi-unit chips
  // (ESP32 has ADC1 + ADC2 with overlapping channel numbers) stay unambiguous.
  // The token is built from the enclosing port id (the ADC unit) + channel id.
  adc:  { prefix: 'ADC',  pinField: 'pin', unitChannel: true },
  // Audio bus — unit = port id (I2S0_SCK, …). Field names vary by datasheet
  // (bclk↔SCK, ws↔WS/SYNC); a mismatch just degrades to an unfiltered picker.
  i2s:  { prefix: 'I2S',  fields: { bclk: 'SCK', sck: 'SCK', ws: 'WS', sync: 'SYNC', din: 'DIN', dout: 'DOUT', mclk: 'MCLK' } },
  // Single-instance display/camera/sdio buses: noUnit → token has no port index
  // (RGB_R0, I8080_D0, CIS_PXD0, SDIO_DATA0). `arrayFields` maps a pinGroups array
  // (e.g. r/g/b, data) to its token base so element i → e.g. RGB_R{i}.
  rgb:   { prefix: 'RGB',   noUnit: true, fields: { dclk: 'DCLK', de: 'DE', disp: 'DISP', hsync: 'HSYNC', vsync: 'VSYNC' }, arrayFields: { r: 'R', g: 'G', b: 'B' } },
  i8080: { prefix: 'I8080', noUnit: true, fields: { wr: 'WRX', wdx: 'WRX', rd: 'RDX', rdx: 'RDX', cs: 'CSX', csx: 'CSX', dc: 'RSX', rsx: 'RSX', reset: 'RESET', rst: 'RESET' }, arrayFields: { data: 'D' } },
  dvp:   { prefix: 'CIS',   noUnit: true, fields: { mclk: 'MCLK', pclk: 'PCLK', hsync: 'HSYNC', vsync: 'VSYNC' }, arrayFields: { data: 'PXD' } },
  sdio:  { prefix: 'SDIO',  noUnit: true, fields: { clk: 'CLK', cmd: 'CMD' }, arrayFields: { data: 'DATA' } },
};

// Resolve the bilingual peripheral catalog to the active language: pick the
// localized string for each title/label, pass enums/enumSets through unchanged
// (they are language-independent HAL identifiers).
function resolvePeripheralSchema() {
  const lang = i18n.getLanguage && i18n.getLanguage() === 'zh-CN' ? 'zh-CN' : 'en';
  const pick = (o) => (o && typeof o === 'object') ? (o[lang] || o.en || '') : o;
  const out = {};
  for (const [type, def] of Object.entries(PERIPHERAL_SCHEMA)) {
    const labels = {};
    for (const [k, v] of Object.entries(def.labels || {})) labels[k] = pick(v);
    const enumLabels = {};
    for (const [field, m] of Object.entries(def.enumLabels || {})) {
      enumLabels[field] = {};
      for (const [val, bl] of Object.entries(m)) enumLabels[field][val] = pick(bl);
    }
    out[type] = {
      title: pick(def.title), labels, hide: def.hide || [], unitKB: def.unitKB || [], enums: def.enums || {}, enumLabels, enumSets: def.enumSets || {}, itemEnums: def.itemEnums || {}, groupedPicks: def.groupedPicks || {},
      combos: def.combos || {}, segments: def.segments || [], indexedPins: def.indexedPins || [],
      computed: def.computed || {}, rowComputed: def.rowComputed || {}, countFrom: def.countFrom || null,
      flatten: def.flatten || [], visibleWhen: def.visibleWhen || {}, provisional: !!def.provisional, templates: def.templates || {},
      note: def.note ? { title: pick(def.note.title), items: (def.note.items || []).map(n => ({ term: pick(n.term), desc: pick(n.desc) })) } : null,
    };
  }
  return out;
}

// Friendly labels (raw key -> localized) for the pinout rows.
function pinoutLabels() {
  return {
    pin: i18n.t('pfpoPin'), name: i18n.t('pfpoName'), gpio: i18n.t('pfpoGpio'),
    type: i18n.t('pfpoType'), functions: i18n.t('pfpoFunctions'), caps: i18n.t('pfpoCaps'), note: i18n.t('pfpoNote'),
  };
}

// <select> options; preserves an unrecognized current value as a selected option.
function selectOptions(opts, cur) {
  const known = opts.includes(cur);
  return `<option value="">—</option>` +
    (cur && !known ? `<option value="${escapeHtml(cur)}" selected>${escapeHtml(cur)}</option>` : '') +
    opts.map(o => `<option value="${escapeHtml(o)}"${o === cur ? ' selected' : ''}>${escapeHtml(o)}</option>`).join('');
}

function kindOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'object') return 'object';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'boolean';
  return 'string';
}

class StructEditor {
  constructor(data, { omitKeys, labels, lockStructure, enums, datalistKeys, datalistSuggest, pinout, categories, schema, flattenKeys, inlineObjects, itemTemplate } = {}) {
    this.data = data ?? {};
    this.omitKeys = omitKeys || null;
    this.labels = labels || null; // map: raw key -> friendly localized label
    this.lockStructure = !!lockStructure; // fixed schema: no add/remove of object fields
    this.enums = enums || null; // map: raw key -> allowed values (rendered as a <select>)
    // Per-section fixed-format schema, keyed by the first path segment (e.g. the
    // peripheral type). { [type]: { title, labels:{k:str}, enums:{k:[]},
    // enumSets:{k:[universe]} } } — gives friendly titles/labels, single-choice
    // <select>s and multi-choice checklists. See platform-peripheral-schema.data.js.
    this.schema = schema || null;
    // Object keys rendered "transparently": their child fields are hoisted into
    // the parent inline instead of wrapped in their own collapsible box (e.g.
    // 'spec' — so a peripheral shows its params directly, no box-in-box).
    this.flattenKeys = flattenKeys || null;
    // Render all-scalar objects (e.g. a {min,max} range, an {rx,tx} irq) as one
    // inline row instead of a collapsible box — fewer nested boxes, cleaner.
    this.inlineObjects = !!inlineObjects;
    // Array keys whose string items render as a combobox (free text + <datalist>
    // suggestions gathered from all values already used under that key).
    this.datalistKeys = datalistKeys || null;
    // Default suggestions merged into the datalist combobox (e.g. generic pin
    // function names) so a fresh platform isn't blank.
    this.datalistSuggest = datalistSuggest || null;
    this.dlId = datalistKeys ? `sfdl${++_dlSeq}` : null;
    // When set (the peripherals editor), recognized pin fields render as a GPIO
    // picker sourced from this pinout array, filtered by function name.
    this.pinout = pinout || null;
    // Optional [{id,label,keys[]}] to group root-level keys into category sections.
    this.categories = categories || null;
    // Shape for a new item added to the (empty) root array — e.g. a pinout row.
    this.itemTemplate = itemTemplate || null;
    this.rootEl = null;
  }

  // Friendly label for key `k`. `path` is the key's *parent* path; the schema
  // section is keyed by the first segment (peripheral type), or by `k` itself
  // when `k` is a root-level section (path empty) -> its title.
  _label(k, path) {
    const p = path || [];
    const type = p.length ? p[0] : k;
    const sc = this.schema && this.schema[type];
    if (sc) {
      if (!p.length && sc.title) return sc.title;
      // "parent.key" override disambiguates a key reused at different depths.
      const parentKey = p.length ? p[p.length - 1] : null;
      if (sc.labels) {
        if (parentKey && sc.labels[`${parentKey}.${k}`]) return sc.labels[`${parentKey}.${k}`];
        if (sc.labels[k]) return sc.labels[k];
      }
    }
    if (this.labels && this.labels[k]) return this.labels[k];
    // A raw HAL-constant key (e.g. a pixel-format map key) shows shortened.
    if (typeof k === 'string' && /^T(?:UYA|KL)_[A-Z0-9]+_/.test(k)) return prettyEnum(k);
    return k;
  }

  // Allowed values for a single-choice <select> at this leaf, or null.
  _enumFor(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    if (sc && sc.enums && sc.enums[key]) return sc.enums[key];
    return (this.enums && typeof key === 'string') ? this.enums[key] : null;
  }

  // Friendly display label for a single enum option value, or null (falls back
  // to prettyEnum). Value-keyed map from schema.enumLabels[key].
  _enumLabelFor(key, path, val) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    const m = sc && sc.enumLabels && sc.enumLabels[key];
    return (m && m[val] != null) ? m[val] : null;
  }

  // True when a numeric field is edited/shown in KB but stored in bytes.
  _isUnitKB(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return !!(sc && sc.unitKB && sc.unitKB.includes(key));
  }

  // Grouped two-level picker spec for an object field (category -> picks), or null.
  _groupedPicksFor(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return (sc && sc.groupedPicks && sc.groupedPicks[key]) || null;
  }

  // Universe for an array whose scalar items are each a single-choice <select>
  // (e.g. pin-mux remappable functions), or null.
  _itemEnumFor(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return (sc && sc.itemEnums && sc.itemEnums[key]) || null;
  }

  // Capability-checklist universe for an array leaf at this key, or null.
  _enumSetFor(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return (sc && sc.enumSets && sc.enumSets[key]) || null;
  }

  // A combobox: free text/number input + a custom dropdown that always lists
  // every suggestion (unlike a native <datalist>, which filters by the value).
  _comboField(dp, value, suggest, numeric) {
    return `<span class="sf-combo" data-suggest="${escapeHtml(JSON.stringify(suggest.map(String)))}">
        <input type="${numeric ? 'number' : 'text'}" class="form-input sf-leaf${numeric ? ' sf-num' : ''}" data-path="${dp}" data-kind="${numeric ? 'number' : 'string'}" autocomplete="off" value="${value == null ? '' : escapeHtml(String(value))}">
        <button type="button" class="sf-combo-toggle" tabindex="-1">▾</button>
        <div class="sf-combo-pop" hidden></div>
      </span>`;
  }

  // Free-text + dropdown suggestions for a scalar leaf at this key, or null.
  _comboSuggestFor(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return (sc && sc.combos && sc.combos[key]) || null;
  }

  // True when an array key at this path is a list of [start,end] ranges.
  _isSegments(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return !!(sc && sc.segments && sc.segments.includes(key));
  }

  // Derived-value fn for a key (read-only computed field), or null.
  _computedFn(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return (sc && sc.computed && sc.computed[key]) || null;
  }

  // Flat "start ~ end" range list (multiple segments) for e.g. GPIO pins.
  _segments(arr, path, key, parentPath) {
    const rows = (Array.isArray(arr) ? arr : []).map((seg, i) => {
      const s0 = Array.isArray(seg) ? seg[0] : seg;
      const s1 = Array.isArray(seg) ? seg[1] : seg;
      const inp = (v, idx) => `<input type="number" step="1" class="form-input sf-leaf sf-num" data-path="${escapeHtml(JSON.stringify([...path, i, idx]))}" data-kind="number" value="${v == null ? '' : escapeHtml(String(v))}">`;
      return `<div class="sf-seg">${inp(s0, 0)}<span class="sf-seg-sep">~</span>${inp(s1, 1)}
          <button type="button" class="sf-x" data-sf-action="remove" data-path="${escapeHtml(JSON.stringify([...path, i]))}">✕</button>
        </div>`;
    }).join('');
    return `<div class="sf-scalararr sf-segs">
        <label class="sf-key">${escapeHtml(this._label(key, parentPath))}</label>
        <div class="sf-seg-list">${rows}
          <button type="button" class="btn btn-sm btn-outline sf-add" data-sf-action="add-segment" data-path="${escapeHtml(JSON.stringify(path))}">+ ${escapeHtml(i18n.t('pfSegAdd') || 'segment')}</button>
        </div>
      </div>`;
  }

  // Recompute every read-only derived field and sync it back into the data.
  _refreshComputed() {
    if (!this.schema || !this.rootEl) return;
    this.rootEl.querySelectorAll('[data-sf-computed]').forEach(el => {
      const [type, key] = el.dataset.sfComputed.split(':');
      const fn = this.schema[type] && this.schema[type].computed && this.schema[type].computed[key];
      if (!fn) return;
      const val = fn(this._getByPath([type]));
      this._setByPath([type, key], val);
      el.value = String(val);
    });
    // Per-row derived table cells (e.g. flash partition size from its addresses).
    this.rootEl.querySelectorAll('[data-sf-rc]').forEach(el => {
      const { p, c } = JSON.parse(el.dataset.sfRc);
      const cfg = this.schema[p[0]] && this.schema[p[0]].rowComputed && this.schema[p[0]].rowComputed[c];
      if (!cfg) return;
      const raw = cfg.fn(this._getByPath(p) || {});
      const ok = Number.isFinite(raw);
      if (ok) this._setByPath([...p, c], raw);
      el.value = ok ? String(cfg.unit === 'KB' ? Math.round(raw / 1024) : raw) : '';
    });
  }

  // Read-only derived table cell: stores the raw value, shows it (in KB if asked).
  _rowComputedCell(row, rowPath, col, cfg) {
    const raw = cfg.fn(row || {});
    const ok = Number.isFinite(raw);
    if (ok) this._setByPath([...rowPath, col], raw);
    const disp = ok ? (cfg.unit === 'KB' ? Math.round(raw / 1024) : raw) : '';
    return `<input type="text" class="form-input sf-computed" data-sf-rc="${escapeHtml(JSON.stringify({ p: rowPath, c: col }))}" value="${escapeHtml(String(disp))}" readonly tabindex="-1">`;
  }

  // A fixed multi-select checklist: universe options as checkboxes, plus any
  // current value outside the universe preserved as an extra (checked) box.
  _enumSet(arr, path, universe) {
    const dp = escapeHtml(JSON.stringify(path));
    const key = path[path.length - 1];
    const pp = path.slice(0, -1);
    const cur = (Array.isArray(arr) ? arr : []).map(String);
    const extras = cur.filter(v => !universe.map(String).includes(v));
    const opts = [...universe.map(String), ...extras];
    const boxes = opts.map(o => {
      const checked = cur.includes(o) ? ' checked' : '';
      const extra = universe.map(String).includes(o) ? '' : ' sf-es-extra';
      const label = this._enumLabelFor(key, pp, o) || prettyEnum(o);
      return `<label class="sf-es-opt${extra}" title="${escapeHtml(o)}"><input type="checkbox" data-val="${escapeHtml(o)}"${checked}><span>${escapeHtml(label)}</span></label>`;
    }).join('');
    return `<div class="sf-enumset" data-path="${dp}">${boxes || '<span class="sf-es-empty">—</span>'}</div>`;
  }

  // Deepest `id` along the path (the enclosing port/channel instance id).
  _instanceId(path) {
    let cur = this.data, id = null;
    for (const seg of path) {
      if (cur == null) break;
      cur = cur[seg];
      if (cur && typeof cur === 'object' && !Array.isArray(cur) && typeof cur.id === 'number') id = cur.id;
    }
    return id;
  }

  // Every `id` along the path, in order (e.g. [portId, channelId] for an ADC
  // channel pin). Used for unit+channel tokens where both the enclosing unit
  // (port) and the leaf (channel) id matter.
  _instanceIdChain(path) {
    let cur = this.data; const ids = [];
    for (const seg of path) {
      if (cur == null) break;
      cur = cur[seg];
      if (cur && typeof cur === 'object' && !Array.isArray(cur) && typeof cur.id === 'number') ids.push(cur.id);
    }
    return ids;
  }

  // Nearest enclosing port's `backend` along the path (e.g. an SPI port may run
  // as "qspi"), or null.
  _backendAt(path) {
    let cur = this.data, backend = null;
    for (const seg of path) {
      if (cur == null) break;
      cur = cur[seg];
      if (cur && typeof cur === 'object' && !Array.isArray(cur) && typeof cur.backend === 'string') backend = cur.backend;
    }
    return backend;
  }

  // Nearest enclosing port's `routable` flag along the path (GPIO-matrix chips set
  // it on a peripheral port whose pins aren't locked to specific GPIOs). Default
  // false = fixed pinmux (current behavior).
  _routableAt(path) {
    let cur = this.data, r = false;
    for (const seg of path) {
      if (cur == null) break;
      cur = cur[seg];
      if (cur && typeof cur === 'object' && !Array.isArray(cur) && typeof cur.routable === 'boolean') r = cur.routable;
    }
    return r;
  }

  // Nearest enclosing port's `candidates` (GPIO numbers a routable port may use),
  // or null when unconstrained (= any GPIO-capable pin).
  _candidatesAt(path) {
    let cur = this.data, c = null;
    for (const seg of path) {
      if (cur == null) break;
      cur = cur[seg];
      if (cur && typeof cur === 'object' && !Array.isArray(cur) && Array.isArray(cur.candidates)) c = cur.candidates;
    }
    return c;
  }

  // True when the leaf sits inside a pin mapping (pinGroups/pins subtree), so a
  // numeric value there is a GPIO and should use a picker even without a token.
  _isPinContext(path) {
    return Array.isArray(path) && (path.includes('pinGroups') || path.includes('pins'));
  }

  // Blank copy of `v` for a newly-added array item: scalars are blanked and most
  // arrays start empty, but pin-structure arrays (a port's pinGroups, the r/g/b
  // data buses) keep their length so the new item arrives pre-shaped to fill.
  _blankClone(v, path) {
    const k = kindOf(v);
    if (k === 'array') return this._isPinContext(path) ? v.map((el, i) => this._blankClone(el, [...path, i])) : [];
    if (k === 'object') { const o = {}; for (const kk of Object.keys(v)) o[kk] = this._blankClone(v[kk], [...path, kk]); return o; }
    if (k === 'number') return 0;
    if (k === 'boolean') return false;
    if (k === 'null') return null;
    return '';
  }

  // Pin-field config for the path. A port whose `backend` names another
  // peripheral (e.g. an SPI port set to "qspi") adopts that peripheral's pin
  // fields (clk/cs/d0… instead of clk/cs/mosi/miso).
  _pinCfg(path) {
    const backend = this._backendAt(path);
    if (backend && PERI_PIN[backend]) return PERI_PIN[backend];
    return PERI_PIN[path[0]];
  }

  // pinout function token for a peripheral pin field, or null if not a pin field.
  _pinToken(path) {
    if (!this.pinout || !path.length) return null;
    const cfg = this._pinCfg(path);
    if (!cfg) return null;
    const field = path[path.length - 1];
    let suffix;
    // Array pin field (e.g. RGB r/g/b[], I8080/DVP data[]): path ends in
    // [.., arrayName, index] → suffix `_${base}${index}` (e.g. "_R0", "_D3").
    if (typeof field === 'number' && cfg.arrayFields && path.length >= 2 && cfg.arrayFields[path[path.length - 2]] != null) {
      suffix = '_' + cfg.arrayFields[path[path.length - 2]] + field;
    }
    else if (cfg.pinField && field === cfg.pinField) suffix = '';
    else if (cfg.fields && field in cfg.fields) suffix = '_' + cfg.fields[field];
    else return null;
    // Single-instance buses (rgb/i8080/dvp/sdio): no port index in the token.
    if (cfg.noUnit) return `${cfg.prefix}${suffix}`;
    // Unit+channel peripherals (ADC): token is `${prefix}${unit}_CH${channel}`,
    // built from the two enclosing ids (port = unit, channel = leaf). Falls back
    // to unit 0 when the path has no port level.
    if (cfg.unitChannel) {
      const ids = this._instanceIdChain(path);
      if (!ids.length) return null;
      const channel = ids[ids.length - 1];
      const unit = ids.length >= 2 ? ids[ids.length - 2] : 0;
      return `${cfg.prefix}${unit}_CH${channel}`;
    }
    const id = this._instanceId(path);
    if (id == null) return null;
    return `${cfg.prefix}${id}${suffix}`;
  }

  // GPIO <select> sourced from pinout, filtered to pins whose functions include
  // `token` (falls back to all GPIOs when none match). Preserves an unknown value.
  _pinSelect(path, value, token) {
    const dp = escapeHtml(JSON.stringify(path));
    const all = this.pinout.filter(e => e && typeof e.gpio === 'number');
    const cur = (value === null || value === undefined) ? '' : String(value);
    const opt = (e) => `<option value="${e.gpio}"${String(e.gpio) === cur ? ' selected' : ''}>${escapeHtml(`${e.gpio} · ${e.name || ('GPIO' + e.gpio)}`)}</option>`;
    // Routable port (GPIO-matrix): the peripheral isn't locked to a pin, so don't
    // token-match. The stored value IS the port's default (from pinGroups); surface
    // it as "default (recommended)", then the candidate pool — the port's
    // `candidates` if declared, else every GPIO-capable pin — as selectable.
    if (this._routableAt(path)) {
      const cand = this._candidatesAt(path);
      const pool = Array.isArray(cand) && cand.length
        ? all.filter(e => cand.includes(e.gpio))
        : all.filter(e => Array.isArray(e.functions) && e.functions.includes('GPIO'));
      const poolF = pool.length ? pool : all;
      const curEnt = poolF.find(e => String(e.gpio) === cur);
      const rest = poolF.filter(e => e !== curEnt);
      let opts = `<option value="">—</option>`;
      if (cur !== '' && !curEnt) opts += `<option value="${escapeHtml(cur)}" selected>${escapeHtml(cur)}</option>`;
      if (curEnt) opts += `<optgroup label="${escapeHtml(i18n.t('pfPinDefault'))}">${opt(curEnt)}</optgroup>`;
      opts += `<optgroup label="${escapeHtml(i18n.t('pfPinRoutable'))}">${rest.map(opt).join('')}</optgroup>`;
      return `<select class="form-input sf-leaf sf-pinsel" data-path="${dp}" data-kind="number" title="${escapeHtml(i18n.t('pfPinRoutable'))}">${opts}</select>`;
    }
    // Fixed port: pins whose functions advertise this token are surfaced first ("recommended").
    // PWM is matched loosely: a PWM channel's `id` is a flat index, but the pinout
    // names PWM pins per-datasheet (PWMGx_PWMn) or via timer channels (TIMERx_CHy),
    // so any PWM-/timer-capable pin is a valid recommendation, not just `PWM{id}`.
    const isPwm = typeof token === 'string' && token.startsWith('PWM');
    const advertises = (e) => Array.isArray(e.functions) && (
      e.functions.includes(token) ||
      (isPwm && e.functions.some(f =>
        f.startsWith('PWM') || /^TIMER\d+_CH\d+/.test(f)))
    );
    const matched = all.filter(advertises);
    const matchedSet = new Set(matched);
    const others = all.filter(e => !matchedSet.has(e));
    let opts = `<option value="">—</option>`;
    if (cur !== '' && !all.some(e => String(e.gpio) === cur)) opts += `<option value="${escapeHtml(cur)}" selected>${escapeHtml(cur)}</option>`;
    if (matched.length) opts += `<optgroup label="${escapeHtml(`${i18n.t('pfPinMatched')} · ${token}`)}">${matched.map(opt).join('')}</optgroup>`;
    opts += `<optgroup label="${escapeHtml(matched.length ? i18n.t('pfPinOther') : i18n.t('pfPinAll'))}">${others.map(opt).join('')}</optgroup>`;
    return `<select class="form-input sf-leaf sf-pinsel" data-path="${dp}" data-kind="number" title="${escapeHtml(token)}">${opts}</select>`;
  }

  mount(rootEl) {
    this.rootEl = rootEl;
    this.render();
    rootEl.addEventListener('input', (e) => this._onLeaf(e));
    rootEl.addEventListener('change', (e) => this._onLeaf(e));
    rootEl.addEventListener('click', (e) => this._onClick(e));
    if (this.datalistKeys || this.schema) this._wireCombo(rootEl);
  }

  // Categorized combobox: open on focus/type, pick via mousedown (beats blur).
  _wireCombo(rootEl) {
    const comboOf = (e) => {
      const c = e.target.closest && e.target.closest('.sf-combo');
      return (c && e.target.classList.contains('sf-leaf')) ? c : null;
    };
    rootEl.addEventListener('focusin', (e) => { const c = comboOf(e); if (c) this._comboOpen(c, ''); });
    rootEl.addEventListener('focusout', (e) => { const c = comboOf(e); if (c) setTimeout(() => this._comboClose(c), 150); });
    rootEl.addEventListener('input', (e) => { const c = comboOf(e); if (c) this._comboOpen(c, e.target.value); });
    // Hover a category → reveal its options in the right pane.
    rootEl.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.sf-combo-catitem');
      if (item) this._comboShowCat(item.closest('.sf-combo'), item);
    });
    rootEl.addEventListener('mousedown', (e) => {
      const opt = e.target.closest('.sf-combo-opt');
      if (opt) {
        e.preventDefault();
        const combo = opt.closest('.sf-combo');
        const input = combo.querySelector('.sf-leaf');
        input.value = opt.dataset.val;
        const picked = input.dataset.kind === 'number' ? Number(opt.dataset.val) : opt.dataset.val;
        this._setByPath(JSON.parse(input.dataset.path), picked);
        this._comboClose(combo);
        return;
      }
      const cat = e.target.closest('.sf-combo-catitem');
      if (cat) { e.preventDefault(); this._comboShowCat(cat.closest('.sf-combo'), cat); return; }
      const tog = e.target.closest('.sf-combo-toggle');
      if (tog) {
        e.preventDefault();
        const combo = tog.closest('.sf-combo');
        const pop = combo.querySelector('.sf-combo-pop');
        if (pop && pop.hidden) { combo.querySelector('.sf-leaf').focus(); this._comboOpen(combo, ''); }
        else this._comboClose(combo);
      }
    });
    // Click anywhere outside a combo closes any open popover.
    document.addEventListener('mousedown', (e) => {
      if (!this.rootEl) return;
      if (e.target.closest && e.target.closest('.sf-combo')) return;
      this.rootEl.querySelectorAll('.sf-combo-pop').forEach(p => { p.hidden = true; });
    });
  }

  render() {
    if (!this.rootEl) return;
    this.rootEl.innerHTML = this._node(this.data, [], this.omitKeys);
  }
  getData() { return this.data; }

  // Distinct string values used under any datalistKeys array, for suggestions.
  _datalistOptions() {
    const out = new Set();
    if (this.datalistSuggest) this.datalistSuggest.forEach(x => { if (typeof x === 'string' && x.trim()) out.add(x.trim()); });
    const walk = (v) => {
      if (Array.isArray(v)) { v.forEach(walk); return; }
      if (v && typeof v === 'object') {
        for (const k of Object.keys(v)) {
          if (this.datalistKeys.includes(k) && Array.isArray(v[k])) {
            v[k].forEach(x => { if (typeof x === 'string' && x.trim()) out.add(x.trim()); });
          }
          walk(v[k]);
        }
      }
    };
    walk(this.data);
    return [...out].sort(naturalCompare);
  }

  // Categorize a function name by its leading peripheral prefix.
  _comboCategory(v) {
    for (const p of COMBO_PREFIXES) {
      if (!v.startsWith(p)) continue;
      return COMBO_GROUPS[p] ? (i18n.t(COMBO_GROUPS[p]) || p) : p;
    }
    return i18n.t('pfComboOther') || 'Other';
  }

  _optBtn(v) { return `<button type="button" class="sf-combo-opt" data-val="${escapeHtml(v)}">${escapeHtml(v)}</button>`; }

  _comboOptionsByCat(cat) {
    return this._datalistOptions().filter(o => this._comboCategory(o) === cat);
  }

  // Popover HTML: two-pane cascade (categories | options) when browsing; a flat
  // filtered list when the user has typed a filter.
  _comboPopHtml(filter) {
    const f = (filter || '').toLowerCase();
    const all = this._datalistOptions();
    if (f) {
      const m = all.filter(o => o.toLowerCase().includes(f));
      return m.length ? `<div class="sf-combo-flat">${m.map(v => this._optBtn(v)).join('')}</div>`
        : `<div class="sf-combo-empty">—</div>`;
    }
    // Distinct category labels present, in COMBO_PREFIXES order (grouped prefixes
    // collapse to their shared label), with "Other" last.
    const present = new Set(all.map(o => this._comboCategory(o)));
    const other = i18n.t('pfComboOther') || 'Other';
    const cats = [];
    const seen = new Set();
    for (const p of COMBO_PREFIXES) {
      const label = COMBO_GROUPS[p] ? (i18n.t(COMBO_GROUPS[p]) || p) : p;
      if (present.has(label) && !seen.has(label)) { seen.add(label); cats.push(label); }
    }
    if (present.has(other)) cats.push(other);
    if (!cats.length) return `<div class="sf-combo-empty">—</div>`;
    return `<div class="sf-combo-cats">${cats.map(c =>
        `<button type="button" class="sf-combo-catitem" data-cat="${escapeHtml(c)}">${escapeHtml(c)}<span class="sf-combo-arrow">▸</span></button>`
      ).join('')}</div><div class="sf-combo-sub"></div>`;
  }

  _comboOpen(combo, filter) {
    const pop = combo.querySelector('.sf-combo-pop');
    if (!pop) return;
    // Fixed-suggestion combo (schema `combos`): always list every option, so the
    // dropdown isn't filtered down by the current value (selection-only — pick to commit).
    if (combo.dataset.suggest) {
      const opts = JSON.parse(combo.dataset.suggest);
      pop.innerHTML = `<div class="sf-combo-flat">${opts.map(o => this._optBtn(String(o))).join('')}</div>`;
      pop.hidden = false;
      return;
    }
    const input = combo.querySelector('.sf-leaf');
    const f = filter !== undefined ? filter : (input ? input.value : '');
    pop.innerHTML = this._comboPopHtml(f);
    pop.hidden = false;
    // Two-pane: pre-open the first category so the right pane isn't empty.
    if (!f) {
      const first = pop.querySelector('.sf-combo-catitem');
      if (first) this._comboShowCat(combo, first);
    }
  }

  _comboShowCat(combo, item) {
    combo.querySelectorAll('.sf-combo-catitem').forEach(b => b.classList.toggle('active', b === item));
    const sub = combo.querySelector('.sf-combo-sub');
    if (sub) sub.innerHTML = this._comboOptionsByCat(item.dataset.cat).map(v => this._optBtn(v)).join('');
  }

  _comboClose(combo) {
    const pop = combo && combo.querySelector('.sf-combo-pop');
    if (pop) pop.hidden = true;
    // Selection-only string combos: discard any unpicked typed text by restoring
    // the input to its committed model value (typing only ever filters the list).
    const input = combo && combo.querySelector('.sf-leaf');
    if (input && input.dataset.kind !== 'number' && input.dataset.path) {
      const v = this._getByPath(JSON.parse(input.dataset.path));
      input.value = (v == null ? '' : String(v));
    }
  }

  _getByPath(path) { let cur = this.data; for (const seg of path) cur = cur?.[seg]; return cur; }
  _setByPath(path, val) {
    if (!path.length) { this.data = val; return; }
    let cur = this.data;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]] = val;
  }

  _onLeaf(e) {
    // Add-category selector (grouped picker): create an empty category section.
    const addcat = e.target.closest && e.target.closest('.sf-addcat');
    if (addcat && this.rootEl.contains(addcat) && addcat.value) {
      const p = JSON.parse(addcat.dataset.path);
      const map = this._getByPath(p);
      if (map && typeof map === 'object' && !(addcat.value in map)) { map[addcat.value] = []; this._rerender(); }
      return;
    }
    // Capability checklist: rebuild the array from the checked boxes in its group.
    const esBox = e.target.closest && e.target.closest('.sf-enumset');
    if (esBox && this.rootEl.contains(esBox) && e.target.matches('input[type="checkbox"]')) {
      const path = JSON.parse(esBox.dataset.path);
      const vals = Array.from(esBox.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.dataset.val);
      this._setByPath(path, vals);
      this._refreshComputed();
      return;
    }
    const el = e.target.closest('.sf-leaf');
    if (!el || !this.rootEl.contains(el)) return;
    // String comboboxes (pinout `functions`, pin-mux remappable functions) are
    // SELECTION-ONLY: typing only filters the dropdown; a value is committed
    // solely by picking an option (see the mousedown pick handler). This blocks
    // arbitrary free-text function tokens that would be impossible to manage.
    // Numeric combos keep free entry.
    if (el.dataset.kind !== 'number' && el.closest('.sf-combo')) return;
    const path = JSON.parse(el.dataset.path);
    const kind = el.dataset.kind;
    let val;
    if (kind === 'boolean') val = el.checked;
    else if (kind === 'number') {
      val = el.value === '' ? null : Number(el.value);
      // KB-unit field: edited in KB, stored in bytes.
      if (val !== null && el.dataset.scale) val = val * Number(el.dataset.scale);
    } else if (kind === 'null') {
      const t = el.value.trim();
      val = t === '' ? null : (/^-?\d+(\.\d+)?$/.test(t) ? Number(t) : t);
    } else val = el.value;
    this._setByPath(path, val);
    this._refreshComputed();
    // A boolean gate (e.g. "IRQ enabled") may show/hide dependent fields.
    const t = path.length ? path[0] : null;
    if (kind === 'boolean' && t && this.schema && this.schema[t] && this.schema[t].visibleWhen) {
      this._rerender();
      return;
    }
    // An item-enum pick changed → re-render so it moves to its category bucket.
    if (kind === 'string' && path.length >= 2 && this._itemEnumFor(path[path.length - 2], path.slice(0, -2))) {
      this._rerender();
    }
  }

  _onClick(e) {
    const btn = e.target.closest('[data-sf-action]');
    if (!btn || !this.rootEl.contains(btn)) return;
    e.preventDefault();
    const action = btn.dataset.sfAction;
    const path = JSON.parse(btn.dataset.path);
    const target = this._getByPath(path);
    if (action === 'add' && Array.isArray(target)) {
      const tmpl = this._objArrayTemplate(path);
      // A fixed per-type template (ports / channels / pinGroups) ALWAYS wins, so
      // an added item's structure is determined by the peripheral type, never
      // cloned from an existing entry. An empty root array (e.g. a fresh pinout)
      // uses the editor's itemTemplate. Cloning is only a fallback for arrays
      // with no known template.
      const rootTmpl = (path.length === 0 && this.itemTemplate) ? JSON.parse(JSON.stringify(this.itemTemplate)) : null;
      const item = tmpl || rootTmpl || (target.length ? this._blankClone(target[0], [...path, 0]) : '');
      // Object items with a numeric id (ports/channels): assign the smallest
      // unused id so a new one doesn't collide with an existing one.
      if (item && typeof item === 'object' && !Array.isArray(item) && typeof item.id === 'number') {
        const used = new Set(target.map(x => (x && typeof x.id === 'number') ? x.id : null));
        let nid = 0; while (used.has(nid)) nid++;
        item.id = nid;
      }
      target.push(item);
    } else if (action === 'add-pick' && Array.isArray(target)) {
      // Grouped picker: seed a new entry with the category's next unused value.
      const catId = path[path.length - 1];
      const gp = this.schema && this.schema[path[0]] && this.schema[path[0]].groupedPicks;
      const groups = gp && gp[path[path.length - 2]];
      const g = groups && groups.find(x => x.id === catId);
      const vals = (g && g.vals) || [];
      const used = new Set(target.map(String));
      target.push(vals.find(v => !used.has(v)) || vals[0] || '');
    } else if (action === 'add-segment' && Array.isArray(target)) {
      // New range starts just past the previous segment's end.
      const last = target.length ? target[target.length - 1] : null;
      const start = Array.isArray(last) && last.length >= 2 ? Number(last[1]) + 1 : 0;
      target.push([start, start]);
    } else if (action === 'remove') {
      const parent = this._getByPath(path.slice(0, -1));
      const key = path[path.length - 1];
      if (Array.isArray(parent)) parent.splice(key, 1);
      else delete parent[key];
    } else if (action === 'add-field' && target && typeof target === 'object') {
      const key = prompt(i18n.t('platformStructAddFieldPrompt') || 'New field name:');
      if (key && !(key in target)) target[key] = '';
    }
    this._rerender();
  }

  // Re-render after a structural change, preserving which <details> were open
  // (otherwise adding/removing an item would collapse the row you're editing).
  _rerender() {
    if (!this.rootEl) return;
    const open = new Set(
      Array.from(this.rootEl.querySelectorAll('details[data-sf-path]'))
        .filter(d => d.open).map(d => d.dataset.sfPath)
    );
    this.render();
    this.rootEl.querySelectorAll('details[data-sf-path]').forEach(d => {
      if (open.has(d.dataset.sfPath)) d.open = true;
    });
  }

  _node(value, path, omitKeys) {
    const kind = kindOf(value);
    if (kind === 'array') return this._array(value, path);
    if (kind === 'object') return this._object(value, path, omitKeys);
    return this._leaf(value, path, kind);
  }

  _leaf(value, path, kind) {
    const dp = escapeHtml(JSON.stringify(path));
    const key = path.length ? path[path.length - 1] : null;
    const enumOpts = this._enumFor(key, path.slice(0, -1));
    if (enumOpts) {
      const cur = value == null ? '' : String(value);
      const known = enumOpts.map(String).includes(cur);
      const pp = path.slice(0, -1);
      const lbl = (o) => this._enumLabelFor(key, pp, String(o)) || prettyEnum(o);
      // Only offer the empty "—" when nothing is selected yet; once a value is
      // chosen it's a required pick, so the blank option is dropped.
      const opts = (cur === '' ? `<option value="">—</option>` : '')
        + (cur && !known ? `<option value="${escapeHtml(cur)}" selected>${escapeHtml(lbl(cur))}</option>` : '')
        + enumOpts.map(o => `<option value="${escapeHtml(String(o))}"${String(o) === cur ? ' selected' : ''}>${escapeHtml(lbl(o))}</option>`).join('');
      return `<select class="form-input sf-leaf" data-path="${dp}" data-kind="string" title="${escapeHtml(cur)}">${opts}</select>`;
    }
    // Array-of-scalars item that is a single-choice pick from a universe (e.g.
    // pin-mux remappable functions) → <select>, options shown without TUYA_.
    // The universe may be flat (string[]) or grouped ([{group, vals}]).
    if (typeof key === 'number' && path.length >= 2) {
      const uni = this._itemEnumFor(path[path.length - 2], path.slice(0, -2));
      if (uni && uni.length) {
        const grouped = typeof uni[0] === 'object';
        const flat = grouped ? uni.flatMap(g => g.vals) : uni;
        const cur = value == null ? '' : String(value);
        const known = flat.includes(cur);
        const lbl = (o) => String(o).replace(/^TUYA_/, '');
        const opt = (o) => `<option value="${escapeHtml(String(o))}"${String(o) === cur ? ' selected' : ''}>${escapeHtml(lbl(o))}</option>`;
        const body = (cur === '' ? `<option value="">—</option>` : '')
          + (cur && !known ? `<option value="${escapeHtml(cur)}" selected>${escapeHtml(lbl(cur))}</option>` : '')
          + (grouped
            ? uni.map(g => `<optgroup label="${escapeHtml(g.group)}">${g.vals.map(opt).join('')}</optgroup>`).join('')
            : uni.map(opt).join(''));
        return `<select class="form-input sf-leaf" data-path="${dp}" data-kind="string" title="${escapeHtml(cur)}">${body}</select>`;
      }
    }
    // Array-of-scalars item whose array key offers suggestions (e.g. a pixel
    // format's supported data-bus widths) → combobox: pick a common value or type.
    if (typeof key === 'number' && path.length >= 2) {
      const sug = this._comboSuggestFor(path[path.length - 2], path.slice(0, -2));
      if (sug && sug.length) return this._comboField(dp, value, sug, kind !== 'string');
    }
    // Peripheral pin field → GPIO picker. Only for numeric leaves: a pin is a
    // GPIO number, never a boolean. (Guards against keys like irq.rx/irq.tx
    // colliding with the UART tx/rx pin-field names.)
    if (kind === 'number' || kind === 'null') {
      let pinToken = this._pinToken(path);
      // A pin without a known function token (e.g. RGB dclk/r/g/b) still gets a
      // GPIO picker — just unfiltered (all GPIOs).
      if (pinToken === null && this.pinout && this._isPinContext(path)) pinToken = '';
      if (pinToken !== null) return this._pinSelect(path, value, pinToken);
    }
    if (kind === 'boolean') {
      return `<label class="sf-bool"><input type="checkbox" class="sf-leaf" data-path="${dp}" data-kind="boolean" ${value ? 'checked' : ''}><span></span></label>`;
    }
    if (kind === 'number') {
      const kb = this._isUnitKB(key, path.slice(0, -1));
      const disp = (kb && typeof value === 'number') ? value / 1024 : value;
      return `<input type="number" step="any" class="form-input sf-leaf sf-num" data-path="${dp}" data-kind="number"${kb ? ' data-scale="1024"' : ''} value="${disp === null || disp === undefined ? '' : escapeHtml(String(disp))}">`;
    }
    if (kind === 'null') {
      return `<input type="text" class="form-input sf-leaf" data-path="${dp}" data-kind="null" value="" placeholder="null">`;
    }
    // Schema-driven combobox: free text + full dropdown of suggestions.
    const suggest = this._comboSuggestFor(key, path.slice(0, -1));
    if (suggest && suggest.length) return this._comboField(dp, value, suggest, false);
    // Categorized combobox (free text + grouped dropdown) under a datalist key.
    const parentKey = path.length >= 2 ? path[path.length - 2] : null;
    if (this.datalistKeys && typeof parentKey === 'string' && this.datalistKeys.includes(parentKey)) {
      return `<span class="sf-combo">
          <input type="text" class="form-input sf-leaf" data-path="${dp}" data-kind="string" autocomplete="off" value="${escapeHtml(String(value))}">
          <button type="button" class="sf-combo-toggle" tabindex="-1">▾</button>
          <div class="sf-combo-pop" hidden></div>
        </span>`;
    }
    return `<input type="text" class="form-input sf-leaf" data-path="${dp}" data-kind="string" value="${escapeHtml(String(value))}">`;
  }

  // HTML for one object key (a field row, an inline scalar array, or a group).
  _renderChild(obj, k, path, removable) {
    const childPath = [...path, k];
    const child = obj[k];
    const ck = kindOf(child);
    const nested = ck === 'object' || ck === 'array';
    // Conditional field: hide unless its predicate (e.g. "IRQ enabled") holds.
    const vwType = path.length ? path[0] : k;
    const vw = this.schema && this.schema[vwType] && this.schema[vwType].visibleWhen;
    if (vw) {
      const parentKey = path.length ? path[path.length - 1] : null;
      const cond = (parentKey && vw[`${parentKey}.${k}`]) || vw[k];
      if (typeof cond === 'function' && !cond(this._getByPath([vwType]))) return '';
    }
    const rm = removable
      ? `<button type="button" class="sf-x" data-sf-action="remove" data-path="${escapeHtml(JSON.stringify(childPath))}" title="${escapeHtml(i18n.t('platformStructRemove') || 'Remove')}">✕</button>`
      : '';
    // Read-only derived field (e.g. GPIO count), kept in sync with the data.
    const computeFn = this._computedFn(k, path);
    if (computeFn) {
      const type = path.length ? path[0] : k;
      const val = computeFn(this._getByPath([type]));
      this._setByPath([type, k], val);
      return `<div class="sf-row">
          <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
          <div class="sf-val"><input type="text" class="form-input sf-computed" data-sf-computed="${escapeHtml(type + ':' + k)}" value="${escapeHtml(String(val))}" readonly tabindex="-1"></div>
        </div>`;
    }
    // Range-segment list (e.g. GPIO pin ranges): flat "start ~ end" rows.
    if (ck === 'array' && this._isSegments(k, path)) {
      return this._segments(child, childPath, k, path);
    }
    if (nested) {
      // Two-level grouped picker (e.g. pin-mux: category -> pin functions).
      if (ck === 'object') {
        const gp = this._groupedPicksFor(k, path);
        if (gp) return `<div class="sf-scalararr">
            <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
            ${this._groupedPicks(child, childPath, gp)}
          </div>`;
      }
      // All-scalar object → one inline row (no box): e.g. {min,max}, {rx,tx}.
      if (ck === 'object' && this.inlineObjects && Object.keys(child).length
        && Object.values(child).every(v => { const vk = kindOf(v); return vk !== 'object' && vk !== 'array'; })) {
        const fields = Object.keys(child).map(sk => {
          const node = this._node(child[sk], [...childPath, sk]);
          const lbl = `<label>${escapeHtml(this._label(sk, childPath))}</label>`;
          // Booleans: checkbox first, label after it (e.g. "☑ RX"). Others:
          // label above the control.
          return (typeof child[sk] === 'boolean')
            ? `<span class="sf-inline-field sf-inline-field--bool">${node}${lbl}</span>`
            : `<span class="sf-inline-field">${lbl}${node}</span>`;
        }).join('');
        return `<div class="sf-scalararr sf-inline-obj">
            <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
            <div class="sf-inline-fields">${fields}</div>
          </div>`;
      }
      // Capability checklist: fixed universe of TUYA_* options (schema-driven).
      const universe = ck === 'array' ? this._enumSetFor(k, path) : null;
      if (universe) {
        return `<div class="sf-scalararr sf-enumset-row">
            <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
            ${this._enumSet(child, childPath, universe)}
          </div>`;
      }
      // Complex pin groups (a group nests data-bus arrays, e.g. RGB) → repeated
      // open sections rather than a table row.
      if (ck === 'array' && this.schema && k === 'pinGroups' && child.length
        && child.some(it => it && Object.values(it).some(v => { const vk = kindOf(v); return vk === 'object' || vk === 'array'; }))) {
        return this._pinGroupSections(child, childPath);
      }
      // Object arrays (ports / channels / pinGroups) in fixed-format mode:
      // a labelled list of flat open cards, not a collapsible box. An empty
      // pin-group array still renders this way (so its "+ add" shows) when a
      // template is known.
      if (ck === 'array' && this.schema
        && (child.length ? child.every(v => kindOf(v) === 'object') : !!this._objArrayTemplate(childPath))) {
        return `<div class="sf-scalararr sf-arrwrap">
            <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
            ${this._arrayInline(child, childPath)}
          </div>`;
      }
      // Indexed pin bus (e.g. RGB r/g/b): per-pin fields labelled R0, R1, …
      if (ck === 'array' && this._isIndexedPins(k, path)) {
        return this._indexedPins(child, childPath, k);
      }
      // List of single-choice picks from a universe, displayed grouped by
      // category (e.g. pin-mux remappable functions).
      const itemUni = ck === 'array' ? this._itemEnumFor(k, path) : null;
      if (itemUni) {
        return `<div class="sf-scalararr">
            <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
            ${this._itemEnumList(child, childPath, itemUni)}
          </div>`;
      }
      const scalarArr = ck === 'array' && child.every(v => { const vk = kindOf(v); return vk !== 'object' && vk !== 'array'; });
      if (scalarArr) {
        return `<div class="sf-scalararr">
            <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
            ${this._node(child, childPath)}
          </div>`;
      }
      const count = ck === 'array' ? `<span class="sf-count">[${child.length}]</span>` : '';
      // Fixed-format groups (e.g. an LCD port's pin set) stay expanded; their
      // body is the default 4-column grid.
      const open = (path.length < 1 || this.schema) ? 'open' : '';
      return `<details class="sf-group" data-sf-path="${escapeHtml(JSON.stringify(childPath))}" ${open}>
          <summary class="sf-summary"><span class="sf-key">${escapeHtml(this._label(k, path))}</span>${count}${rm}</summary>
          <div class="sf-group-body">${this._node(child, childPath)}</div>
        </details>`;
    }
    return `<div class="sf-row">
        <label class="sf-key">${escapeHtml(this._label(k, path))}</label>
        <div class="sf-val">${this._node(child, childPath)}</div>
        ${rm}
      </div>`;
  }

  _object(obj, path, omitKeys) {
    const dp = escapeHtml(JSON.stringify(path));
    const keys = Object.keys(obj).filter(k => !omitKeys || !omitKeys.has(k));
    const removable = !omitKeys && !this.lockStructure;
    // Root level with categories → two-level grouping (display-only).
    if (path.length === 0 && this.categories) return this._categorized(obj, keys, removable);
    // Transparent keys (flattenKeys) are hoisted: their fields render inline at
    // this level, recursively, so e.g. a {type}->{spec}->fields chain shows as a
    // flat field list with no wrapper boxes. Paths are preserved for setByPath.
    const isFlat = (o, k) => this.flattenKeys && this.flattenKeys.includes(k)
      && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]);
    const hidden = (p, k) => {
      const t = p.length ? p[0] : k;
      const sc = this.schema && this.schema[t];
      return sc && sc.hide && sc.hide.includes(k);
    };
    const expand = (o, p) => {
      const out = [];
      for (const k of Object.keys(o)) {
        if (omitKeys && omitKeys.has(k)) continue;
        if (hidden(p, k)) continue; // schema-hidden (kept in data, not shown)
        if (isFlat(o, k)) out.push(...expand(o[k], [...p, k]));
        else out.push([o, k, p]);
      }
      return out;
    };
    const entries = expand(obj, path);
    // Reposition a derived `count` to render directly above the array it counts.
    const ci = entries.findIndex(([, k, p]) => k === 'count' && this.schema && this.schema[p[0]] && this.schema[p[0]].countFrom);
    if (ci !== -1) {
      const type = entries[ci][2][0];
      const cf = this.schema[type].countFrom;
      const [countEntry] = entries.splice(ci, 1);
      const ti = entries.findIndex(([, k, p]) => k === cf && p[0] === type);
      entries.splice(ti === -1 ? entries.length : ti, 0, countEntry);
    }
    const rows = entries.map(([o, k, p]) => this._renderChild(o, k, p, removable)).join('');
    const addField = (omitKeys || this.lockStructure) ? '' :
      `<button type="button" class="btn btn-sm btn-outline sf-add" data-sf-action="add-field" data-path="${dp}">+ ${escapeHtml(i18n.t('platformStructField') || 'field')}</button>`;
    return `<div class="sf-obj">${rows}${addField}</div>`;
  }

  // Group root keys under category sections (keys not in any category fall into
  // a trailing "other" section). Categories are display-only.
  _categorized(obj, keys, removable) {
    const present = new Set(keys);
    const used = new Set();
    const section = (id, label, sKeys) => {
      const body = sKeys.map(k => this._renderChild(obj, k, [], removable)).join('');
      return `<details class="sf-cat" data-sf-path="cat:${escapeHtml(id)}" open>
          <summary class="sf-cat-summary"><span class="sf-key">${escapeHtml(label)}</span><span class="sf-count">${sKeys.length}</span></summary>
          <div class="sf-cat-body sf-obj">${body}</div>
        </details>`;
    };
    let html = '';
    for (const cat of this.categories) {
      const sKeys = cat.keys.filter(k => present.has(k));
      if (!sKeys.length) continue;
      sKeys.forEach(k => used.add(k));
      html += section(cat.id, cat.label, sKeys);
    }
    const rest = keys.filter(k => !used.has(k));
    if (rest.length) html += section('__other', i18n.t('pfCatOther') || 'Other', rest);
    return `<div class="sf-cats">${html}</div>`;
  }

  // A readable title for an array-of-objects item, from identifying fields
  // (e.g. a pinout row -> "1 · GND"). Falls back to the index.
  _itemSummary(item, i) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      for (const k of ['name', 'pin', 'id']) {
        const v = item[k];
        if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') return String(v);
      }
    }
    return `#${i}`;
  }

  _array(arr, path) {
    const dp = escapeHtml(JSON.stringify(path));
    const scalarArray = arr.every(v => { const k = kindOf(v); return k !== 'object' && k !== 'array'; });
    const items = arr.map((item, i) => {
      const itemPath = [...path, i];
      const rmPath = escapeHtml(JSON.stringify(itemPath));
      if (scalarArray) {
        return `<div class="sf-arr-item sf-arr-item--scalar">
            ${this._node(item, itemPath)}
            <button type="button" class="sf-x" data-sf-action="remove" data-path="${rmPath}">✕</button>
          </div>`;
      }
      // Object/array items: collapsible, titled by identifying fields.
      return `<details class="sf-group sf-arr-obj" data-sf-path="${rmPath}">
          <summary class="sf-summary"><span class="sf-key">${escapeHtml(this._itemSummary(item, i))}</span>
            <button type="button" class="sf-x" data-sf-action="remove" data-path="${rmPath}">✕</button>
          </summary>
          <div class="sf-group-body">${this._node(item, itemPath)}</div>
        </details>`;
    }).join('');
    return `<div class="sf-arr">${items}
        <button type="button" class="btn btn-sm btn-outline sf-add" data-sf-action="add" data-path="${dp}">+ ${escapeHtml(this._addLabel(path))}</button>
      </div>`;
  }

  // An object array (fixed-format mode). Flat records (all-scalar items, e.g.
  // pin groups / channels / partitions) render as a compact table; items that
  // themselves nest (e.g. a UART port with its own pin groups) render as light
  // cards, so there's never a card-inside-a-card.
  _arrayInline(arr, path) {
    const addBtn = `<button type="button" class="btn btn-sm btn-outline sf-add" data-sf-action="add" data-path="${escapeHtml(JSON.stringify(path))}">+ ${escapeHtml(this._addLabel(path))}</button>`;
    const flat = arr.every(it => it && typeof it === 'object' && !Array.isArray(it)
      && Object.values(it).every(v => { const k = kindOf(v); return k !== 'object' && k !== 'array'; }));
    if (flat) return `<div class="sf-tblwrap">${this._table(arr, path)}${addBtn}</div>`;
    const items = arr.map((item, i) => {
      const rmPath = escapeHtml(JSON.stringify([...path, i]));
      return `<div class="sf-item">
          <div class="sf-item-hdr"><button type="button" class="sf-x" data-sf-action="remove" data-path="${rmPath}">✕</button></div>
          <div class="sf-item-body">${this._node(item, [...path, i])}</div>
        </div>`;
    }).join('');
    return `<div class="sf-arr-open">${items}${addBtn}</div>`;
  }

  // Complex pin groups (e.g. RGB alternate mappings, where a group itself nests
  // data-bus arrays): repeated open "Pin Group N" sections, each the 4-col pin
  // grid; "+ Pin Group" adds another, each removable.
  _pinGroupSections(arr, path) {
    const label = this._label('pinGroups', path.slice(0, -1));
    const sections = arr.map((grp, i) => {
      const ipPath = escapeHtml(JSON.stringify([...path, i]));
      return `<details class="sf-group sf-pingrp" data-sf-path="${ipPath}" open>
          <summary class="sf-summary"><span class="sf-key">${escapeHtml(`${label} ${i + 1}`)}</span>
            <button type="button" class="sf-x" data-sf-action="remove" data-path="${ipPath}">✕</button>
          </summary>
          <div class="sf-group-body">${this._node(grp, [...path, i])}</div>
        </details>`;
    }).join('');
    return `<div class="sf-scalararr sf-pingrps">${sections}
        <button type="button" class="btn btn-sm btn-outline sf-add" data-sf-action="add" data-path="${escapeHtml(JSON.stringify(path))}">+ ${escapeHtml(label)}</button>
      </div>`;
  }

  // Localized noun for an array's "+ add" button (e.g. "端口" / "引脚组"); falls
  // back to the generic "item" when no friendly label is known.
  _addLabel(path) {
    const key = path[path.length - 1];
    // Value lists (combobox items, e.g. data-bus widths) use the generic noun,
    // not the array's own name.
    if (this._comboSuggestFor(key, path.slice(0, -1))) return i18n.t('platformStructItem') || 'item';
    if (this.schema && key) {
      const lbl = this._label(key, path.slice(0, -1));
      if (lbl && lbl !== key) return lbl;
    }
    return i18n.t('platformStructItem') || 'item';
  }

  // True when a scalar array's elements are an indexed pin bus (e.g. RGB r/g/b),
  // rendered as per-pin fields labelled R0, R1, …
  _isIndexedPins(key, path) {
    const type = (path && path.length) ? path[0] : null;
    const sc = type && this.schema ? this.schema[type] : null;
    return !!(sc && sc.indexedPins && sc.indexedPins.includes(key));
  }

  // Indexed pin bus: each element a small field labelled <KEY><i> (R0, R1, …).
  // The bus width is hardware-fixed, so pins aren't individually added/removed.
  _indexedPins(arr, path, key) {
    const prefix = String(key).toUpperCase();
    const cells = (Array.isArray(arr) ? arr : []).map((v, i) =>
      `<div class="sf-idxpin">
          <label class="sf-key">${escapeHtml(prefix + i)}</label>
          ${this._node(v, [...path, i])}
        </div>`
    ).join('');
    return `<div class="sf-scalararr sf-idxpins"><div class="sf-idxpin-list">${cells}</div></div>`;
  }

  // A list whose items are single-choice picks from a (possibly grouped)
  // universe, displayed bucketed by category — e.g. pin-mux remappable
  // functions shown under I2C / UART / SPI / … headers. Data stays a flat array.
  _itemEnumList(arr, path, uni) {
    const groups = (uni.length && typeof uni[0] === 'object') ? uni : [{ group: '', vals: uni }];
    const catOf = (v) => { const s = String(v); for (const g of groups) if (g.vals.includes(s)) return g.group; return null; };
    const item = (i) => `<div class="sf-ie-item">${this._node(arr[i], [...path, i])}<button type="button" class="sf-x" data-sf-action="remove" data-path="${escapeHtml(JSON.stringify([...path, i]))}">✕</button></div>`;
    const buckets = new Map();
    const other = [];
    arr.forEach((v, i) => { const c = catOf(v); if (c != null) { if (!buckets.has(c)) buckets.set(c, []); buckets.get(c).push(i); } else other.push(i); });
    const cat = (label, idxs) => `<div class="sf-ie-cat"><div class="sf-ie-cat-label">${escapeHtml(label)}</div><div class="sf-ie-cat-items">${idxs.map(item).join('')}</div></div>`;
    let html = '';
    for (const g of groups) { const idxs = buckets.get(g.group); if (idxs && idxs.length) html += cat(g.group, idxs); }
    if (other.length) html += cat(i18n.t('pfCatOther') || 'Other', other);
    return `<div class="sf-ielist">${html}
        <button type="button" class="btn btn-sm btn-outline sf-add" data-sf-action="add" data-path="${escapeHtml(JSON.stringify(path))}">+ ${escapeHtml(i18n.t('platformStructItem') || 'item')}</button>
      </div>`;
  }

  // Two-level picker for an object { categoryId: [picks] }: each present
  // category is a section of single-choice selects (scoped to that category's
  // options) with "+ pin"; a trailing selector adds a new category. Used by
  // pin-mux remappable functions.
  _groupedPicks(mapObj, path, groups) {
    const obj = (mapObj && typeof mapObj === 'object') ? mapObj : {};
    const lbl = (o) => String(o).replace(/^TUYA_/, '');
    const sel = (val, p, vals) => {
      const cur = val == null ? '' : String(val);
      const known = vals.includes(cur);
      const opts = (cur && !known ? `<option value="${escapeHtml(cur)}" selected>${escapeHtml(lbl(cur))}</option>` : '')
        + vals.map(o => `<option value="${escapeHtml(o)}"${o === cur ? ' selected' : ''}>${escapeHtml(lbl(o))}</option>`).join('');
      return `<select class="form-input sf-leaf" data-path="${escapeHtml(JSON.stringify(p))}" data-kind="string">${opts}</select>`;
    };
    let html = '';
    for (const g of groups) {
      if (!(g.id in obj)) continue;
      const funcs = Array.isArray(obj[g.id]) ? obj[g.id] : [];
      const items = funcs.map((v, i) =>
        `<div class="sf-ie-item">${sel(v, [...path, g.id, i], g.vals)}<button type="button" class="sf-x" data-sf-action="remove" data-path="${escapeHtml(JSON.stringify([...path, g.id, i]))}">✕</button></div>`).join('');
      html += `<div class="sf-gp-cat">
          <div class="sf-gp-cat-head"><span class="sf-gp-cat-label">${escapeHtml(g.label)}</span>
            <button type="button" class="sf-x" data-sf-action="remove" data-path="${escapeHtml(JSON.stringify([...path, g.id]))}" title="${escapeHtml(i18n.t('platformStructRemove') || 'Remove')}">✕</button></div>
          <div class="sf-ie-cat-items">${items}</div>
          <button type="button" class="btn btn-sm btn-outline sf-add" data-sf-action="add-pick" data-path="${escapeHtml(JSON.stringify([...path, g.id]))}">+ ${escapeHtml(i18n.t('pfPmAddFunc') || 'pin')}</button>
        </div>`;
    }
    const avail = groups.filter(g => !(g.id in obj));
    const addCat = avail.length
      ? `<select class="sf-addcat" data-path="${escapeHtml(JSON.stringify(path))}"><option value="">+ ${escapeHtml(i18n.t('pfPmAddCat') || 'category')}</option>${avail.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.label)}</option>`).join('')}</select>`
      : '';
    return `<div class="sf-gpicks">${html}${addCat}</div>`;
  }

  // Template object for adding to a known object-array (e.g. a pin group →
  // {scl:null, sda:null}); null if the array's item shape is unknown.
  _objArrayTemplate(path) {
    const key = path[path.length - 1];
    const type = path[0];
    const tpl = this.schema && this.schema[type] && this.schema[type].templates && this.schema[type].templates[key];
    if (key === 'pinGroups') {
      const cfg = this._pinCfg(path); // backend-aware pin fields
      if (cfg && cfg.fields) {
        const o = {};
        for (const f of Object.keys(cfg.fields)) o[f] = null;
        return o;
      }
      // Peripherals whose pin groups aren't simple flat fields (RGB/8080/DVP
      // indexed buses) carry an explicit pinGroups template in the schema.
      if (tpl) return JSON.parse(JSON.stringify(tpl));
      return null;
    }
    // ports / channels: fixed per-type template (determines the structure of a
    // newly-added entry — never cloned from existing ones).
    if (tpl) return JSON.parse(JSON.stringify(tpl));
    return null;
  }

  // Compact table for a flat object array: a column per field (union of keys),
  // a row per item, each cell an inline editor. Trailing column = remove.
  _table(arr, path) {
    const cols = [];
    // Pin-group tables always show the peripheral's full pin-field set (e.g.
    // tx/rx/cts/rts), so a group that lacks some just leaves those cells empty.
    const key = path[path.length - 1];
    if (key === 'pinGroups') {
      const cfg = this._pinCfg(path); // backend-aware (SPI-as-QSPI → clk/cs/d0…)
      if (cfg && cfg.fields) Object.keys(cfg.fields).forEach(c => cols.push(c));
    }
    arr.forEach(it => Object.keys(it).forEach(k => { if (!cols.includes(k)) cols.push(k); }));
    const rc = (this.schema && this.schema[path[0]] && this.schema[path[0]].rowComputed) || null;
    const head = cols.map(c => `<th>${escapeHtml(this._label(c, [...path, 0]))}</th>`).join('') + '<th></th>';
    const rows = arr.map((it, i) => {
      const tds = cols.map(c => {
        // Derived cell (e.g. flash partition size from its addresses): read-only.
        if (rc && rc[c]) return `<td>${this._rowComputedCell(it, [...path, i], c, rc[c])}</td>`;
        return `<td>${this._node(it[c] === undefined ? null : it[c], [...path, i, c])}</td>`;
      }).join('');
      return `<tr>${tds}<td class="sf-tbl-x"><button type="button" class="sf-x" data-sf-action="remove" data-path="${escapeHtml(JSON.stringify([...path, i]))}">✕</button></td></tr>`;
    }).join('');
    return `<table class="sf-tbl"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function platformImageSrc(item) {
  const url = item?.image?.url;
  if (!url) return null;
  return `/api/platform-images/${url.replace(/^images\//, '')}`;
}

// Identical to the board card placeholder (board-editor.js) — keep in sync.
const platformImagePlaceholder = () => `
  <svg class="board-card-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <path d="M21 15l-5-5L5 21"></path>
  </svg>
  <span class="board-card-placeholder-text">${escapeHtml(i18n.t('boardNoImage') || 'No image')}</span>`;

// One card per item (variant/chip). Mirrors the board card.
export function renderPlatformCard(item) {
  const imageUrl = platformImageSrc(item);
  const title = getLocalizedString(item.name) || item.id;
  const imageInner = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}">`
    : platformImagePlaceholder();
  // Show the platform group only when it differs from the item id (multi-variant).
  const groupBadge = (item.platformId && item.platformId !== item.id)
    ? `<span class="board-card-platform">${escapeHtml(item.platformId)}</span>` : '';
  const isUnpublished = item.published === false;
  return `
    <div class="board-card ${isUnpublished ? 'board-card--unpublished' : ''}" data-platform-id="${escapeHtml(item.id)}">
      ${isUnpublished ? '<span class="board-card-unpublished-badge">Unpublished / 未发布</span>' : ''}
      <div class="board-card-image${imageUrl ? '' : ' board-card-image--empty'}">${imageInner}</div>
      <div class="board-card-header">
        <div>
          <div class="board-card-title">${escapeHtml(title)}</div>
          <div class="board-card-id">${escapeHtml(item.id)}</div>
        </div>
        ${groupBadge}
      </div>
      ${item.summary ? `<p class="board-card-summary">${escapeHtml(getLocalizedString(item.summary))}</p>` : ''}
      <div class="board-card-footer">
        <button class="btn btn-sm btn-outline platform-edit-btn" data-platform-id="${escapeHtml(item.id)}">✏️ ${escapeHtml(i18n.t('editBtn') || 'Edit')}</button>
        <button class="btn btn-sm btn-danger platform-delete-btn" data-platform-id="${escapeHtml(item.id)}">🗑️ ${escapeHtml(i18n.t('deleteBtn') || 'Delete')}</button>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Peripheral cards (one card per peripheral the chip has)
// ---------------------------------------------------------------------------

// { peripherals, pinout, schema, mountEl } — set by mountPlatformForm.
let _peri = null;
let _periModal = null;

function periTypeLabel(type) {
  return (_peri && _peri.schema[type] && _peri.schema[type].title) || type;
}

function renderPeriCards() {
  if (!_peri || !_peri.mountEl) return;
  const known = Object.keys(_peri.schema);
  // Known types first (catalog order), then any unrecognized ones present.
  const present = Object.keys(_peri.peripherals);
  const types = [...known.filter(t => present.includes(t)), ...present.filter(t => !known.includes(t))];
  const cards = types.map(t => `
    <div class="peri-card" data-type="${escapeHtml(t)}">
      <div class="peri-card-info">
        <div class="peri-card-name"><span class="peri-card-type-badge">${escapeHtml(t)}</span> ${escapeHtml(periTypeLabel(t))}</div>
        ${typeof _peri.peripherals[t]?.count === 'number' ? `<div class="peri-card-meta">× ${_peri.peripherals[t].count}</div>` : ''}
      </div>
      <div class="peri-card-actions">
        <button type="button" class="btn btn-sm btn-outline peri-card-edit" data-type="${escapeHtml(t)}">${escapeHtml(i18n.t('editBtn') || 'Edit')}</button>
        <button type="button" class="btn btn-sm btn-danger peri-card-delete" data-type="${escapeHtml(t)}">${escapeHtml(i18n.t('deleteBtn') || 'Delete')}</button>
      </div>
    </div>`).join('');
  _peri.mountEl.innerHTML = `
    <div class="peri-list-header">
      <span class="peri-list-count">${types.length} ${escapeHtml(i18n.t('pfPeriCount') || 'peripherals')}</span>
      <button type="button" class="btn btn-primary btn-sm" id="pfPeriAddBtn">+ ${escapeHtml(i18n.t('pfPeriAdd') || 'Add peripheral')}</button>
    </div>
    ${types.length ? `<div class="peri-list">${cards}</div>` : `<div class="peri-empty">${escapeHtml(i18n.t('pfPeriEmpty') || 'No peripherals yet')}</div>`}`;
  _peri.mountEl.querySelector('#pfPeriAddBtn').addEventListener('click', openPeriAdd);
  _peri.mountEl.querySelectorAll('.peri-card-edit').forEach(b => b.addEventListener('click', () => openPeriForm(b.dataset.type, false)));
  _peri.mountEl.querySelectorAll('.peri-card-delete').forEach(b => b.addEventListener('click', () => deletePeri(b.dataset.type)));
}

function deletePeri(type) {
  if (!confirm(`${i18n.t('deleteBtn') || 'Delete'} "${periTypeLabel(type)}"?`)) return;
  delete _peri.peripherals[type];
  renderPeriCards();
  if (_state && !_state.isNew) savePlatformForm();
}

function ensurePeriModal() {
  if (_periModal) return;
  _periModal = document.createElement('div');
  _periModal.className = 'modal hidden';
  _periModal.style.zIndex = '1100';
  _periModal.innerHTML = `
    <div class="modal-content" style="max-width:780px;width:94%;">
      <div class="modal-header"><h2 id="pfPeriModalTitle"></h2><button type="button" class="close-btn" id="pfPeriModalClose">&times;</button></div>
      <div class="modal-body" id="pfPeriModalBody" style="max-height:72vh;overflow-y:auto;"></div>
      <div class="modal-footer" id="pfPeriModalFooter"></div>
    </div>`;
  document.body.appendChild(_periModal);
  _periModal.querySelector('#pfPeriModalClose').addEventListener('click', closePeriModal);
  _periModal.addEventListener('mousedown', (e) => { if (e.target === _periModal) closePeriModal(); });
}

function closePeriModal() { if (_periModal) _periModal.classList.add('hidden'); }

// Step 1 of add: pick a peripheral type not already present.
function openPeriAdd() {
  ensurePeriModal();
  const present = new Set(Object.keys(_peri.peripherals));
  const prov = (t) => !!(_peri.schema[t] && _peri.schema[t].provisional);
  // Not-yet-supported (provisional) types sort to the end of the list.
  const avail = Object.keys(_peri.schema).filter(t => !present.has(t))
    .sort((a, b) => (prov(a) ? 1 : 0) - (prov(b) ? 1 : 0));
  _periModal.querySelector('#pfPeriModalTitle').textContent = i18n.t('pfPeriAdd') || 'Add peripheral';
  _periModal.querySelector('#pfPeriModalFooter').style.display = 'none';
  const body = _periModal.querySelector('#pfPeriModalBody');
  if (!avail.length) {
    body.innerHTML = `<div class="peri-empty">${escapeHtml(i18n.t('pfPeriAllAdded') || 'All peripherals added')}</div>`;
  } else {
    body.innerHTML = `<div class="peri-type-grid">${avail.map(t => {
      const prov = _peri.schema[t] && _peri.schema[t].provisional;
      return `<button type="button" class="peri-type-card${prov ? ' peri-type-card--disabled' : ''}" data-type="${escapeHtml(t)}"${prov ? ' disabled' : ''}>
        <span class="peri-type-card-name">${escapeHtml(periTypeLabel(t))}</span>
        <span class="peri-type-card-ifaces">${escapeHtml(prov ? (i18n.t('pfProvisional') || 'Not available yet') : t)}</span>
      </button>`;
    }).join('')}</div>`;
    body.querySelectorAll('.peri-type-card:not(.peri-type-card--disabled)').forEach(c =>
      c.addEventListener('click', () => openPeriForm(c.dataset.type, true)));
  }
  _periModal.classList.remove('hidden');
}

// Edit (or add) one peripheral in a modal. Edits a clone; commits on Save so
// Cancel discards. Rooted at a { [type]: data } wrapper and flattened, so the
// schema/pin-pickers (keyed on the first path segment = type) keep working and
// the form shows the peripheral's fields directly with no wrapper boxes.
function openPeriForm(type, isNew) {
  ensurePeriModal();
  const source = isNew ? (PERIPHERAL_SCHEMA[type] && PERIPHERAL_SCHEMA[type].def) || {} : _peri.peripherals[type] || {};
  const temp = JSON.parse(JSON.stringify(source));
  delete temp.enabled; // presence = enabled; not user-editable
  // When the peripheral's ports use pin groups, give every port a pinGroups
  // array (even empty) so a port without one still shows its "+ add".
  const ports = temp && temp.spec && temp.spec.ports;
  if (Array.isArray(ports) && ports.some(p => p && Array.isArray(p.pinGroups))) {
    ports.forEach(p => { if (p && !Array.isArray(p.pinGroups)) p.pinGroups = []; });
  }
  const wrapper = { [type]: temp };

  _periModal.querySelector('#pfPeriModalTitle').textContent =
    `${isNew ? (i18n.t('pfPeriAdd') || 'Add') : (i18n.t('editBtn') || 'Edit')} · ${periTypeLabel(type)}`;
  const body = _periModal.querySelector('#pfPeriModalBody');
  const note = _peri.schema[type] && _peri.schema[type].note;
  const noteHtml = note ? `<div class="pf-peri-note">
      ${note.title ? `<div class="pf-peri-note-title">${escapeHtml(note.title)}</div>` : ''}
      <ul>${note.items.map(it => `<li><span class="pf-peri-note-term">${escapeHtml(it.term)}</span><span class="pf-peri-note-desc">${escapeHtml(it.desc)}</span></li>`).join('')}</ul>
    </div>` : '';
  body.innerHTML = `<div id="pfPeriFormMount" class="pf-struct"></div>${noteHtml}`;
  const footer = _periModal.querySelector('#pfPeriModalFooter');
  footer.style.display = '';
  footer.innerHTML = `
    <button type="button" class="btn btn-outline" id="pfPeriCancel">${escapeHtml(i18n.t('cancelBtn') || 'Cancel')}</button>
    <button type="button" class="btn btn-primary" id="pfPeriSave">${escapeHtml(i18n.t('platformSaveBtn') || 'Save')}</button>`;

  new StructEditor(wrapper, {
    pinout: _peri.pinout,
    schema: _peri.schema,
    lockStructure: true,
    flattenKeys: [type, 'spec', ...((_peri.schema[type] && _peri.schema[type].flatten) || [])],
    inlineObjects: true,
  }).mount(body.querySelector('#pfPeriFormMount'));

  footer.querySelector('#pfPeriCancel').addEventListener('click', closePeriModal);
  footer.querySelector('#pfPeriSave').addEventListener('click', async () => {
    const def = PERIPHERAL_SCHEMA[type];
    if (def && def.def && ('enabled' in def.def)) wrapper[type].enabled = true; // present = enabled
    _peri.peripherals[type] = wrapper[type];
    closePeriModal();
    renderPeriCards();
    // Persist to disk now (like the board peripheral editor), so the change
    // survives navigating away and back. New platforms persist on first create.
    if (_state && !_state.isNew) await savePlatformForm();
  });
  _periModal.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

let _state = null; // { isNew, editor }

function i18nPair(idBase, labelKey, en, zh, { textarea } = {}) {
  const valEn = escapeHtml(en || '');
  const valZh = escapeHtml(zh || '');
  const mk = (id, val, langLabel) => textarea
    ? `<label class="form-label">${escapeHtml(i18n.t(labelKey))} <span class="pf-lang">${langLabel}</span></label>
       <textarea id="${id}" class="form-textarea" style="min-height:64px">${val}</textarea>`
    : `<label class="form-label">${escapeHtml(i18n.t(labelKey))} <span class="pf-lang">${langLabel}</span></label>
       <input type="text" id="${id}" class="form-input" value="${val}">`;
  return `<div class="form-group form-row-2col">
      <div class="form-col-half">${mk(`${idBase}En`, valEn, 'EN')}</div>
      <div class="form-col-half">${mk(`${idBase}Zh`, valZh, '中文')}</div>
    </div>`;
}

// Minimal "create platform" form: only the essential identity fields. On
// success the backend seeds the rest from the template; the caller then opens
// the full editor (onCreated(newId)). Cancel calls onCreated(null).
export function mountNewPlatformForm(container, { onCreated } = {}) {
  const ro = '^[a-z0-9][a-z0-9\\-]*$';
  container.innerHTML = `
    <form id="platformCreateForm" class="board-form" style="max-width:none;width:100%;padding:20px">
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label required">${escapeHtml(i18n.t('platformId'))}</label>
          <input type="text" id="npId" class="form-input" pattern="${ro}" placeholder="esp32c3">
          <small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformIdHint'))}</small>
        </div>
        <div class="form-col-half">
          <label class="form-label required">${escapeHtml(i18n.t('platformGroupId'))}</label>
          <input type="text" id="npPlatformId" class="form-input" pattern="${ro}" placeholder="esp32">
          <small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformGroupIdHint'))}</small>
        </div>
      </div>
      ${i18nPair('npName', 'platformName', '', '')}
      ${i18nPair('npSummary', 'platformSummary', '', '', { textarea: true })}
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label">${escapeHtml(i18n.t('platformArchLabel'))}</label>
          <select id="npArch" class="form-select">${selectOptions(ARCH_OPTIONS, '')}</select>
        </div>
        <div class="form-col-half">
          <label class="form-label">${escapeHtml(i18n.t('platformFlashBusLabel'))}</label>
          <select id="npFlash" class="form-select">${selectOptions(FLASH_INTERFACE_OPTIONS, '')}</select>
        </div>
      </div>
      <div class="form-actions" style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;padding-top:20px;border-top:1px solid var(--color-border)">
        <button type="button" id="npCancel" class="btn btn-outline">${escapeHtml(i18n.t('cancelBtn'))}</button>
        <button type="submit" class="btn btn-primary">${escapeHtml(i18n.t('platformCreateBtn'))}</button>
      </div>
    </form>`;

  const q = (id) => document.getElementById(id)?.value?.trim() || '';
  const pair = (base) => { const en = q(`${base}En`); const zh = q(`${base}Zh`); const o = {}; if (en) o.en = en; if (zh) o['zh-CN'] = zh; return o; };

  container.querySelector('#platformCreateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = q('npId');
    const name = pair('npName');
    if (!id) { showError('Validation Error', i18n.t('platformIdRequired') || 'Platform id is required'); return; }
    if (!name.en && !name['zh-CN']) { showError('Validation Error', i18n.t('platformNameRequired') || 'Platform name is required'); return; }
    // Start with no peripherals (add them as needed) — overrides the template's
    // full set so the add-peripheral dialog isn't empty on a fresh platform.
    const detail = { peripherals: {} };
    if (q('npArch')) detail.arch = q('npArch');
    if (q('npFlash')) detail.flashInterface = q('npFlash');
    try {
      await apiClient.createPlatform({ id, platformId: q('npPlatformId') || id, name, summary: pair('npSummary'), detail, autoCommit: true });
      showNotification(`Platform "${id}" created`);
      if (onCreated) onCreated(id);
    } catch (error) {
      showError('Create Failed', error.message);
    }
  });
  container.querySelector('#npCancel').addEventListener('click', () => { if (onCreated) onCreated(null); });
}

export function mountPlatformForm(container, platform, detail, { isNew } = {}) {
  const idVal = platform?.id || '';
  const platformIdVal = platform?.platformId || idVal;
  const name = platform?.name || {};
  const summary = platform?.summary || {};
  const imageUrl = platform?.image?.url || '';
  const platformSymbolVal = detail?.platformSymbol || '';
  const archVal = detail?.arch || '';
  const flashInterfaceVal = detail?.flashInterface || '';
  // Memory is stored in bytes but edited in KB for convenience.
  const mem = (detail && typeof detail.memory === 'object' && detail.memory) ? detail.memory : {};
  const bytesToKb = (b) => (typeof b === 'number' ? String(b / 1024) : '');
  // Connectivity is now a set of supported-protocol flags. Tolerate the legacy
  // shape ({ wifi: { enabled } }) when reading existing data.
  const conn = (detail && typeof detail.connectivity === 'object' && detail.connectivity) ? detail.connectivity : {};
  const protoOn = (v) => (v && typeof v === 'object' ? !!v.enabled : !!v);
  // Power: flat fields with fixed units (units baked into labels, not editable).
  const pow = (detail && typeof detail.power === 'object' && detail.power) ? detail.power : {};
  const pVdd = pow.vdd || {}, pIo = pow.ioLevel || {}, pDs = pow.deepSleepCurrent || {}, pAc = pow.activeCurrent || {};
  const numv = (x) => (typeof x === 'number' ? String(x) : '');

  const overviewHtml = `
    <div class="pf-section">
      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label required">${escapeHtml(i18n.t('platformId'))}</label>
          <input type="text" id="pfId" class="form-input" pattern="^[a-z0-9][a-z0-9\\-]*$"
            value="${escapeHtml(idVal)}" placeholder="esp32c3"
            ${isNew ? '' : 'readonly aria-readonly="true" style="background:var(--color-hover);cursor:not-allowed"'}>
          <small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformIdHint'))}</small>
        </div>
        <div class="form-col-half">
          <label class="form-label required">${escapeHtml(i18n.t('platformGroupId'))}</label>
          <input type="text" id="pfPlatformId" class="form-input" pattern="^[a-z0-9][a-z0-9\\-]*$"
            value="${escapeHtml(platformIdVal)}" placeholder="esp32"
            ${isNew ? '' : 'readonly aria-readonly="true" style="background:var(--color-hover);cursor:not-allowed"'}>
          <small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformGroupIdHint'))}</small>
        </div>
      </div>
      ${i18nPair('pfName', 'platformName', name.en, name['zh-CN'])}
      ${i18nPair('pfSummary', 'platformSummary', summary.en, summary['zh-CN'], { textarea: true })}

      <!-- Published Toggle (kept directly above the SDK selector, mirrors boards) -->
      <div class="form-group" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--color-hover); border-radius: 6px;">
        <input type="checkbox" id="pfPublished" name="published" ${platform?.published !== false ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        <label for="pfPublished" style="margin: 0; cursor: pointer; font-weight: 500;">${escapeHtml(i18n.t('boardPublished'))}</label>
        <small style="color: var(--color-muted); margin-left: auto;">${escapeHtml(i18n.t('boardPublishedHint'))}</small>
      </div>
      <div class="form-group">
        <label class="form-label">${escapeHtml(i18n.t('skillSdks'))}</label>
        <div class="skill-sdks-checks">${['tuyaopen', 'tuyaos'].map((v) => `<label class="skill-sdk-check"><input type="checkbox" class="platform-sdk-cb" value="${v}" ${(platform?.sdks || []).includes(v) ? 'checked' : ''}> ${v}</label>`).join('')}</div>
        <small style="color: var(--color-muted);">${escapeHtml(i18n.t('skillSdksHint'))}</small>
      </div>

      <div class="form-group form-row-2col">
        <div class="form-col-half">
          <label class="form-label" for="pfArch">${escapeHtml(i18n.t('platformArchLabel'))}</label>
          <select id="pfArch" class="form-select">${selectOptions(ARCH_OPTIONS, archVal)}</select>
          <small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformArchHint'))}</small>
        </div>
        <div class="form-col-half">
          <label class="form-label" for="pfFlashInterface">${escapeHtml(i18n.t('platformFlashBusLabel'))}</label>
          <select id="pfFlashInterface" class="form-select">${selectOptions(FLASH_INTERFACE_OPTIONS, flashInterfaceVal)}</select>
          <small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformFlashBusHint'))}</small>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="pfPlatformSymbol">${escapeHtml(i18n.t('platformSymbolLabel'))}</label>
        <input type="text" id="pfPlatformSymbol" class="form-input" pattern="^[A-Z0-9][A-Z0-9_.]*$"
          value="${escapeHtml(platformSymbolVal)}" placeholder="T5AI">
        <small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformSymbolHint'))}</small>
      </div>

      <div class="pf-subsection">
        <div class="pf-subsection-title">${escapeHtml(i18n.t('platformMemoryTitle'))}</div>
        <div class="form-group form-row-2col">
          <div class="form-col-half">
            <label class="form-label" for="pfMemSram">${escapeHtml(i18n.t('pfmSram'))}</label>
            <input type="number" min="0" step="1" id="pfMemSram" class="form-input" value="${bytesToKb(mem.sramBytes)}">
          </div>
          <div class="form-col-half">
            <label class="form-label" for="pfMemRom">${escapeHtml(i18n.t('pfmRom'))}</label>
            <input type="number" min="0" step="1" id="pfMemRom" class="form-input" value="${bytesToKb(mem.romBytes)}">
          </div>
        </div>
        <div class="form-group form-row-2col">
          <div class="form-col-half">
            <label class="form-label" for="pfMemFlash">${escapeHtml(i18n.t('pfmFlash'))}</label>
            <input type="number" min="0" step="1" id="pfMemFlash" class="form-input" value="${bytesToKb(mem.flashMaxBytes)}">
          </div>
          <div class="form-col-half">
            <label class="form-label" for="pfMemPsram">${escapeHtml(i18n.t('pfmPsram'))}</label>
            <input type="number" min="0" step="1" id="pfMemPsram" class="form-input" value="${bytesToKb(mem.psramMaxBytes)}">
          </div>
        </div>
        <div class="form-group" style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="pfMemEfuse" ${mem.efuse ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;">
          <label for="pfMemEfuse" style="margin:0;cursor:pointer;">${escapeHtml(i18n.t('pfmEfuse'))}</label>
        </div>
      </div>
      <div class="pf-subsection">
        <div class="pf-subsection-title">${escapeHtml(i18n.t('platformConnTitle'))}</div>
        <div class="form-group" style="display:flex;flex-wrap:wrap;gap:18px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="pfConnWifi" ${protoOn(conn.wifi) ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;"> ${escapeHtml(i18n.t('pfcWifi'))}</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="pfConnBle" ${protoOn(conn.ble) ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;"> ${escapeHtml(i18n.t('pfcBle'))}</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="pfConnEthernet" ${protoOn(conn.ethernet) ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;"> ${escapeHtml(i18n.t('pfcEthernet'))}</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="pfConnCellular" ${protoOn(conn.cellular) ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;"> ${escapeHtml(i18n.t('pfcCellular'))}</label>
        </div>
      </div>
      <div class="pf-subsection">
        <div class="pf-subsection-title">${escapeHtml(i18n.t('platformPowerTitle'))}</div>
        <div class="pf-power">
          <div class="pf-power-row">
            <label class="pf-power-label">${escapeHtml(i18n.t('pfpwVdd'))}</label>
            <span class="pf-power-fields">
              <span><label>${escapeHtml(i18n.t('pfhwMin'))}</label><input type="number" step="any" id="pfPwVddMin" class="form-input" value="${numv(pVdd.min)}"></span>
              <span><label>${escapeHtml(i18n.t('pfhwTypical'))}</label><input type="number" step="any" id="pfPwVddTyp" class="form-input" value="${numv(pVdd.typical)}"></span>
              <span><label>${escapeHtml(i18n.t('pfhwMax'))}</label><input type="number" step="any" id="pfPwVddMax" class="form-input" value="${numv(pVdd.max)}"></span>
            </span>
          </div>
          <div class="pf-power-row">
            <label class="pf-power-label">${escapeHtml(i18n.t('pfpwIoLevel'))}</label>
            <span class="pf-power-fields">
              <span><label>${escapeHtml(i18n.t('pfhwMin'))}</label><input type="number" step="any" id="pfPwIoMin" class="form-input" value="${numv(pIo.min)}"></span>
              <span><label>${escapeHtml(i18n.t('pfhwMax'))}</label><input type="number" step="any" id="pfPwIoMax" class="form-input" value="${numv(pIo.max)}"></span>
            </span>
          </div>
          <div class="pf-power-row">
            <label class="pf-power-label">${escapeHtml(i18n.t('pfpwDeepSleep'))}</label>
            <span class="pf-power-fields">
              <span><label>${escapeHtml(i18n.t('pfhwTypical'))}</label><input type="number" step="any" id="pfPwDsTyp" class="form-input" value="${numv(pDs.typical)}"></span>
            </span>
          </div>
          <div class="pf-power-row">
            <label class="pf-power-label">${escapeHtml(i18n.t('pfpwActive'))}</label>
            <span class="pf-power-fields">
              <span><label>${escapeHtml(i18n.t('pfcWifi'))}</label><input type="number" step="any" id="pfPwAcWifi" class="form-input" value="${numv(pAc.wifi)}"></span>
              <span><label>${escapeHtml(i18n.t('pfcBle'))}</label><input type="number" step="any" id="pfPwAcBle" class="form-input" value="${numv(pAc.ble)}"></span>
            </span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${escapeHtml(i18n.t('platformImage'))}</label>
        ${isNew ? `<small style="color:var(--color-muted)">${escapeHtml(i18n.t('platformImageSaveFirst'))}</small>` : `
          <div class="image-upload-inline" id="platformImageUploadSection">
            <div style="display:flex;gap:8px;margin-bottom:12px;border-bottom:1px solid var(--color-border);padding-bottom:8px;">
              <button type="button" class="image-source-tab active" data-source="file" style="background:none;border:none;padding:8px;cursor:pointer;font-weight:500;color:var(--color-primary);">${escapeHtml(i18n.t('platformImageUploadFile'))}</button>
              <button type="button" class="image-source-tab" data-source="url" style="background:none;border:none;padding:8px;cursor:pointer;font-weight:500;color:var(--color-muted);">${escapeHtml(i18n.t('platformImageFromUrl'))}</button>
            </div>
            <div id="platformImageSourceFile" class="image-source-content">
              <div class="image-upload-zone" data-platform-id="${escapeHtml(idVal)}">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p class="upload-text">${escapeHtml(i18n.t('platformImageDrop'))}</p>
                <p class="image-recommendation">${escapeHtml(i18n.t('platformImageRecommend'))}</p>
                <input type="file" id="platformImageInput" style="display:none;" accept="image/*">
              </div>
            </div>
            <div id="platformImageSourceUrl" class="image-source-content" style="display:none;">
              <input type="url" id="platformImageUrl" class="form-input url-input" placeholder="https://example.com/image.jpg" style="margin-bottom:8px;">
              <small style="color:var(--color-muted);display:block;margin-bottom:8px;">${escapeHtml(i18n.t('platformImageUrlHint'))}</small>
              <div style="display:flex;gap:8px;">
                <button type="button" id="platformConfirmUrlBtn" class="btn btn-primary">${escapeHtml(i18n.t('platformImageUseUrl'))}</button>
              </div>
            </div>
            ${imageUrl ? `
              <div class="current-image-preview" id="platformCurrentImage" style="margin-top:12px;padding:12px;background-color:var(--color-hover);border-radius:8px;text-align:center;">
                <img src="/api/platform-images/${escapeHtml(imageUrl.replace(/^images\//, ''))}" alt="Current platform image" style="max-width:200px;max-height:200px;object-fit:contain;border-radius:4px;border:1px solid var(--color-border);">
                <small style="display:block;margin-top:8px;color:var(--color-muted);">${escapeHtml(i18n.t('platformImageCurrentLabel'))}: ${escapeHtml(imageUrl)}</small>
                <button type="button" class="btn btn-sm btn-danger" id="platformDeleteImageBtn" style="margin-top:8px;">${escapeHtml(i18n.t('platformImageDelete'))}</button>
              </div>
            ` : `<small style="color:var(--color-muted);">${escapeHtml(i18n.t('platformImageNoneSet'))}</small>`}
          </div>
        `}
      </div>
    </div>`;

  container.innerHTML = `
    <form id="platformForm" class="board-form" style="max-width:none;width:100%;padding:20px">
      <div class="pf-tabs">
        <button type="button" class="pf-tab active" data-pftab="overview">${escapeHtml(i18n.t('platformTabOverview'))}</button>
        <button type="button" class="pf-tab" data-pftab="pinout">${escapeHtml(i18n.t('platformTabPinout'))}</button>
        <button type="button" class="pf-tab" data-pftab="peripheral">${escapeHtml(i18n.t('platformTabPeripheral'))}</button>
      </div>

      <div class="pf-tabpane" data-pftabpane="overview">${overviewHtml}</div>
      <div class="pf-tabpane" data-pftabpane="pinout" style="display:none">
        <div class="pf-struct" id="pfPinoutStruct"></div>
      </div>
      <div class="pf-tabpane" data-pftabpane="peripheral" style="display:none">
        <div class="pf-struct" id="pfPeriStruct"></div>
      </div>

      <div class="form-actions" style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;padding-top:20px;border-top:1px solid var(--color-border)">
        <button type="button" id="pfCancelBtn" class="btn btn-outline">${escapeHtml(i18n.t('cancelBtn'))}</button>
        <button type="submit" class="btn btn-primary">${isNew ? escapeHtml(i18n.t('platformCreateBtn')) : escapeHtml(i18n.t('platformSaveBtn'))}</button>
      </div>
    </form>`;

  // `editor` owns the full detail object graph (data holder, not itself mounted).
  // Each area below is a sub-editor over a slice of editor.data — shared
  // references, so edits fold back into editor.getData() on collect.
  // memory + connectivity are bespoke forms in the Platform Info tab.
  const editor = new StructEditor(JSON.parse(JSON.stringify(detail || {})));
  if (!editor.data.peripherals || typeof editor.data.peripherals !== 'object') editor.data.peripherals = {};
  if (!Array.isArray(editor.data.pinout)) editor.data.pinout = [];
  delete editor.data.flashAndDebug; // section removed

  // Peripherals: a card list (one card per peripheral the chip has). Presence
  // means enabled; add/edit/delete via the top-right button and per-card buttons
  // (each peripheral is edited in a modal with its fixed-format form).
  _peri = {
    peripherals: editor.data.peripherals,
    pinout: editor.data.pinout,
    schema: resolvePeripheralSchema(),
    mountEl: container.querySelector('#pfPeriStruct'),
  };
  renderPeriCards();
  new StructEditor(editor.data.pinout, {
    labels: pinoutLabels(), lockStructure: true, enums: { type: PIN_TYPE_OPTIONS },
    datalistKeys: ['functions'], datalistSuggest: PINOUT_FUNC_SUGGEST,
    itemTemplate: { pin: null, name: '', gpio: null, type: '', functions: [], caps: [] },
  }).mount(container.querySelector('#pfPinoutStruct'));

  _state = { isNew, editor };

  // Tab switching
  container.querySelectorAll('.pf-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.pftab;
      container.querySelectorAll('.pf-tab').forEach(t => t.classList.toggle('active', t === tab));
      container.querySelectorAll('.pf-tabpane').forEach(p => {
        p.style.display = p.dataset.pftabpane === name ? '' : 'none';
      });
    });
  });

}

export function collectPlatformForm() {
  if (!_state) return null;
  const q = (id) => document.getElementById(id)?.value?.trim() || '';
  const pair = (base) => {
    const en = q(`${base}En`); const zh = q(`${base}Zh`);
    const o = {}; if (en) o.en = en; if (zh) o['zh-CN'] = zh; return o;
  };
  // image is managed by the upload UI (writes index.image directly), not here.
  const sdks = [...document.querySelectorAll('.platform-sdk-cb:checked')].map((cb) => cb.value);
  const index = {
    platformId: q('pfPlatformId') || q('pfId'),
    name: pair('pfName'),
    summary: pair('pfSummary'),
    sdks,
    published: document.getElementById('pfPublished')?.checked ?? true,
  };

  // platformSymbol / arch / flashInterface are edited in the Platform Info tab;
  // fold them back into the detail object.
  const detail = _state.editor.getData();
  const foldField = (key, val) => { if (val) detail[key] = val; else delete detail[key]; };
  foldField('platformSymbol', q('pfPlatformSymbol'));
  foldField('arch', q('pfArch'));
  foldField('flashInterface', q('pfFlashInterface'));

  // memory: KB inputs -> bytes (fixed schema: 4 sizes + efuse).
  const mem = (detail.memory && typeof detail.memory === 'object') ? detail.memory : {};
  const setKb = (key, id) => {
    const raw = document.getElementById(id)?.value;
    if (raw === '' || raw == null) delete mem[key];
    else mem[key] = Math.round(Number(raw) * 1024);
  };
  setKb('sramBytes', 'pfMemSram');
  setKb('romBytes', 'pfMemRom');
  setKb('flashMaxBytes', 'pfMemFlash');
  setKb('psramMaxBytes', 'pfMemPsram');
  mem.efuse = !!document.getElementById('pfMemEfuse')?.checked;
  detail.memory = mem;

  // connectivity: supported-protocol flags (fixed set).
  detail.connectivity = {
    wifi: !!document.getElementById('pfConnWifi')?.checked,
    ble: !!document.getElementById('pfConnBle')?.checked,
    ethernet: !!document.getElementById('pfConnEthernet')?.checked,
    cellular: !!document.getElementById('pfConnCellular')?.checked,
  };

  // power: flat fields, units fixed (not user-entered). Drop a sub-object if it
  // ends up with no values.
  const numId = (id) => { const r = document.getElementById(id)?.value; return r === '' || r == null ? undefined : Number(r); };
  const grp = (fields, unit) => {
    const o = {};
    for (const [k, id] of fields) { const v = numId(id); if (v !== undefined) o[k] = v; }
    if (!Object.keys(o).length) return undefined;
    o.unit = unit; return o;
  };
  const power = {};
  const vdd = grp([['min', 'pfPwVddMin'], ['typical', 'pfPwVddTyp'], ['max', 'pfPwVddMax']], 'V');
  const ioLevel = grp([['min', 'pfPwIoMin'], ['max', 'pfPwIoMax']], 'V');
  const deepSleepCurrent = grp([['typical', 'pfPwDsTyp']], 'uA');
  const activeCurrent = grp([['wifi', 'pfPwAcWifi'], ['ble', 'pfPwAcBle']], 'mA');
  if (vdd) power.vdd = vdd;
  if (ioLevel) power.ioLevel = ioLevel;
  if (deepSleepCurrent) power.deepSleepCurrent = deepSleepCurrent;
  if (activeCurrent) power.activeCurrent = activeCurrent;
  if (Object.keys(power).length) detail.power = power; else delete detail.power;

  return { id: q('pfId'), index, detail };
}

export async function savePlatformForm() {
  const data = collectPlatformForm();
  if (!data) return false;
  if (!data.id) { showError('Validation Error', i18n.t('platformIdRequired') || 'Platform id is required'); return false; }
  if (!data.index.name.en && !data.index.name['zh-CN']) {
    showError('Validation Error', i18n.t('platformNameRequired') || 'Platform name is required');
    return false;
  }
  try {
    if (_state.isNew) {
      await apiClient.createPlatform({
        id: data.id,
        platformId: data.index.platformId,
        name: data.index.name,
        summary: data.index.summary,
        image: data.index.image,
        sdks: data.index.sdks,
        published: data.index.published,
        detail: data.detail,
        autoCommit: true,
      });
      showNotification(`Platform "${data.id}" created`);
    } else {
      await apiClient.updatePlatform(data.id, { index: data.index, detail: data.detail, autoCommit: true });
      showNotification(`Platform "${data.id}" updated`);
    }
    return true;
  } catch (error) {
    showError('Save Failed', error.message);
    return false;
  }
}

export async function deletePlatformPrompt(id) {
  // Guard: a chip platform that is still referenced by boards cannot be deleted
  // (it would orphan them). Check up front so the user gets the reason before the
  // destructive confirm prompt — the backend enforces the same rule as a backstop.
  try {
    const boardsRes = await apiClient.getBoards();
    // `id` is the chip (platform item id). A board targets it via variantId
    // (current model); legacy boards stored the chip id in platformId.
    const refs = (boardsRes?.boards || []).filter(
      (b) => b.variantId === id || b.platformId === id,
    );
    if (refs.length) {
      const names = refs.map((b) => (b.name && (b.name['zh-CN'] || b.name.en)) || b.id);
      showError(
        '无法删除芯片平台',
        `芯片平台 "${id}" 仍被 ${refs.length} 个开发板引用（${names.join('、')}），不能删除。\n\n请先删除或将这些开发板改挂到其它芯片平台，再删除该芯片平台。`,
      );
      return false;
    }
  } catch (_) {
    // Pre-check failed (e.g. offline) — proceed; the backend guard still blocks it.
  }

  if (!confirm(`⚠️ Delete platform "${id}"?\n\nThis removes its index entry and detail file. CANNOT be undone!`)) return false;
  const typed = prompt(`🔴 Type the platform id to confirm deletion:\n\n"${id}"`, '');
  if (typed !== id) {
    if (typed !== null) showError('Confirmation Failed', `You entered "${typed}". Enter exactly "${id}".`);
    return false;
  }
  try {
    await apiClient.deletePlatform(id, true);
    showNotification(`✅ Platform "${id}" deleted`);
    return true;
  } catch (error) {
    showError('Delete Failed', error.message);
    return false;
  }
}
