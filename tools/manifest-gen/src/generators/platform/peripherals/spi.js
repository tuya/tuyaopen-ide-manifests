import { number, confirm, select } from '@inquirer/prompts'
import chalk from 'chalk'

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

  // Sync ports array to match current count
  function syncPorts(ports, count) {
    const result = ports.slice(0, count)
    for (let i = result.length; i < count; i++) {
      result.push({ id: i, backend: 'spi', irq: false, dma: false, freq: { min: 0, max: 0 }, pinGroups: [{ clk: 0, cs: 0, mosi: 0, miso: 0 }] })
    }
    return result
  }

  while (true) {
    const portChoices = data.spec.ports.map((p, i) => {
      const pg = p.pinGroups[0] ?? { clk: 0, cs: 0, mosi: 0, miso: 0 }
      return {
        name: `端口 ${i}  CLK:${pg.clk} CS:${pg.cs} MOSI:${pg.mosi} MISO:${pg.miso}`,
        value: `port:${i}`,
      }
    })

    const field = await select({
      message: 'SPI 配置:',
      choices: [
        { name: `端口数: ${data.count}`, value: 'count' },
        ...portChoices,
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })

    if (field === 'done') break

    if (field === 'count') {
      data.count = await number({ message: 'SPI 端口数:', default: data.count })
      data.spec.ports = syncPorts(data.spec.ports, data.count)
      continue
    }

    // port sub-menu
    const portIdx = parseInt(field.split(':')[1], 10)
    const port = data.spec.ports[portIdx]
    const pg = port.pinGroups[0] ?? { clk: 0, cs: 0, mosi: 0, miso: 0 }
    port.pinGroups[0] = pg

    while (true) {
      const portField = await select({
        message: `SPI 端口 ${portIdx} 配置:`,
        choices: [
          { name: `CLK 引脚: ${pg.clk}`, value: 'clk' },
          { name: `CS 引脚: ${pg.cs}`, value: 'cs' },
          { name: `MOSI 引脚: ${pg.mosi}`, value: 'mosi' },
          { name: `MISO 引脚: ${pg.miso}`, value: 'miso' },
          { name: `最低频率(Hz): ${port.freq.min}`, value: 'freqMin' },
          { name: `最高频率(Hz): ${port.freq.max}`, value: 'freqMax' },
          { name: `DMA: ${port.dma ? '是' : '否'}`, value: 'dma' },
          { name: `IRQ: ${port.irq ? '是' : '否'}`, value: 'irq' },
          { name: chalk.gray('← 返回'), value: 'back' },
        ],
      })

      if (portField === 'back') break

      if (portField === 'clk') {
        pg.clk = await number({ message: `SPI[${portIdx}] CLK 引脚:`, default: pg.clk })
      } else if (portField === 'cs') {
        pg.cs = await number({ message: `SPI[${portIdx}] CS 引脚:`, default: pg.cs })
      } else if (portField === 'mosi') {
        pg.mosi = await number({ message: `SPI[${portIdx}] MOSI 引脚:`, default: pg.mosi })
      } else if (portField === 'miso') {
        pg.miso = await number({ message: `SPI[${portIdx}] MISO 引脚:`, default: pg.miso })
      } else if (portField === 'freqMin') {
        port.freq.min = await number({ message: `SPI[${portIdx}] 最低频率 (Hz):`, default: port.freq.min })
      } else if (portField === 'freqMax') {
        port.freq.max = await number({ message: `SPI[${portIdx}] 最高频率 (Hz):`, default: port.freq.max })
      } else if (portField === 'dma') {
        port.dma = await confirm({ message: `SPI[${portIdx}] 支持 DMA?`, default: port.dma })
      } else if (portField === 'irq') {
        port.irq = await confirm({ message: `SPI[${portIdx}] 支持 IRQ?`, default: port.irq })
      }
    }
  }

  return data
}
