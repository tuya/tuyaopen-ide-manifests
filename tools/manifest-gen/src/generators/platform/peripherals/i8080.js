import { number, input, select } from '@inquirer/prompts'
import chalk from 'chalk'
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

  // Ensure ports array is synced to count
  while (data.spec.ports.length < data.count) {
    const id = data.spec.ports.length
    data.spec.ports.push({ id, pins: { rdx: 0, wdx: 0, rsx: 0, reset: 0, csx: 0, data: Array(24).fill(0) } })
  }

  while (true) {
    const choices = [
      { name: `端口数: ${chalk.gray(data.count)}`, value: '__count__' },
      ...data.spec.ports.map((port, i) => ({
        name: `端口${i}  RDX:${chalk.gray(port.pins.rdx)}`,
        value: `__port_${i}__`,
      })),
      { name: chalk.green('✔ 完成'), value: 'done' },
    ]

    const action = await select({ message: 'MCU8080 配置:', loop: false, choices })

    if (action === 'done') break

    if (action === '__count__') {
      const newCount = await number({ message: 'MCU8080 端口数:', default: data.count })
      data.count = newCount
      // Sync ports array
      while (data.spec.ports.length < data.count) {
        const id = data.spec.ports.length
        data.spec.ports.push({ id, pins: { rdx: 0, wdx: 0, rsx: 0, reset: 0, csx: 0, data: Array(24).fill(0) } })
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
          { name: `RDX: ${chalk.gray(p.rdx)}`, value: 'rdx' },
          { name: `WDX: ${chalk.gray(p.wdx)}`, value: 'wdx' },
          { name: `RSX: ${chalk.gray(p.rsx)}`, value: 'rsx' },
          { name: `RESET: ${chalk.gray(p.reset)}`, value: 'reset' },
          { name: `CSX: ${chalk.gray(p.csx)}`, value: 'csx' },
          { name: `DATA 引脚: ${chalk.gray(dataStr)}`, value: 'data' },
          { name: chalk.gray('← 返回'), value: 'back' },
        ],
      })
      if (field === 'back') break
      if (field === 'rdx') {
        p.rdx = await number({ message: `端口${portIdx} RDX 引脚:`, default: p.rdx })
      } else if (field === 'wdx') {
        p.wdx = await number({ message: `端口${portIdx} WDX 引脚:`, default: p.wdx })
      } else if (field === 'rsx') {
        p.rsx = await number({ message: `端口${portIdx} RSX 引脚:`, default: p.rsx })
      } else if (field === 'reset') {
        p.reset = await number({ message: `端口${portIdx} RESET 引脚:`, default: p.reset })
      } else if (field === 'csx') {
        p.csx = await number({ message: `端口${portIdx} CSX 引脚:`, default: p.csx })
      } else if (field === 'data') {
        const s = await input({ message: `端口${portIdx} DATA 引脚列表（24个，如 0-23）:`, default: dataStr })
        p.data = parseRangePins(s).slice(0, 24)
      }
    }
  }

  return data
}
