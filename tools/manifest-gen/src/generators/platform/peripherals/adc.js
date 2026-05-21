import { number } from '@inquirer/prompts'

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

  data.count = await number({ message: 'ADC 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const ex = data.spec.ports[i]
    const chCount = await number({ message: `ADC[${i}] 通道数:`, default: ex?.channels?.length ?? 1 })
    const channels = []
    for (let j = 0; j < chCount; j++) {
      const pin = await number({ message: `ADC[${i}] 通道${j} 引脚:`, default: ex?.channels?.[j]?.pin ?? 0 })
      channels.push({ id: j, pin })
    }
    ports.push({ id: i, channels })
  }
  data.spec.ports = ports
  return data
}
