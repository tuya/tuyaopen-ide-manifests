import { input } from '@inquirer/prompts'
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
  const remappableFuncs = {}
  for (const fn of funcs) {
    const ex = data.spec.remappableFuncs[fn] ?? []
    const pinsStr = await input({
      message: `${fn.toUpperCase()} 可重映射引脚（支持范围，如 0-5,8；留空=无）:`,
      default: pinsToRangeStr(ex),
    })
    remappableFuncs[fn] = pinsStr.trim() ? parseRangePins(pinsStr) : []
  }
  data.spec.remappableFuncs = remappableFuncs
  return data
}
