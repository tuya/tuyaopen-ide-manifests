import { number, confirm } from '@inquirer/prompts'

export const meta = {
  key: 'pwm',
  label: 'PWM',
  enableMacro: 'ENABLE_PWM',
  tklHeader: 'tkl_pwm.h',
  idPrefix: 'TUYA_PWM_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      polarity: ['TUYA_PWM_NEGATIVE', 'TUYA_PWM_POSITIVE'],
      countMode: ['TUYA_PWM_CNT_UP'],
      duty: { min: 0, max: 10000 },
      freq: { min: 0, max: 0 },
      capture: { supported: false },
      channels: [{ id: 0, pin: 0, irq: false }],
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.channels))
    errors.push(`${path}.spec.channels — 期望 array`)
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  data.count = await number({ message: 'PWM 通道数:', default: data.count })

  const channels = []
  for (let i = 0; i < data.count; i++) {
    const ex = data.spec.channels[i]
    const pin = await number({ message: `PWM[${i}] 引脚:`,    default: ex?.pin ?? 0 })
    const irq = await confirm({ message: `PWM[${i}] 支持 IRQ?`, default: ex?.irq ?? false })
    channels.push({ id: i, pin, irq })
  }
  data.spec.channels = channels
  return data
}
