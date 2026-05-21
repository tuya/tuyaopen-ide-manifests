import { number, confirm } from '@inquirer/prompts'

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

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  data.count = await number({ message: 'QSPI 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const ex = data.spec.ports[i]
    const exPins = ex?.pins ?? {}
    const clk = await number({ message: `QSPI[${i}] CLK 引脚:`, default: exPins.clk ?? 0 })
    const cs  = await number({ message: `QSPI[${i}] CS 引脚:`,  default: exPins.cs  ?? 0 })
    const d0  = await number({ message: `QSPI[${i}] D0 引脚:`,  default: exPins.d0  ?? 0 })
    const d1  = await number({ message: `QSPI[${i}] D1 引脚:`,  default: exPins.d1  ?? 0 })
    const d2  = await number({ message: `QSPI[${i}] D2 引脚:`,  default: exPins.d2  ?? 0 })
    const d3  = await number({ message: `QSPI[${i}] D3 引脚:`,  default: exPins.d3  ?? 0 })
    const dma = await confirm({ message: `QSPI[${i}] 支持 DMA?`, default: ex?.dma ?? false })
    ports.push({ id: i, dma, pins: { clk, cs, d0, d1, d2, d3 } })
  }
  data.spec.ports = ports
  return data
}
