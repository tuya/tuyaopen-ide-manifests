import { number, input, select } from '@inquirer/prompts'
import chalk from 'chalk'
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

  // Ensure ports array is synced to count
  while (data.spec.ports.length < data.count) {
    const id = data.spec.ports.length
    data.spec.ports.push({ id, pins: { mclk: 0, pclk: 0, hsync: 0, vsync: 0, data: Array(8).fill(0) } })
  }

  while (true) {
    const choices = [
      { name: `端口数: ${chalk.gray(data.count)}`, value: '__count__' },
      ...data.spec.ports.map((port, i) => ({
        name: `端口${i}  MCLK:${chalk.gray(port.pins.mclk)}`,
        value: `__port_${i}__`,
      })),
      { name: chalk.green('✔ 完成'), value: 'done' },
    ]

    const action = await select({ message: 'DVP Camera 配置:', loop: false, choices })

    if (action === 'done') break

    if (action === '__count__') {
      const newCount = await number({ message: 'DVP Camera 端口数:', default: data.count })
      data.count = newCount
      // Sync ports array
      while (data.spec.ports.length < data.count) {
        const id = data.spec.ports.length
        data.spec.ports.push({ id, pins: { mclk: 0, pclk: 0, hsync: 0, vsync: 0, data: Array(8).fill(0) } })
      }
      data.spec.ports = data.spec.ports.slice(0, data.count)
      continue
    }

    const portIdx = parseInt(action.replace('__port_', '').replace('__', ''), 10)
    const port = data.spec.ports[portIdx]
    const p = port.pins

    while (true) {
      const dataStr = pinsToRangeStr(p.data)
      const field = await select({
        message: `端口${portIdx} 配置:`,
        loop: false,
        choices: [
          { name: `MCLK: ${chalk.gray(p.mclk)}`, value: 'mclk' },
          { name: `PCLK: ${chalk.gray(p.pclk)}`, value: 'pclk' },
          { name: `HSYNC: ${chalk.gray(p.hsync)}`, value: 'hsync' },
          { name: `VSYNC: ${chalk.gray(p.vsync)}`, value: 'vsync' },
          { name: `DATA 引脚: ${chalk.gray(dataStr)}`, value: 'data' },
          { name: chalk.gray('← 返回'), value: 'back' },
        ],
      })
      if (field === 'back') break
      if (field === 'mclk') {
        p.mclk = await number({ message: `端口${portIdx} MCLK 引脚:`, default: p.mclk })
      } else if (field === 'pclk') {
        p.pclk = await number({ message: `端口${portIdx} PCLK 引脚:`, default: p.pclk })
      } else if (field === 'hsync') {
        p.hsync = await number({ message: `端口${portIdx} HSYNC 引脚:`, default: p.hsync })
      } else if (field === 'vsync') {
        p.vsync = await number({ message: `端口${portIdx} VSYNC 引脚:`, default: p.vsync })
      } else if (field === 'data') {
        const s = await input({ message: `端口${portIdx} DATA 引脚列表（8个，如 0-7）:`, default: dataStr })
        p.data = parseRangePins(s).slice(0, 8)
      }
    }
  }

  return data
}
