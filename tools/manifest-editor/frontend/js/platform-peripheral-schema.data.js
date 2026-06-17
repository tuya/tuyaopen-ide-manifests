// Fixed-format schema for platform (chip) peripherals.
//
// Each known peripheral has a locked shape: friendly bilingual labels, fixed
// fields (no free add/remove), single-choice <select> fields (`enums`), and
// capability checklists (`enumSets`) drawn from the TuyaOS HAL option universe.
// Unknown values present in real data are preserved (rendered as extra checked
// boxes / a preserved <option>), so this is a guide, not a hard limit — other
// chips can carry values not pre-listed here.
//
// Consumed by platform-editor.js -> StructEditor({ schema }). Labels are
// resolved to the active language at mount time (resolvePeripheralSchema).

// --- HAL option universes (capability checklists) --------------------------
const U = {
  gpioDir: ['TUYA_GPIO_INPUT', 'TUYA_GPIO_OUTPUT'],
  gpioMode: ['TUYA_GPIO_PUSH_PULL', 'TUYA_GPIO_PULLUP', 'TUYA_GPIO_PULLDOWN', 'TUYA_GPIO_FLOATING', 'TUYA_GPIO_OPENDRAIN', 'TUYA_GPIO_OPENDRAIN_PULLUP'],
  gpioIrq: ['TUYA_GPIO_IRQ_RISE', 'TUYA_GPIO_IRQ_FALL', 'TUYA_GPIO_IRQ_LOW', 'TUYA_GPIO_IRQ_HIGH', 'TUYA_GPIO_IRQ_RISE_FALL'],
  uartDatabits: ['TUYA_UART_DATA_LEN_5BIT', 'TUYA_UART_DATA_LEN_6BIT', 'TUYA_UART_DATA_LEN_7BIT', 'TUYA_UART_DATA_LEN_8BIT'],
  uartStopbits: ['TUYA_UART_STOP_LEN_1BIT', 'TUYA_UART_STOP_LEN_1_5BIT', 'TUYA_UART_STOP_LEN_2BIT'],
  uartParity: ['TUYA_UART_PARITY_TYPE_NONE', 'TUYA_UART_PARITY_TYPE_ODD', 'TUYA_UART_PARITY_TYPE_EVEN'],
  uartFlow: ['TUYA_UART_FLOWCTRL_NONE', 'TUYA_UART_FLOWCTRL_RTSCTS', 'TUYA_UART_FLOWCTRL_RTS', 'TUYA_UART_FLOWCTRL_CTS'],
  uartRole: ['general', 'log', 'download', 'debug'],
  i2cRole: ['TUYA_IIC_MODE_MASTER', 'TUYA_IIC_MODE_SLAVE'],
  i2cSpeed: ['TUYA_IIC_BUS_SPEED_100K', 'TUYA_IIC_BUS_SPEED_400K', 'TUYA_IIC_BUS_SPEED_1M', 'TUYA_IIC_BUS_SPEED_3_4M'],
  i2cAddr: ['TUYA_IIC_ADDRESS_7BIT', 'TUYA_IIC_ADDRESS_10BIT'],
  portType: ['hw', 'sw'],
  spiRole: ['TUYA_SPI_ROLE_MASTER', 'TUYA_SPI_ROLE_SLAVE', 'TUYA_SPI_ROLE_MASTER_SIMPLEX', 'TUYA_SPI_ROLE_SLAVE_SIMPLEX'],
  spiMode: ['TUYA_SPI_MODE0', 'TUYA_SPI_MODE1', 'TUYA_SPI_MODE2', 'TUYA_SPI_MODE3'],
  spiCsType: ['TUYA_SPI_AUTO_TYPE', 'TUYA_SPI_SOFT_TYPE', 'TUYA_SPI_SOFT_ONE_WIRE_TYPE'],
  spiDatabits: ['TUYA_SPI_DATA_BIT8', 'TUYA_SPI_DATA_BIT16'],
  spiBitorder: ['TUYA_SPI_ORDER_MSB2LSB', 'TUYA_SPI_ORDER_LSB2MSB'],
  spiBackend: ['spi', 'qspi'],
  qspiWire: ['TUYA_QSPI_1WIRE', 'TUYA_QSPI_2WIRE', 'TUYA_QSPI_4WIRE'],
  qspiRole: ['TUYA_QSPI_ROLE_MASTER', 'TUYA_QSPI_ROLE_SLAVE'],
  qspiType: ['TUYA_QSPI_TYPE_FLASH', 'TUYA_QSPI_TYPE_LCD', 'TUYA_QSPI_TYPE_PSRAM'],
  pwmPol: ['TUYA_PWM_NEGATIVE', 'TUYA_PWM_POSITIVE'],
  pwmCnt: ['TUYA_PWM_CNT_UP', 'TUYA_PWM_CNT_UP_DOWN', 'TUYA_PWM_CNT_DOWN'],
  adcMode: ['TUYA_ADC_SINGLE', 'TUYA_ADC_CONTINUOUS'],
  timerMode: ['TUYA_TIMER_MODE_ONCE', 'TUYA_TIMER_MODE_PERIOD'],
  pixelFmt: ['TUYA_PIXEL_FMT_RGB565', 'TUYA_PIXEL_FMT_RGB666', 'TUYA_PIXEL_FMT_RGB888'],
  rgbEdge: ['TUYA_RGB_DATA_IN_FALLING_EDGE', 'TUYA_RGB_DATA_IN_RISING_EDGE'],
  dvpSync: ['TUYA_DVP_SYNC_MODE_0', 'TUYA_DVP_SYNC_MODE_1', 'TUYA_DVP_SYNC_MODE_2', 'TUYA_DVP_SYNC_MODE_3'],
  dvpOut: ['TUYA_CAMERA_OUTPUT_YUV422', 'TUYA_CAMERA_OUTPUT_JPEG', 'TUYA_CAMERA_OUTPUT_H264', 'TUYA_CAMERA_OUTPUT_JPEG_YUV422_BOTH', 'TUYA_CAMERA_OUTPUT_H264_YUV422_BOTH'],
  dma2dFmt: ['TUYA_FRAME_FMT_YUV422', 'TUYA_FRAME_FMT_RGB565', 'TUYA_FRAME_FMT_RGB888'],
  flashTypes: ['TUYA_FLASH_TYPE_APP', 'TUYA_FLASH_TYPE_OTA', 'TUYA_FLASH_TYPE_USER0', 'TUYA_FLASH_TYPE_KV_DATA', 'TUYA_FLASH_TYPE_KV_KEY', 'TUYA_FLASH_TYPE_UF', 'TUYA_FLASH_TYPE_KV_PROTECT', 'TUYA_FLASH_TYPE_RCD'],
  kwsWords: ['TKL_KWS_WAKEUP_NIHAO_TUYA', 'TKL_KWS_WAKEUP_NIHAO_XIAOZHI', 'TKL_KWS_WAKEUP_HEY_TUYA', 'TKL_KWS_WAKEUP_SMARTLIFE', 'TKL_KWS_WAKEUP_ZHINENGGUANJIA', 'TKL_KWS_WAKEUP_XIAOZHI_TONGXUE', 'TKL_KWS_WAKEUP_XIAOZHI_GUANJIA', 'TKL_KWS_WAKEUP_XIAOAI_XIAOAI', 'TKL_KWS_WAKEUP_XIAODU_XIAODU'],
  wifiBands: ['2.4GHz', '5GHz'],
  wifiSecurity: ['OPEN', 'WEP', 'WPA', 'WPA2', 'WPA3-Personal', 'WPA3-Enterprise'],
  wifiModes: ['STA', 'AP', 'Direct', 'Sniffer'],
  ethIface: ['RMII', 'MII'],
  wifiStandard: ['802.11b', '802.11b/g', '802.11b/g/n', '802.11b/g/n/ax', '802.11a/b/g/n', '802.11a/b/g/n/ac', '802.11a/b/g/n/ac/ax'],
};

// Full TUYA_PIN_FUNC_E universe (T5AI tkl_pinmux / tuya_cloud_types.h) — the
// pin functions that can be remapped, grouped by peripheral category for the
// dropdown's <optgroup>s. Order matches the header.
const PINMUX_FUNC_GROUPS = [
  { id: 'i2c', label: 'I2C', vals: ['0', '1', '2', '3', '4', '5'].flatMap(n => [`TUYA_IIC${n}_SCL`, `TUYA_IIC${n}_SDA`]) },
  { id: 'uart', label: 'UART', vals: ['0', '1', '2', '3'].flatMap(n => [`TUYA_UART${n}_TX`, `TUYA_UART${n}_RX`, `TUYA_UART${n}_RTS`, `TUYA_UART${n}_CTS`]) },
  { id: 'spi', label: 'SPI', vals: ['0', '1', '2'].flatMap(n => [`TUYA_SPI${n}_MISO`, `TUYA_SPI${n}_MOSI`, `TUYA_SPI${n}_CLK`, `TUYA_SPI${n}_CS`]) },
  { id: 'pwm', label: 'PWM', vals: ['0', '1', '2', '3', '4', '5'].map(n => `TUYA_PWM${n}`) },
  { id: 'adc', label: 'ADC', vals: ['0', '1', '2', '3', '4', '5'].map(n => `TUYA_ADC${n}`) },
  { id: 'dac', label: 'DAC', vals: ['0', '1', '2', '3', '4', '5'].map(n => `TUYA_DAC${n}`) },
  { id: 'i2s', label: 'I2S', vals: ['0', '1'].flatMap(n => [`TUYA_I2S${n}_SCK`, `TUYA_I2S${n}_WS`, `TUYA_I2S${n}_SDO_0`, `TUYA_I2S${n}_SDI_0`]) },
  { id: 'gpio', label: 'GPIO', vals: ['TUYA_GPIO'] },
  { id: 'sdio', label: 'SDIO', vals: ['CLK', 'CMD', 'DATA0', 'DATA1', 'DATA2', 'DATA3'].map(s => `TUYA_SDIO_${s}`) },
];

// --- Common bilingual labels (merged into each peripheral's label map) ------
const L = {
  enabled: { en: 'Enabled', 'zh-CN': '启用' },
  count: { en: 'Count', 'zh-CN': '数量' },
  spec: { en: 'Spec', 'zh-CN': '规格参数' },
  ports: { en: 'Ports', 'zh-CN': '端口' },
  channels: { en: 'Channels', 'zh-CN': '通道' },
  id: { en: 'ID', 'zh-CN': '编号' },
  role: { en: 'Role', 'zh-CN': '角色' },
  irq: { en: 'Interrupt', 'zh-CN': '中断' },
  dma: { en: 'DMA', 'zh-CN': 'DMA' },
  pinGroups: { en: 'Pin Groups', 'zh-CN': '引脚组' },
  pins: { en: 'Pins', 'zh-CN': '引脚' },
  pin: { en: 'Pin (GPIO)', 'zh-CN': '引脚 (GPIO)' },
  freq: { en: 'Frequency (Hz)', 'zh-CN': '频率 (Hz)' },
  min: { en: 'Min', 'zh-CN': '最小值' },
  max: { en: 'Max', 'zh-CN': '最大值' },
  mode: { en: 'Mode', 'zh-CN': '模式' },
  bits: { en: 'Bit Width', 'zh-CN': '位宽' },
  supported: { en: 'Supported', 'zh-CN': '支持' },
  triggers: { en: 'Triggers', 'zh-CN': '触发方式' },
  type: { en: 'Type', 'zh-CN': '类型' },
  interface: { en: 'Interface', 'zh-CN': '接口' },
  standard: { en: 'Standard', 'zh-CN': '标准' },
  bands: { en: 'Bands', 'zh-CN': '频段' },
  security: { en: 'Security', 'zh-CN': '加密方式' },
  modes: { en: 'Modes', 'zh-CN': '工作模式' },
  version: { en: 'Version', 'zh-CN': '版本' },
  mdio: { en: 'MDIO', 'zh-CN': 'MDIO' },
  baudrate: { en: 'Baudrate (bps)', 'zh-CN': '波特率 (bps)' },
  databits: { en: 'Data Bits', 'zh-CN': '数据位' },
  stopbits: { en: 'Stop Bits', 'zh-CN': '停止位' },
  parity: { en: 'Parity', 'zh-CN': '校验位' },
  flowctrl: { en: 'Flow Control', 'zh-CN': '流控' },
  speed: { en: 'Speed', 'zh-CN': '速率' },
  addrWidth: { en: 'Address Width', 'zh-CN': '地址位宽' },
  portType: { en: 'Port Type', 'zh-CN': '端口类型' },
  csType: { en: 'CS Type', 'zh-CN': '片选类型' },
  databits_spi: { en: 'Data Bits', 'zh-CN': '数据位' },
  bitorder: { en: 'Bit Order', 'zh-CN': '位序' },
  backend: { en: 'Backend', 'zh-CN': '后端' },
  wireMode: { en: 'Wire Mode', 'zh-CN': '线模式' },
  polarity: { en: 'Polarity', 'zh-CN': '极性' },
  countMode: { en: 'Count Mode', 'zh-CN': '计数模式' },
  duty: { en: 'Duty (0.01%)', 'zh-CN': '占空比 (0.01%)' },
  capture: { en: 'Capture', 'zh-CN': '捕获' },
  ids: { en: 'Timer IDs', 'zh-CN': '定时器编号' },
  partitionTypes: { en: 'Partition Types', 'zh-CN': '分区类型' },
  partitionMap: { en: 'Partition Map', 'zh-CN': '分区表' },
  startAddr: { en: 'Start Address', 'zh-CN': '起始地址' },
  endAddr: { en: 'End Address', 'zh-CN': '结束地址' },
  size: { en: 'Size (bytes)', 'zh-CN': '大小 (字节)' },
  blockSize: { en: 'Block Size', 'zh-CN': '块大小' },
  desc: { en: 'Description', 'zh-CN': '说明' },
  remappableFuncs: { en: 'Remappable Functions', 'zh-CN': '可重映射功能' },
  formats: { en: 'Formats', 'zh-CN': '像素格式' },
  pixelFmt: { en: 'Pixel Format', 'zh-CN': '像素格式' },
  pixelFmtDataBits: { en: 'Pixel Format Data Bits', 'zh-CN': '像素格式数据位' },
  outDataClkEdge: { en: 'Data Clock Edge', 'zh-CN': '数据时钟边沿' },
  dclkFreq: { en: 'DCLK Frequency (Hz)', 'zh-CN': 'DCLK 频率 (Hz)' },
  clkFreq: { en: 'Clock Frequency (Hz)', 'zh-CN': '时钟频率 (Hz)' },
  mclkFreq: { en: 'MCLK Frequency (Hz)', 'zh-CN': 'MCLK 频率 (Hz)' },
  syncMode: { en: 'Sync Mode', 'zh-CN': '同步模式' },
  outputMode: { en: 'Output Mode', 'zh-CN': '输出模式' },
  segments: { en: 'Segments', 'zh-CN': '段数' },
  commons: { en: 'Commons', 'zh-CN': '公共端' },
  wakeupWords: { en: 'Wake-up Words', 'zh-CN': '唤醒词' },
  direction: { en: 'Direction', 'zh-CN': '方向' },
  // pin tokens (kept uppercase; aid pin-picker rows)
  tx: { en: 'TX', 'zh-CN': 'TX' }, rx: { en: 'RX', 'zh-CN': 'RX' },
  cts: { en: 'CTS', 'zh-CN': 'CTS' }, rts: { en: 'RTS', 'zh-CN': 'RTS' },
  scl: { en: 'SCL', 'zh-CN': 'SCL' }, sda: { en: 'SDA', 'zh-CN': 'SDA' },
  clk: { en: 'CLK', 'zh-CN': 'CLK' }, cs: { en: 'CS', 'zh-CN': 'CS' },
  mosi: { en: 'MOSI', 'zh-CN': 'MOSI' }, miso: { en: 'MISO', 'zh-CN': 'MISO' },
  d0: { en: 'D0', 'zh-CN': 'D0' }, d1: { en: 'D1', 'zh-CN': 'D1' },
  d2: { en: 'D2', 'zh-CN': 'D2' }, d3: { en: 'D3', 'zh-CN': 'D3' },
  data: { en: 'Data', 'zh-CN': '数据' },
};

// Total pin count across [start,end] segments — GPIO `count` is derived, never
// hand-entered.
const gpioCount = (o) => {
  const segs = (o && o.spec && Array.isArray(o.spec.pins)) ? o.spec.pins : [];
  return segs.reduce((n, s) =>
    n + (Array.isArray(s) && s.length >= 2 ? Math.max(0, Number(s[1]) - Number(s[0]) + 1) : 0), 0);
};

// `count` derived from the length of a spec sub-array (ports / channels / ids).
const lenCount = (subKey) => (o) => (o && o.spec && Array.isArray(o.spec[subKey])) ? o.spec[subKey].length : 0;

// Shared label for peripherals whose count is derived (shown read-only).
const AUTOCOUNT = { en: 'Count', 'zh-CN': '数量' };

// SPI/QSPI clock modes spelt out by clock polarity (CPOL) and phase (CPHA).
const SPI_MODE_LABELS = {
  TUYA_SPI_MODE0: { en: 'Mode 0 (CPOL=0, CPHA=0)', 'zh-CN': '模式0（CPOL=0, CPHA=0）' },
  TUYA_SPI_MODE1: { en: 'Mode 1 (CPOL=0, CPHA=1)', 'zh-CN': '模式1（CPOL=0, CPHA=1）' },
  TUYA_SPI_MODE2: { en: 'Mode 2 (CPOL=1, CPHA=0)', 'zh-CN': '模式2（CPOL=1, CPHA=0）' },
  TUYA_SPI_MODE3: { en: 'Mode 3 (CPOL=1, CPHA=1)', 'zh-CN': '模式3（CPOL=1, CPHA=1）' },
};

// Helper: build a peripheral entry, merging common labels with overrides.
// `combos`   = key -> suggestion list (free text + <datalist>).
// `segments` = keys whose array value is a list of [start,end] ranges, edited
//              as a flat "start ~ end" segment list.
// `computed` = key -> fn(peripheralObj) for read-only derived fields (e.g. count).
// `countFrom`= spec sub-array the derived `count` reflects; the count field is
//              repositioned to render directly above that array.
// `flatten`  = extra object keys hoisted inline in the edit form (no wrapper box),
//              on top of the always-flattened `spec`.
// `visibleWhen` = (qualified) key -> fn(peripheralObj)=>bool; the field is only
//              shown when the predicate holds (toggling a boolean gate re-renders).
// Labels keyed "parent.key" (e.g. "irq.pins") disambiguate a key reused at
// different depths once flattened.
const P = (title, { labels, enums, enumLabels, enumSets, itemEnums, groupedPicks, combos, segments, indexedPins, computed, rowComputed, countFrom, flatten, hide, unitKB, provisional, note, visibleWhen, def, templates } = {}) => ({
  title,
  labels: { ...L, ...(labels || {}) },
  // Fixed shape for a newly-added object-array item, keyed by array name
  // (ports / channels / pinGroups). Adding always uses this template so the
  // structure is determined by the peripheral type, never cloned from existing
  // entries. Pin values are null placeholders for the user to fill.
  templates: templates || {},
  hide: hide || [],
  unitKB: unitKB || [],
  provisional: !!provisional, // not yet selectable in the add-peripheral dialog
  groupedPicks: groupedPicks || {},
  note: note || null,
  enums: enums || {},
  enumLabels: enumLabels || {},
  enumSets: enumSets || {},
  itemEnums: itemEnums || {},
  combos: combos || {},
  segments: segments || [],
  indexedPins: indexedPins || [],
  computed: computed || {},
  rowComputed: rowComputed || {},
  countFrom: countFrom || null,
  flatten: flatten || [],
  visibleWhen: visibleWhen || {},
  def: def || {},
});

const FLAG = (title, opts = {}) => P(title, { provisional: opts.provisional, def: { enabled: false, count: 1 } });

export default {
  // --- Wireless ------------------------------------------------------------
  wifi: P({ en: 'Wi-Fi', 'zh-CN': 'Wi-Fi' }, {
    combos: { standard: U.wifiStandard },
    enumSets: { bands: U.wifiBands, security: U.wifiSecurity, modes: U.wifiModes },
    def: { spec: { standard: '', bands: [], security: [], modes: [] } },
  }),
  ble: P({ en: 'Bluetooth LE', 'zh-CN': '蓝牙 BLE' }, {
    def: { spec: { version: '' } },
  }),
  ethernet: P({ en: 'Ethernet', 'zh-CN': '以太网' }, {
    enums: { interface: U.ethIface },
    def: { spec: { interface: 'RMII', mdio: false } },
  }),

  // --- Bus -----------------------------------------------------------------
  gpio: P({ en: 'GPIO', 'zh-CN': 'GPIO' }, {
    labels: {
      count: { en: 'Count (auto)', 'zh-CN': '数量（自动）' },
      pins: { en: 'Pin Ranges', 'zh-CN': '引脚区间' },
      'irq.supported': { en: 'Interrupt', 'zh-CN': '支持中断' },
      'irq.triggers': { en: 'Interrupt Triggers', 'zh-CN': '中断触发方式' },
      'irq.pins': { en: 'Interrupt Pin Ranges', 'zh-CN': '中断引脚区间' },
    },
    enumSets: { direction: U.gpioDir, mode: U.gpioMode, triggers: U.gpioIrq },
    segments: ['pins'],
    computed: { count: gpioCount },
    countFrom: 'pins',
    flatten: ['irq'],
    visibleWhen: {
      'irq.triggers': (o) => !!(o && o.spec && o.spec.irq && o.spec.irq.supported),
      'irq.pins': (o) => !!(o && o.spec && o.spec.irq && o.spec.irq.supported),
    },
    def: { enabled: false, count: 0, spec: { pins: [], direction: [], mode: [], irq: { supported: false, triggers: [], pins: [] } } },
  }),
  uart: P({ en: 'UART', 'zh-CN': 'UART' }, {
    labels: { count: AUTOCOUNT },
    enums: { role: U.uartRole },
    enumLabels: {
      role: {
        general: { en: 'General', 'zh-CN': '通用' },
        log: { en: 'Log', 'zh-CN': '日志' },
        download: { en: 'Download / Flash', 'zh-CN': '下载 / 烧录' },
        debug: { en: 'Debug', 'zh-CN': '调试' },
      },
    },
    enumSets: { databits: U.uartDatabits, stopbits: U.uartStopbits, parity: U.uartParity, flowctrl: U.uartFlow },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: { ports: { id: 0, role: '', irq: { rx: false, tx: false }, pinGroups: [{ tx: null, rx: null, cts: null, rts: null }] } },
    def: { enabled: false, count: 0, spec: { baudrate: { min: 0, max: 0 }, databits: [], stopbits: [], parity: [], flowctrl: [], ports: [] } },
  }),
  i2c: P({ en: 'I2C', 'zh-CN': 'I2C' }, {
    labels: { count: AUTOCOUNT },
    enumLabels: {
      type: {
        hw: { en: 'Hardware', 'zh-CN': '硬件' },
        sw: { en: 'Software', 'zh-CN': '软件模拟' },
      },
    },
    enumSets: { role: U.i2cRole, speed: U.i2cSpeed, addrWidth: U.i2cAddr, type: U.portType },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: { ports: { id: 0, type: [], irq: false, pinGroups: [{ scl: null, sda: null }] } },
    def: { enabled: false, count: 0, spec: { role: [], speed: [], addrWidth: [], ports: [] } },
  }),
  spi: P({ en: 'SPI', 'zh-CN': 'SPI' }, {
    labels: { count: AUTOCOUNT },
    enums: { backend: U.spiBackend },
    enumLabels: {
      mode: SPI_MODE_LABELS,
      role: {
        TUYA_SPI_ROLE_MASTER: { en: 'Master', 'zh-CN': '主机' },
        TUYA_SPI_ROLE_SLAVE: { en: 'Slave', 'zh-CN': '从机' },
        TUYA_SPI_ROLE_MASTER_SIMPLEX: { en: 'Master · simplex', 'zh-CN': '主机·单工' },
        TUYA_SPI_ROLE_SLAVE_SIMPLEX: { en: 'Slave · simplex', 'zh-CN': '从机·单工' },
      },
      csType: {
        TUYA_SPI_AUTO_TYPE: { en: 'Hardware (auto)', 'zh-CN': '硬件自动' },
        TUYA_SPI_SOFT_TYPE: { en: 'Software (GPIO)', 'zh-CN': '软件控制' },
        TUYA_SPI_SOFT_ONE_WIRE_TYPE: { en: 'Software · one-wire', 'zh-CN': '软件·单线' },
      },
    },
    enumSets: { role: U.spiRole, mode: U.spiMode, csType: U.spiCsType, databits: U.spiDatabits, bitorder: U.spiBitorder },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: { ports: { id: 0, backend: 'spi', irq: false, dma: false, pinGroups: [{ clk: null, cs: null, mosi: null, miso: null }] } },
    def: { enabled: false, count: 0, spec: { role: [], mode: [], csType: [], databits: [], bitorder: [], ports: [] } },
  }),
  qspi: P({ en: 'QSPI', 'zh-CN': 'QSPI' }, {
    labels: { count: AUTOCOUNT },
    enumLabels: { mode: SPI_MODE_LABELS },
    enumSets: { wireMode: U.qspiWire, role: U.qspiRole, type: U.qspiType, mode: U.spiMode },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: { ports: { id: 0, dma: false, pinGroups: [{ clk: null, cs: null, d0: null, d1: null, d2: null, d3: null }] } },
    def: { enabled: false, count: 0, spec: { wireMode: [], role: [], type: [], mode: [], freq: { min: 0, max: 0 }, ports: [] } },
  }),
  can: FLAG({ en: 'CAN', 'zh-CN': 'CAN' }, { provisional: true }),
  lin: FLAG({ en: 'LIN', 'zh-CN': 'LIN' }, { provisional: true }),
  iso7816: FLAG({ en: 'ISO7816', 'zh-CN': 'ISO7816' }, { provisional: true }),

  // --- Analog / Timer ------------------------------------------------------
  adc: P({ en: 'ADC', 'zh-CN': 'ADC' }, {
    labels: { count: AUTOCOUNT },
    enumSets: { mode: U.adcMode },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: { ports: { id: 0, channels: [{ id: 0, pin: null }] }, channels: { id: 0, pin: null } },
    def: { enabled: false, count: 0, spec: { bits: 12, mode: [], ports: [] } },
  }),
  pwm: P({ en: 'PWM', 'zh-CN': 'PWM' }, {
    labels: { count: AUTOCOUNT },
    enumSets: { polarity: U.pwmPol, countMode: U.pwmCnt },
    computed: { count: lenCount('channels') },
    countFrom: 'channels',
    templates: { channels: { id: 0, pin: null, irq: false } },
    def: { enabled: false, count: 0, spec: { polarity: [], countMode: [], duty: { min: 0, max: 0 }, freq: { min: 0, max: 0 }, capture: { supported: false }, channels: [] } },
  }),
  timer: P({ en: 'Timer', 'zh-CN': '定时器' }, {
    labels: { count: AUTOCOUNT },
    enumSets: { mode: U.timerMode },
    computed: { count: lenCount('ids') },
    countFrom: 'ids',
    def: { enabled: false, count: 0, spec: { bits: 32, mode: [], ids: [] } },
  }),

  // --- Display -------------------------------------------------------------
  rgb: P({ en: 'RGB LCD', 'zh-CN': 'RGB 屏' }, {
    labels: { count: AUTOCOUNT },
    indexedPins: ['r', 'g', 'b'], // data-bus arrays → per-pin labels R0, R1, …
    enumSets: { pixelFmt: U.pixelFmt, outDataClkEdge: U.rgbEdge },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: {
      ports: { id: 0, pinGroups: [{ dclk: null, disp: null, de: null, hsync: null, vsync: null, r: [null, null, null, null, null, null, null, null], g: [null, null, null, null, null, null, null, null], b: [null, null, null, null, null, null, null, null] }] },
      pinGroups: { dclk: null, disp: null, de: null, hsync: null, vsync: null, r: [null, null, null, null, null, null, null, null], g: [null, null, null, null, null, null, null, null], b: [null, null, null, null, null, null, null, null] },
    },
    def: { enabled: false, count: 0, spec: { pixelFmt: [], outDataClkEdge: [], dclkFreq: { min: 0, max: 0 }, ports: [] } },
  }),
  i8080: P({ en: 'MCU8080 LCD', 'zh-CN': 'MCU8080 屏' }, {
    labels: { count: AUTOCOUNT },
    indexedPins: ['data'], // data bus → D0, D1, …
    flatten: ['pixelFmtDataBits'], // show each pixel format's supported bus widths inline
    // Supported data-bus widths per pixel format: pick a common one or type a custom.
    combos: U.pixelFmt.reduce((m, f) => { m[f] = [8, 16, 18]; return m; }, {}),
    enumSets: { pixelFmt: U.pixelFmt },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: {
      ports: { id: 0, pinGroups: [{ rdx: null, wdx: null, rsx: null, reset: null, csx: null, data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] }] },
      pinGroups: { rdx: null, wdx: null, rsx: null, reset: null, csx: null, data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
    },
    def: { enabled: false, count: 0, spec: { pixelFmt: [], pixelFmtDataBits: {}, clkFreq: { min: 0, max: 0 }, ports: [] } },
  }),
  dvp: P({ en: 'DVP Camera', 'zh-CN': 'DVP 摄像头' }, {
    labels: { count: AUTOCOUNT },
    indexedPins: ['data'], // data bus → D0, D1, …
    enumLabels: {
      syncMode: {
        TUYA_DVP_SYNC_MODE_0: { en: 'HSYNC high / VSYNC high', 'zh-CN': 'HSYNC 高 / VSYNC 高' },
        TUYA_DVP_SYNC_MODE_1: { en: 'HSYNC high / VSYNC low', 'zh-CN': 'HSYNC 高 / VSYNC 低' },
        TUYA_DVP_SYNC_MODE_2: { en: 'HSYNC low / VSYNC high', 'zh-CN': 'HSYNC 低 / VSYNC 高' },
        TUYA_DVP_SYNC_MODE_3: { en: 'HSYNC low / VSYNC low', 'zh-CN': 'HSYNC 低 / VSYNC 低' },
      },
      outputMode: {
        TUYA_CAMERA_OUTPUT_JPEG_YUV422_BOTH: { en: 'JPEG + YUV422', 'zh-CN': 'JPEG + YUV422' },
        TUYA_CAMERA_OUTPUT_H264_YUV422_BOTH: { en: 'H264 + YUV422', 'zh-CN': 'H264 + YUV422' },
      },
    },
    enumSets: { syncMode: U.dvpSync, outputMode: U.dvpOut },
    computed: { count: lenCount('ports') },
    countFrom: 'ports',
    templates: {
      ports: { id: 0, pinGroups: [{ mclk: null, pclk: null, hsync: null, vsync: null, data: [null, null, null, null, null, null, null, null] }] },
      pinGroups: { mclk: null, pclk: null, hsync: null, vsync: null, data: [null, null, null, null, null, null, null, null] },
    },
    def: { enabled: false, count: 0, spec: { syncMode: [], outputMode: [], mclkFreq: { min: 0, max: 0 }, ports: [] } },
  }),
  dma2d: P({ en: '2D DMA', 'zh-CN': '2D DMA' }, {
    enumSets: { formats: U.dma2dFmt },
    def: { enabled: false, count: 0, spec: { formats: [] } },
  }),
  slcd: P({ en: 'Segment LCD', 'zh-CN': '段码屏' }, {
    provisional: true,
    def: { enabled: false, count: 0, spec: { segments: 0, commons: 0 } },
  }),

  // --- Audio / AI ----------------------------------------------------------
  kws: P({ en: 'Keyword Spotting', 'zh-CN': '语音唤醒' }, {
    enumLabels: {
      wakeupWords: {
        TKL_KWS_WAKEUP_NIHAO_TUYA: { en: 'Nihao Tuya', 'zh-CN': '你好涂鸦' },
        TKL_KWS_WAKEUP_NIHAO_XIAOZHI: { en: 'Nihao Xiaozhi', 'zh-CN': '你好小智' },
        TKL_KWS_WAKEUP_HEY_TUYA: { en: 'Hey Tuya', 'zh-CN': 'Hey Tuya' },
        TKL_KWS_WAKEUP_SMARTLIFE: { en: 'SmartLife', 'zh-CN': 'SmartLife' },
        TKL_KWS_WAKEUP_ZHINENGGUANJIA: { en: 'Zhineng Guanjia', 'zh-CN': '智能管家' },
        TKL_KWS_WAKEUP_XIAOZHI_TONGXUE: { en: 'Xiaozhi Tongxue', 'zh-CN': '小智同学' },
        TKL_KWS_WAKEUP_XIAOZHI_GUANJIA: { en: 'Xiaozhi Guanjia', 'zh-CN': '小智管家' },
        TKL_KWS_WAKEUP_XIAOAI_XIAOAI: { en: 'Xiaoai Xiaoai', 'zh-CN': '小爱小爱' },
        TKL_KWS_WAKEUP_XIAODU_XIAODU: { en: 'Xiaodu Xiaodu', 'zh-CN': '小度小度' },
      },
    },
    enumSets: { wakeupWords: U.kwsWords },
    def: { enabled: false, count: 0, spec: { wakeupWords: [] } },
  }),
  vad: FLAG({ en: 'Voice Activity Detection', 'zh-CN': '语音活动检测' }),

  // --- System --------------------------------------------------------------
  wdt: FLAG({ en: 'Watchdog', 'zh-CN': '看门狗' }),
  rtc: FLAG({ en: 'RTC', 'zh-CN': 'RTC' }),
  flash: P({ en: 'Flash', 'zh-CN': 'Flash' }, {
    labels: {
      size: { en: 'Size (KB)', 'zh-CN': '大小 (KB)' },
      blockSize: { en: 'Block (KB)', 'zh-CN': '块大小 (KB)' },
    },
    hide: ['count'], // single flash controller — count is meaningless
    unitKB: ['blockSize'], // edited/shown in KB, stored in bytes
    enums: { type: U.flashTypes },
    enumLabels: {
      type: {
        TUYA_FLASH_TYPE_APP: { en: 'Application', 'zh-CN': '应用固件' },
        TUYA_FLASH_TYPE_OTA: { en: 'OTA', 'zh-CN': 'OTA 升级' },
        TUYA_FLASH_TYPE_USER0: { en: 'User area', 'zh-CN': '用户区' },
        TUYA_FLASH_TYPE_KV_DATA: { en: 'KV data', 'zh-CN': 'KV 数据' },
        TUYA_FLASH_TYPE_KV_KEY: { en: 'KV key', 'zh-CN': 'KV 密钥' },
        TUYA_FLASH_TYPE_UF: { en: 'User file system', 'zh-CN': '用户文件系统' },
        TUYA_FLASH_TYPE_KV_PROTECT: { en: 'KV protected', 'zh-CN': 'KV 保护区' },
        TUYA_FLASH_TYPE_RCD: { en: 'Record', 'zh-CN': '记录区' },
      },
    },
    note: {
      title: { en: 'Partition types', 'zh-CN': '分区类型说明' },
      items: [
        { term: { en: 'Application', 'zh-CN': '应用固件' }, desc: { en: 'Application firmware (cpu0/1/2)', 'zh-CN': '应用程序固件（cpu0/1/2）' } },
        { term: { en: 'OTA', 'zh-CN': 'OTA 升级' }, desc: { en: 'OTA update metadata', 'zh-CN': 'OTA 升级元数据' } },
        { term: { en: 'User area', 'zh-CN': '用户区' }, desc: { en: 'Reserved for the user; unused by the SDK — usage is up to the user.', 'zh-CN': '预留给用户的区域，SDK 暂未使用，具体用途由用户决定。' } },
        { term: { en: 'KV data', 'zh-CN': 'KV 数据' }, desc: { en: 'Key-value data store', 'zh-CN': '键值对数据存储' } },
        { term: { en: 'KV key', 'zh-CN': 'KV 密钥' }, desc: { en: 'Key-value encryption key', 'zh-CN': '键值加密密钥' } },
        { term: { en: 'User file system', 'zh-CN': '用户文件系统' }, desc: { en: 'User file system', 'zh-CN': '用户文件系统' } },
        { term: { en: 'KV protected', 'zh-CN': 'KV 保护区' }, desc: { en: 'Protected key-value store', 'zh-CN': '受保护的键值存储' } },
        { term: { en: 'Record', 'zh-CN': '记录区' }, desc: { en: 'Record region', 'zh-CN': '记录区' } },
      ],
    },
    // Partition size is derived from the addresses (stored in bytes, shown in KB).
    rowComputed: {
      size: {
        unit: 'KB',
        fn: (row) => {
          const hx = (v) => { const s = String(v == null ? '' : v).trim(); if (!s) return NaN; return /^0x/i.test(s) ? Number(s) : parseInt(s, 16); };
          const e = hx(row.endAddr), s = hx(row.startAddr);
          return (Number.isFinite(e) && Number.isFinite(s)) ? e - s : NaN;
        },
      },
    },
    def: { enabled: false, count: 1, spec: { partitionMap: [] } },
  }),
  pinmux: P({ en: 'Pin Mux', 'zh-CN': '引脚复用' }, {
    hide: ['count'], // single pin-mux controller
    // Two-level editor: add a peripheral category, then add its pin functions.
    groupedPicks: { remappableFuncs: PINMUX_FUNC_GROUPS },
    def: { enabled: false, count: 1, spec: { remappableFuncs: {} } },
  }),
  swd: FLAG({ en: 'SWD', 'zh-CN': 'SWD' }, { provisional: true }),
};
