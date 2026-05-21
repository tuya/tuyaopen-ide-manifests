import { number, input } from '@inquirer/prompts'
import { parseRangePins, pinsToRangeStr } from './_pin-utils.js'

export const meta = {
  key: 'rgb',
  label: 'RGB LCD',
  enableMacro: 'ENABLE_RGB',
  tklHeader: 'tkl_rgb.h',
  idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: null,
    count: 0,
    spec: {
      pixelFmt: ['TUYA_PIXEL_FMT_RGB565', 'TUYA_PIXEL_FMT_RGB666', 'TUYA_PIXEL_FMT_RGB888'],
      outDataClkEdge: ['TUYA_RGB_DATA_IN_FALLING_EDGE', 'TUYA_RGB_DATA_IN_RISING_EDGE'],
      dclkFreq: { min: 0, max: 0 },
      ports: [
        {
          id: 0,
          pins: {
            dclk: 0,
            disp: 0,
            de: 0,
            hsync: 0,
            vsync: 0,
            r: [0, 0, 0, 0, 0, 0, 0, 0],
            g: [0, 0, 0, 0, 0, 0, 0, 0],
            b: [0, 0, 0, 0, 0, 0, 0, 0],
          },
        },
      ],
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  else {
    const pins = data.spec.ports[0]?.pins
    if (pins) {
      if (!Array.isArray(pins.r) || pins.r.length !== 8)
        errors.push(`${path}.spec.ports[0].pins.r — 期望 8 元素 array`)
    }
  }
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  data.count = await number({ message: 'RGB LCD 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const exPins = data.spec.ports[i]?.pins ?? {}
    const dclk  = await number({ message: `RGB[${i}] DCLK 引脚:`,  default: exPins.dclk  ?? 0 })
    const disp  = await number({ message: `RGB[${i}] DISP 引脚:`,  default: exPins.disp  ?? 0 })
    const de    = await number({ message: `RGB[${i}] DE 引脚:`,    default: exPins.de    ?? 0 })
    const hsync = await number({ message: `RGB[${i}] HSYNC 引脚:`, default: exPins.hsync ?? 0 })
    const vsync = await number({ message: `RGB[${i}] VSYNC 引脚:`, default: exPins.vsync ?? 0 })

    const rStr = await input({
      message: `RGB[${i}] R 引脚列表（8个，如 0-7）:`,
      default: pinsToRangeStr(exPins.r ?? Array(8).fill(0)),
    })
    const gStr = await input({
      message: `RGB[${i}] G 引脚列表（8个，如 8-15）:`,
      default: pinsToRangeStr(exPins.g ?? Array(8).fill(0)),
    })
    const bStr = await input({
      message: `RGB[${i}] B 引脚列表（8个，如 16-23）:`,
      default: pinsToRangeStr(exPins.b ?? Array(8).fill(0)),
    })

    ports.push({
      id: i,
      pins: {
        dclk, disp, de, hsync, vsync,
        r: parseRangePins(rStr).slice(0, 8),
        g: parseRangePins(gStr).slice(0, 8),
        b: parseRangePins(bStr).slice(0, 8),
      },
    })
  }
  data.spec.ports = ports
  return data
}
