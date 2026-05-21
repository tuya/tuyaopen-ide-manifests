import { number, input } from '@inquirer/prompts'
import { parseRangePins, pinsToRangeStr } from './_pin-utils.js'

export const meta = {
  key: 'dvp',
  label: 'DVP Camera',
  enableMacro: 'ENABLE_DVP',
  tklHeader: 'tkl_dvp.h',
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
      syncMode: [
        'TUYA_DVP_SYNC_MODE_0',
        'TUYA_DVP_SYNC_MODE_1',
        'TUYA_DVP_SYNC_MODE_2',
        'TUYA_DVP_SYNC_MODE_3',
      ],
      outputMode: [
        'TUYA_CAMERA_OUTPUT_YUV422',
        'TUYA_CAMERA_OUTPUT_JPEG',
        'TUYA_CAMERA_OUTPUT_H264',
        'TUYA_CAMERA_OUTPUT_JPEG_YUV422_BOTH',
        'TUYA_CAMERA_OUTPUT_H264_YUV422_BOTH',
      ],
      mclkFreq: { min: 0, max: 0 },
      ports: [
        {
          id: 0,
          pins: {
            mclk: 0,
            pclk: 0,
            hsync: 0,
            vsync: 0,
            data: [0, 0, 0, 0, 0, 0, 0, 0],
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
    if (pins && (!Array.isArray(pins.data) || pins.data.length !== 8))
      errors.push(`${path}.spec.ports[0].pins.data — 期望 8 元素 array`)
  }
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  data.count = await number({ message: 'DVP Camera 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const exPins = data.spec.ports[i]?.pins ?? {}
    const mclk  = await number({ message: `DVP[${i}] MCLK 引脚:`,  default: exPins.mclk  ?? 0 })
    const pclk  = await number({ message: `DVP[${i}] PCLK 引脚:`,  default: exPins.pclk  ?? 0 })
    const hsync = await number({ message: `DVP[${i}] HSYNC 引脚:`, default: exPins.hsync ?? 0 })
    const vsync = await number({ message: `DVP[${i}] VSYNC 引脚:`, default: exPins.vsync ?? 0 })

    const dataStr = await input({
      message: `DVP[${i}] DATA 引脚列表（8个，如 0-7）:`,
      default: pinsToRangeStr(exPins.data ?? Array(8).fill(0)),
    })

    ports.push({
      id: i,
      pins: { mclk, pclk, hsync, vsync, data: parseRangePins(dataStr).slice(0, 8) },
    })
  }
  data.spec.ports = ports
  return data
}
