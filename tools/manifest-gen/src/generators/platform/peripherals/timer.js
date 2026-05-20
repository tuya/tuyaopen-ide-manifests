export const meta = {
  key: 'timer', label: 'Timer',
  enableMacro: 'ENABLE_TIMER', tklHeader: 'tkl_timer.h', idPrefix: 'TUYA_TIMER_NUM_',
}

export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix, count: 0,
    spec: { bits: 32, mode: ['TUYA_TIMER_MODE_ONCE', 'TUYA_TIMER_MODE_PERIOD'], ids: [] },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ids))
    errors.push(`${path}.spec.ids — 期望 array`)
  return errors
}
