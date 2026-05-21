import { number, select } from '@inquirer/prompts'
import chalk from 'chalk'

export const meta = {
  key: 'wdt', label: 'Watchdog',
  enableMacro: 'ENABLE_WATCHDOG', tklHeader: 'tkl_watchdog.h', idPrefix: null,
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

  while (true) {
    const field = await select({
      message: 'Watchdog 配置:',
      loop: false,
      choices: [
        { name: `数量: ${data.count}`, value: 'count' },
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })
    if (field === 'done') break
    if (field === 'count') {
      data.count = await number({ message: 'Watchdog 数量:', default: data.count })
    }
  }
  return data
}
