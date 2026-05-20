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
