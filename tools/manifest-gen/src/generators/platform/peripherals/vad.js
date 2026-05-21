import { number } from '@inquirer/prompts'

export const meta = {
  key: 'vad', label: 'VAD (语音活动检测)',
  enableMacro: 'ENABLE_MEDIA', tklHeader: 'tkl_vad.h', idPrefix: null,
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

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()
  data.count = await number({ message: 'VAD 数量:', default: data.count })
  return data
}
