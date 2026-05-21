// src/generators/platform/peripherals/gpio.js
import { input, number, select } from '@inquirer/prompts'
import chalk from 'chalk'
import { parseRangePins, pinsToRangeStr } from './_pin-utils.js'

export const meta = {
  key: 'gpio',
  label: 'GPIO',
  enableMacro: 'ENABLE_GPIO',
  tklHeader: 'tkl_gpio.h',
  idPrefix: 'TUYA_GPIO_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      pins: [],
      direction: ['TUYA_GPIO_INPUT', 'TUYA_GPIO_OUTPUT'],
      mode: [
        'TUYA_GPIO_PUSH_PULL',
        'TUYA_GPIO_PULLUP',
        'TUYA_GPIO_PULLDOWN',
        'TUYA_GPIO_FLOATING',
        'TUYA_GPIO_OPENDRAIN',
        'TUYA_GPIO_OPENDRAIN_PULLUP',
      ],
      irq: {
        supported: true,
        triggers: [
          'TUYA_GPIO_IRQ_RISE',
          'TUYA_GPIO_IRQ_FALL',
          'TUYA_GPIO_IRQ_RISE_FALL',
          'TUYA_GPIO_IRQ_LOW',
          'TUYA_GPIO_IRQ_HIGH',
        ],
        pins: [],
      },
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.pins))
    errors.push(`${path}.spec.pins — 期望 array`)
  if (!Array.isArray(data.spec?.direction))
    errors.push(`${path}.spec.direction — 期望 array`)
  if (!Array.isArray(data.spec?.mode))
    errors.push(`${path}.spec.mode — 期望 array`)
  if (!Array.isArray(data.spec?.irq?.pins))
    errors.push(`${path}.spec.irq.pins — 期望 array`)
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  while (true) {
    const field = await select({
      message: 'GPIO 配置:',
      loop: false,
      choices: [
        { name: `数量         ${chalk.gray(String(data.count))}`, value: 'count' },
        { name: `引脚列表     ${chalk.gray(pinsToRangeStr(data.spec.pins) || '—')}`, value: 'pins' },
        { name: `IRQ 引脚     ${chalk.gray(pinsToRangeStr(data.spec.irq.pins) || '（同引脚列表）')}`, value: 'irq' },
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })
    if (field === 'done') break
    if (field === 'count') {
      data.count = await number({ message: 'GPIO 数量:', default: data.count })
    } else if (field === 'pins') {
      const s = await input({ message: '引脚号列表（支持范围，如 0-5,8-10,15）:', default: pinsToRangeStr(data.spec.pins) })
      data.spec.pins = parseRangePins(s)
    } else if (field === 'irq') {
      const s = await input({ message: 'IRQ 引脚列表（留空=同 pins）:', default: pinsToRangeStr(data.spec.irq.pins) })
      data.spec.irq.pins = s.trim() ? parseRangePins(s) : [...data.spec.pins]
    }
  }
  return data
}

