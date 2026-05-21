import { input, select } from '@inquirer/prompts'
import chalk from 'chalk'
import { parseRangePins, pinsToRangeStr } from './_pin-utils.js'

export const meta = {
  key: 'pinmux',
  label: 'Pin Mux',
  enableMacro: null,
  tklHeader: 'tkl_pinmux.h',
  idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 1,
    spec: {
      remappableFuncs: { i2c: [], uart: [], spi: [], pwm: [], adc: [], dac: [], i2s: [] },
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (typeof data.spec?.remappableFuncs !== 'object' || data.spec.remappableFuncs === null)
    errors.push(`${path}.spec.remappableFuncs — 期望 object`)
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  const funcs = ['i2c', 'uart', 'spi', 'pwm', 'adc', 'dac', 'i2s']

  while (true) {
    const field = await select({
      message: 'Pin Mux 配置:',
      choices: [
        ...funcs.map(fn => ({
          name: `${fn.toUpperCase()}: ${pinsToRangeStr(data.spec.remappableFuncs[fn] ?? [])}`,
          value: fn,
        })),
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })
    if (field === 'done') break
    const ex = data.spec.remappableFuncs[field] ?? []
    const pinsStr = await input({
      message: `${field.toUpperCase()} 可重映射引脚（支持范围，如 0-5,8；留空=无）:`,
      default: pinsToRangeStr(ex),
    })
    data.spec.remappableFuncs[field] = pinsStr.trim() ? parseRangePins(pinsStr) : []
  }
  return data
}
