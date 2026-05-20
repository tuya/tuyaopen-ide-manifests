export const meta = {
  key: 'rgb',
  label: 'RGB LCD',
  enableMacro: 'ENABLE_RGB',
  tklHeader: 'tkl_rgb.h',
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
      outDataClkEdge: ['TUYA_RGB_DATA_IN_FALLING_EDGE', 'TUYA_RGB_DATA_IN_RISING_EDGE'],
      dclkFreq: { min: 0, max: 0 },
      ports: [
        {
          id: 0,
          pins: {
            dclk: 0,
            disp: 0,
            de: 0,
            hsync: 0,
            vsync: 0,
            r: [0, 0, 0, 0, 0, 0, 0, 0],
            g: [0, 0, 0, 0, 0, 0, 0, 0],
            b: [0, 0, 0, 0, 0, 0, 0, 0],
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
    if (pins) {
      if (!Array.isArray(pins.r) || pins.r.length !== 8)
        errors.push(`${path}.spec.ports[0].pins.r — 期望 8 元素 array`)
    }
  }
  return errors
}
