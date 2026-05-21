import { number, confirm, select } from '@inquirer/prompts'
import chalk from 'chalk'

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

  while (true) {
    const choices = [
      { name: `通道数: ${chalk.gray(String(data.count))}`, value: 'count' },
      ...data.spec.channels.map((ch, i) => ({
        name: `通道${i}  pin:${ch.pin} irq:${ch.irq ? '是' : '否'}`,
        value: `ch:${i}`,
      })),
      { name: chalk.green('✔ 完成'), value: 'done' },
    ]

    const action = await select({ message: 'PWM 配置:', loop: false, choices })

    if (action === 'done') break

    if (action === 'count') {
      const newCount = await number({ message: 'PWM 通道数:', default: data.count })
      while (data.spec.channels.length < newCount)
        data.spec.channels.push({ id: data.spec.channels.length, pin: 0, irq: false })
      data.spec.channels = data.spec.channels.slice(0, newCount)
      data.count = newCount
    } else {
      const idx = Number(action.split(':')[1])
      const ch = data.spec.channels[idx]

      while (true) {
        const sub = await select({
          message: `PWM 通道${idx} 配置:`,
          loop: false,
          choices: [
            { name: `引脚: ${chalk.gray(String(ch.pin))}`, value: 'pin' },
            { name: `IRQ: ${chalk.gray(ch.irq ? '是' : '否')}`, value: 'irq' },
            { name: chalk.gray('← 返回'), value: 'back' },
          ],
        })
        if (sub === 'back') break
        if (sub === 'pin') ch.pin = await number({ message: `通道${idx} 引脚:`, default: ch.pin })
        else if (sub === 'irq') ch.irq = await confirm({ message: `通道${idx} 支持 IRQ?`, default: ch.irq })
      }
    }
  }

  return data
}
