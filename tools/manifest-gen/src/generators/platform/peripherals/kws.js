import { checkbox } from '@inquirer/prompts'

export const meta = {
  key: 'kws', label: 'KWS (关键词唤醒)',
  enableMacro: 'ENABLE_MEDIA', tklHeader: 'tkl_kws.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 1,
    spec: {
      wakeupWords: [
        'TKL_KWS_WAKEUP_NIHAO_TUYA', 'TKL_KWS_WAKEUP_NIHAO_XIAOZHI',
        'TKL_KWS_WAKEUP_HEY_TUYA', 'TKL_KWS_WAKEUP_SMARTLIFE',
        'TKL_KWS_WAKEUP_ZHINENGGUANJIA', 'TKL_KWS_WAKEUP_XIAOZHI_TONGXUE',
        'TKL_KWS_WAKEUP_XIAOZHI_GUANJIA', 'TKL_KWS_WAKEUP_XIAOAI_XIAOAI',
        'TKL_KWS_WAKEUP_XIAODU_XIAODU',
      ],
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (!Array.isArray(data.spec?.wakeupWords))
    errors.push(`${path}.spec.wakeupWords — 期望 array`)
  return errors
}

const ALL_WORDS = [
  'TKL_KWS_WAKEUP_NIHAO_TUYA', 'TKL_KWS_WAKEUP_NIHAO_XIAOZHI',
  'TKL_KWS_WAKEUP_HEY_TUYA', 'TKL_KWS_WAKEUP_SMARTLIFE',
  'TKL_KWS_WAKEUP_ZHINENGGUANJIA', 'TKL_KWS_WAKEUP_XIAOZHI_TONGXUE',
  'TKL_KWS_WAKEUP_XIAOZHI_GUANJIA', 'TKL_KWS_WAKEUP_XIAOAI_XIAOAI',
  'TKL_KWS_WAKEUP_XIAODU_XIAODU',
]

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  data.spec.wakeupWords = await checkbox({
    message: 'KWS 支持的唤醒词:',
    loop: false,
    choices: ALL_WORDS.map(w => ({ name: w, value: w, checked: data.spec.wakeupWords.includes(w) })),
  })
  return data
}
