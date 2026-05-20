export const meta = {
  key: 'dma2d',
  label: 'DMA2D',
  enableMacro: 'ENABLE_DMA2D',
  tklHeader: 'tkl_dma2d.h',
  idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 1,
    spec: { formats: ['TUYA_FRAME_FMT_YUV422', 'TUYA_FRAME_FMT_RGB565', 'TUYA_FRAME_FMT_RGB888'] },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (!Array.isArray(data.spec?.formats))
    errors.push(`${path}.spec.formats — 期望 array`)
  return errors
}
