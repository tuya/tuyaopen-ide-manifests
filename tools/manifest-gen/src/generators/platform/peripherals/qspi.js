import { number, confirm, select } from '@inquirer/prompts'
import chalk from 'chalk'

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

  // Sync ports array to match current count
  function syncPorts(ports, count) {
    const result = ports.slice(0, count)
    for (let i = result.length; i < count; i++) {
      result.push({ id: i, dma: false, pins: { clk: 0, cs: 0, d0: 0, d1: 0, d2: 0, d3: 0 } })
    }
    return result
  }

  while (true) {
    const portChoices = data.spec.ports.map((p, i) => {
      const pins = p.pins ?? { clk: 0, cs: 0, d0: 0, d1: 0, d2: 0, d3: 0 }
      return {
        name: `端口 ${i}  CLK:${pins.clk} CS:${pins.cs} D0:${pins.d0} D1:${pins.d1} D2:${pins.d2} D3:${pins.d3}`,
        value: `port:${i}`,
      }
    })

    const field = await select({
      message: 'QSPI 配置:',
      choices: [
        { name: `端口数: ${data.count}`, value: 'count' },
        ...portChoices,
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })

    if (field === 'done') break

    if (field === 'count') {
      data.count = await number({ message: 'QSPI 端口数:', default: data.count })
      data.spec.ports = syncPorts(data.spec.ports, data.count)
      continue
    }

    // port sub-menu
    const portIdx = parseInt(field.split(':')[1], 10)
    const port = data.spec.ports[portIdx]
    const pins = port.pins ?? { clk: 0, cs: 0, d0: 0, d1: 0, d2: 0, d3: 0 }
    port.pins = pins

    while (true) {
      const portField = await select({
        message: `QSPI 端口 ${portIdx} 配置:`,
        choices: [
          { name: `CLK 引脚: ${pins.clk}`, value: 'clk' },
          { name: `CS 引脚: ${pins.cs}`, value: 'cs' },
          { name: `D0 引脚: ${pins.d0}`, value: 'd0' },
          { name: `D1 引脚: ${pins.d1}`, value: 'd1' },
          { name: `D2 引脚: ${pins.d2}`, value: 'd2' },
          { name: `D3 引脚: ${pins.d3}`, value: 'd3' },
          { name: `DMA: ${port.dma ? '是' : '否'}`, value: 'dma' },
          { name: chalk.gray('← 返回'), value: 'back' },
        ],
      })

      if (portField === 'back') break

      if (portField === 'clk') {
        pins.clk = await number({ message: `QSPI[${portIdx}] CLK 引脚:`, default: pins.clk })
      } else if (portField === 'cs') {
        pins.cs = await number({ message: `QSPI[${portIdx}] CS 引脚:`, default: pins.cs })
      } else if (portField === 'd0') {
        pins.d0 = await number({ message: `QSPI[${portIdx}] D0 引脚:`, default: pins.d0 })
      } else if (portField === 'd1') {
        pins.d1 = await number({ message: `QSPI[${portIdx}] D1 引脚:`, default: pins.d1 })
      } else if (portField === 'd2') {
        pins.d2 = await number({ message: `QSPI[${portIdx}] D2 引脚:`, default: pins.d2 })
      } else if (portField === 'd3') {
        pins.d3 = await number({ message: `QSPI[${portIdx}] D3 引脚:`, default: pins.d3 })
      } else if (portField === 'dma') {
        port.dma = await confirm({ message: `QSPI[${portIdx}] 支持 DMA?`, default: port.dma })
      }
    }
  }

  return data
}
