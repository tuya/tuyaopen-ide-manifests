import { number, select } from '@inquirer/prompts'
import chalk from 'chalk'

export const meta = {
  key: 'adc',
  label: 'ADC',
  enableMacro: 'ENABLE_ADC',
  tklHeader: 'tkl_adc.h',
  idPrefix: 'TUYA_ADC_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      bits: 12,
      mode: ['TUYA_ADC_SINGLE', 'TUYA_ADC_CONTINUOUS'],
      ports: [{ id: 0, channels: [{ id: 0, pin: 0 }] }],
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  while (true) {
    const choices = [
      { name: `端口数: ${chalk.gray(String(data.count))}`, value: 'count' },
      ...data.spec.ports.map((port, i) => ({
        name: `端口${i}  ${port.channels.length}通道`,
        value: `port:${i}`,
      })),
      { name: chalk.green('✔ 完成'), value: 'done' },
    ]

    const action = await select({ message: 'ADC 配置:', loop: false, choices })

    if (action === 'done') break

    if (action === 'count') {
      const newCount = await number({ message: 'ADC 端口数:', default: data.count })
      while (data.spec.ports.length < newCount)
        data.spec.ports.push({ id: data.spec.ports.length, channels: [{ id: 0, pin: 0 }] })
      data.spec.ports = data.spec.ports.slice(0, newCount)
      data.count = newCount
    } else {
      const idx = Number(action.split(':')[1])
      const port = data.spec.ports[idx]

      while (true) {
        const subChoices = [
          { name: `通道数: ${chalk.gray(String(port.channels.length))}`, value: 'chcount' },
          ...port.channels.map((ch, j) => ({
            name: `通道${j}  pin:${ch.pin}`,
            value: `ch:${j}`,
          })),
          { name: chalk.gray('← 返回'), value: 'back' },
        ]

        const sub = await select({ message: `ADC 端口${idx} 配置:`, choices: subChoices })

        if (sub === 'back') break

        if (sub === 'chcount') {
          const newChCount = await number({ message: `端口${idx} 通道数:`, default: port.channels.length })
          while (port.channels.length < newChCount)
            port.channels.push({ id: port.channels.length, pin: 0 })
          port.channels = port.channels.slice(0, newChCount)
        } else {
          const chIdx = Number(sub.split(':')[1])
          port.channels[chIdx].pin = await number({
            message: `端口${idx} 通道${chIdx} 引脚:`,
            default: port.channels[chIdx].pin,
          })
        }
      }
    }
  }

  return data
}
