export const meta = {
  key: 'qspi',
  label: 'QSPI',
  enableMacro: 'ENABLE_QSPI',
  tklHeader: 'tkl_qspi.h',
  idPrefix: 'TUYA_QSPI_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      wireMode: ['TUYA_QSPI_1WIRE', 'TUYA_QSPI_2WIRE', 'TUYA_QSPI_4WIRE'],
      role: ['TUYA_QSPI_ROLE_MASTER'],
      type: ['TUYA_QSPI_TYPE_FLASH', 'TUYA_QSPI_TYPE_LCD', 'TUYA_QSPI_TYPE_PSRAM'],
      mode: ['TUYA_SPI_MODE0', 'TUYA_SPI_MODE1', 'TUYA_SPI_MODE2', 'TUYA_SPI_MODE3'],
      freq: { min: 0, max: 0 },
      ports: [
        {
          id: 0,
          dma: false,
          pins: { clk: 0, cs: 0, d0: 0, d1: 0, d2: 0, d3: 0 },
        },
      ],
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  return errors
}
