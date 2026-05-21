import { number, confirm } from '@inquirer/prompts'

export const meta = {
  key: 'spi',
  label: 'SPI',
  enableMacro: 'ENABLE_SPI',
  tklHeader: 'tkl_spi.h',
  idPrefix: 'TUYA_SPI_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      role: [
        'TUYA_SPI_ROLE_MASTER',
        'TUYA_SPI_ROLE_SLAVE',
        'TUYA_SPI_ROLE_MASTER_SIMPLEX',
        'TUYA_SPI_ROLE_SLAVE_SIMPLEX',
      ],
      mode: ['TUYA_SPI_MODE0', 'TUYA_SPI_MODE1', 'TUYA_SPI_MODE2', 'TUYA_SPI_MODE3'],
      csType: ['TUYA_SPI_AUTO_TYPE', 'TUYA_SPI_SOFT_TYPE', 'TUYA_SPI_SOFT_ONE_WIRE_TYPE'],
      databits: ['TUYA_SPI_DATA_BIT8', 'TUYA_SPI_DATA_BIT16'],
      bitorder: ['TUYA_SPI_ORDER_MSB2LSB', 'TUYA_SPI_ORDER_LSB2MSB'],
      ports: [
        {
          id: 0,
          backend: 'spi',
          irq: false,
          dma: false,
          freq: { min: 0, max: 0 },
          pinGroups: [{ clk: 0, cs: 0, mosi: 0, miso: 0 }],
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
  else {
    data.spec.ports.forEach((port, i) => {
      if (!Array.isArray(port.pinGroups))
        errors.push(`${path}.spec.ports[${i}].pinGroups — 期望 array`)
    })
  }
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  data.count = await number({ message: 'SPI 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const ex = data.spec.ports[i]
    const clk  = await number({ message: `SPI[${i}] CLK 引脚:`,  default: ex?.pinGroups?.[0]?.clk  ?? 0 })
    const cs   = await number({ message: `SPI[${i}] CS 引脚:`,   default: ex?.pinGroups?.[0]?.cs   ?? 0 })
    const mosi = await number({ message: `SPI[${i}] MOSI 引脚:`, default: ex?.pinGroups?.[0]?.mosi ?? 0 })
    const miso = await number({ message: `SPI[${i}] MISO 引脚:`, default: ex?.pinGroups?.[0]?.miso ?? 0 })
    const freqMin = await number({ message: `SPI[${i}] 最低频率 (Hz):`, default: ex?.freq?.min ?? 0 })
    const freqMax = await number({ message: `SPI[${i}] 最高频率 (Hz):`, default: ex?.freq?.max ?? 0 })
    const dma = await confirm({ message: `SPI[${i}] 支持 DMA?`, default: ex?.dma ?? false })
    const irq = await confirm({ message: `SPI[${i}] 支持 IRQ?`, default: ex?.irq ?? false })
    ports.push({ id: i, backend: 'spi', irq, dma, freq: { min: freqMin, max: freqMax }, pinGroups: [{ clk, cs, mosi, miso }] })
  }
  data.spec.ports = ports
  return data
}
