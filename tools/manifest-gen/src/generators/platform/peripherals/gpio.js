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
    message: 'GPIO 引脚号列表（逗号分隔，如 0,1,2,3）:',
    default: data.spec.pins.join(', '),
  })
  data.spec.pins = pinsStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))

  const irqStr = await input({
    message: 'IRQ 支持引脚列表（逗号分隔，留空=同 pins）:',
    default: data.spec.irq.pins.join(', '),
  })
  data.spec.irq.pins = irqStr.trim()
    ? irqStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    : [...data.spec.pins]

  return data
}
