export const meta = {
  key: 'i8080',
  label: 'MCU8080',
  enableMacro: 'ENABLE_MCU8080',
  tklHeader: 'tkl_8080.h',
  idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: null,
    count: 0,
    spec: {
      pixelFmt: ['TUYA_PIXEL_FMT_RGB565', 'TUYA_PIXEL_FMT_RGB666', 'TUYA_PIXEL_FMT_RGB888'],
      pixelFmtDataBits: {
        'TUYA_PIXEL_FMT_RGB565': [8, 16],
        'TUYA_PIXEL_FMT_RGB666': [9, 18],
        'TUYA_PIXEL_FMT_RGB888': [8, 16, 24],
      },
      clkFreq: { min: 0, max: 0 },
      ports: [
        {
          id: 0,
          pins: {
            rdx: 0,
            wdx: 0,
            rsx: 0,
            reset: 0,
            csx: 0,
            data: Array(24).fill(0),
          },
        },
      ],
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  else {
    const pins = data.spec.ports[0]?.pins
    if (pins && (!Array.isArray(pins.data) || pins.data.length !== 24))
      errors.push(`${path}.spec.ports[0].pins.data — 期望 24 元素 array`)
  }
  return errors
}
