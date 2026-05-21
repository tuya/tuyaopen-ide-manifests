import { number, input, select } from '@inquirer/prompts'
import chalk from 'chalk'
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

  // Ensure ports array is synced to count
  while (data.spec.ports.length < data.count) {
    const id = data.spec.ports.length
    data.spec.ports.push({ id, pins: { dclk: 0, disp: 0, de: 0, hsync: 0, vsync: 0, r: Array(8).fill(0), g: Array(8).fill(0), b: Array(8).fill(0) } })
  }

  while (true) {
    const choices = [
      { name: `端口数: ${chalk.gray(data.count)}`, value: '__count__' },
      ...data.spec.ports.map((p, i) => ({
        name: `端口${i}  DCLK:${chalk.gray(p.pins.dclk)}`,
        value: `__port_${i}__`,
      })),
      { name: chalk.green('✔ 完成'), value: 'done' },
    ]

    const action = await select({ message: 'RGB LCD 配置:', loop: false, choices })

    if (action === 'done') break

    if (action === '__count__') {
      const newCount = await number({ message: 'RGB LCD 端口数:', default: data.count })
      data.count = newCount
      // Sync ports array
      while (data.spec.ports.length < data.count) {
        const id = data.spec.ports.length
        data.spec.ports.push({ id, pins: { dclk: 0, disp: 0, de: 0, hsync: 0, vsync: 0, r: Array(8).fill(0), g: Array(8).fill(0), b: Array(8).fill(0) } })
      }
      data.spec.ports = data.spec.ports.slice(0, data.count)
      continue
    }

    const portIdx = parseInt(action.replace('__port_', '').replace('__', ''), 10)
    const port = data.spec.ports[portIdx]
    const p = port.pins

    while (true) {
      const rStr = pinsToRangeStr(p.r)
      const gStr = pinsToRangeStr(p.g)
      const bStr = pinsToRangeStr(p.b)
      const field = await select({
        message: `端口${portIdx} 配置:`,
        loop: false,
        choices: [
          { name: `DCLK: ${chalk.gray(p.dclk)}`, value: 'dclk' },
          { name: `DISP: ${chalk.gray(p.disp)}`, value: 'disp' },
          { name: `DE: ${chalk.gray(p.de)}`, value: 'de' },
          { name: `HSYNC: ${chalk.gray(p.hsync)}`, value: 'hsync' },
          { name: `VSYNC: ${chalk.gray(p.vsync)}`, value: 'vsync' },
          { name: `R 引脚: ${chalk.gray(rStr)}`, value: 'r' },
          { name: `G 引脚: ${chalk.gray(gStr)}`, value: 'g' },
          { name: `B 引脚: ${chalk.gray(bStr)}`, value: 'b' },
          { name: chalk.gray('← 返回'), value: 'back' },
        ],
      })
      if (field === 'back') break
      if (field === 'dclk') {
        p.dclk = await number({ message: `端口${portIdx} DCLK 引脚:`, default: p.dclk })
      } else if (field === 'disp') {
        p.disp = await number({ message: `端口${portIdx} DISP 引脚:`, default: p.disp })
      } else if (field === 'de') {
        p.de = await number({ message: `端口${portIdx} DE 引脚:`, default: p.de })
      } else if (field === 'hsync') {
        p.hsync = await number({ message: `端口${portIdx} HSYNC 引脚:`, default: p.hsync })
      } else if (field === 'vsync') {
        p.vsync = await number({ message: `端口${portIdx} VSYNC 引脚:`, default: p.vsync })
      } else if (field === 'r') {
        const s = await input({ message: `端口${portIdx} R 引脚列表（8个，如 0-7）:`, default: rStr })
        p.r = parseRangePins(s).slice(0, 8)
      } else if (field === 'g') {
        const s = await input({ message: `端口${portIdx} G 引脚列表（8个，如 8-15）:`, default: gStr })
        p.g = parseRangePins(s).slice(0, 8)
      } else if (field === 'b') {
        const s = await input({ message: `端口${portIdx} B 引脚列表（8个，如 16-23）:`, default: bStr })
        p.b = parseRangePins(s).slice(0, 8)
      }
    }
  }

  return data
}
