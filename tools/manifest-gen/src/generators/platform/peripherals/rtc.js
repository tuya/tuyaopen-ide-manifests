export const meta = {
  key: 'rtc', label: 'RTC',
  enableMacro: 'ENABLE_RTC', tklHeader: 'tkl_rtc.h', idPrefix: null,
}

export function scaffold() {
  return { enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 1 }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  return errors
}
