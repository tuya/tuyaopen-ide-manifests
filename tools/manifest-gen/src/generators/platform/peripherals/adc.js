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
