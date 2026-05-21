import { number, input } from '@inquirer/prompts'
import { parseRangePins, pinsToRangeStr } from './_pin-utils.js'

export const meta = {
  key: 'i8080',
  label: 'MCU8080',
  enableMacro: 'ENABLE_MCU8080',
  tklHeader: 'tkl_8080.h',
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
      pixelFmtDataBits: {
        'TUYA_PIXEL_FMT_RGB565': [8, 16],
        'TUYA_PIXEL_FMT_RGB666': [9, 18],
        'TUYA_PIXEL_FMT_RGB888': [8, 16, 24],
      },
      clkFreq: { min: 0, max: 0 },
      ports: [
        {
          id: 0,
          pins: {
            rdx: 0,
            wdx: 0,
            rsx: 0,
            reset: 0,
            csx: 0,
            data: Array(24).fill(0),
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
    if (pins && (!Array.isArray(pins.data) || pins.data.length !== 24))
      errors.push(`${path}.spec.ports[0].pins.data — 期望 24 元素 array`)
  }
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  data.count = await number({ message: 'MCU8080 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const exPins = data.spec.ports[i]?.pins ?? {}
    const rdx   = await number({ message: `8080[${i}] RDX 引脚:`,   default: exPins.rdx   ?? 0 })
    const wdx   = await number({ message: `8080[${i}] WDX 引脚:`,   default: exPins.wdx   ?? 0 })
    const rsx   = await number({ message: `8080[${i}] RSX 引脚:`,   default: exPins.rsx   ?? 0 })
    const reset = await number({ message: `8080[${i}] RESET 引脚:`, default: exPins.reset ?? 0 })
    const csx   = await number({ message: `8080[${i}] CSX 引脚:`,   default: exPins.csx   ?? 0 })

    const dataStr = await input({
      message: `8080[${i}] DATA 引脚列表（24个，如 0-23）:`,
      default: pinsToRangeStr(exPins.data ?? Array(24).fill(0)),
    })

    ports.push({
      id: i,
      pins: { rdx, wdx, rsx, reset, csx, data: parseRangePins(dataStr).slice(0, 24) },
    })
  }
  data.spec.ports = ports
  return data
}
