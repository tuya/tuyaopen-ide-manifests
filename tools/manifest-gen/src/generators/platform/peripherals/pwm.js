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
