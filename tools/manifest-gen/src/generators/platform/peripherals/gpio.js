// src/generators/platform/peripherals/gpio.js
import { input, number } from '@inquirer/prompts'

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

  data.count = await number({ message: 'GPIO 数量:', default: data.count })

  const pinsStr = await input({
    message: 'GPIO 引脚号列表（支持范围，如 0-5,8-10,15,20-25）:',
    default: pinsToRangeStr(data.spec.pins),
  })
  data.spec.pins = parseRangePins(pinsStr)

  const irqStr = await input({
    message: 'IRQ 支持引脚列表（格式同上，留空=同 pins）:',
    default: pinsToRangeStr(data.spec.irq.pins),
  })
  data.spec.irq.pins = irqStr.trim() ? parseRangePins(irqStr) : [...data.spec.pins]

  return data
}

function parseRangePins(str) {
  const pins = []
  for (const seg of str.split(',')) {
    const s = seg.trim()
    if (!s) continue
    const m = s.match(/^(\d+)-(\d+)$/)
    if (m) {
      const [from, to] = [parseInt(m[1], 10), parseInt(m[2], 10)]
      for (let i = from; i <= to; i++) pins.push(i)
    } else {
      const n = parseInt(s, 10)
      if (!isNaN(n)) pins.push(n)
    }
  }
  return pins
}

function pinsToRangeStr(pins) {
  if (!pins?.length) return ''
  const sorted = [...new Set(pins)].sort((a, b) => a - b)
  const parts = []
  let start = sorted[0], end = sorted[0]
  for (let i = 1; i <= sorted.length; i++) {
    if (sorted[i] === end + 1) { end = sorted[i]; continue }
    parts.push(start === end ? `${start}` : `${start}-${end}`)
    start = end = sorted[i]
  }
  return parts.join(', ')
}
