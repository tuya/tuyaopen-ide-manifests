import { number, confirm, checkbox, select } from '@inquirer/prompts'
import chalk from 'chalk'

export const meta = {
  key: 'i2c',
  label: 'I2C',
  enableMacro: 'ENABLE_I2C',
  tklHeader: 'tkl_i2c.h',
  idPrefix: 'TUYA_I2C_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      role: ['TUYA_IIC_MODE_MASTER'],
      speed: ['TUYA_IIC_BUS_SPEED_100K', 'TUYA_IIC_BUS_SPEED_400K'],
      addrWidth: ['TUYA_IIC_ADDRESS_7BIT'],
      portType: ['hw', 'sw'],
      ports: [
        {
          id: 0,
          type: ['hw', 'sw'],
          irq: false,
          swAnyGpio: false,
          pinGroups: [{ scl: 0, sda: 0 }],
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
      result.push({ id: i, type: ['hw'], irq: false, swAnyGpio: false, pinGroups: [] })
    }
    return result
  }

  while (true) {
    const portChoices = data.spec.ports.map((p, i) => {
      const typeStr = p.type.join('/')
      const anyGpio = p.swAnyGpio ? ' 任意GPIO' : ''
      return { name: `端口 ${i}  [${typeStr}${anyGpio}]`, value: `port:${i}` }
    })
    const field = await select({
      message: 'I2C 配置:',
      choices: [
        { name: `端口数: ${data.count}`, value: 'count' },
        ...portChoices,
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })

    if (field === 'done') break

    if (field === 'count') {
      data.count = await number({ message: 'I2C 端口数:', default: data.count })
      data.spec.ports = syncPorts(data.spec.ports, data.count)
      continue
    }

    // port sub-menu
    const portIdx = parseInt(field.split(':')[1], 10)
    const port = data.spec.ports[portIdx]

    while (true) {
      const hwPinGroupEntries = port.type.includes('hw')
        ? port.pinGroups.map((pg, g) => ({
            name: `HW 组${g}  SCL:${pg.scl} SDA:${pg.sda}`,
            value: `pg:${g}`,
          }))
        : []

      const hwCountEntry = port.type.includes('hw')
        ? [{ name: `HW 引脚组合数: ${port.pinGroups.length}`, value: 'hwCount' }]
        : []

      const swAnyGpioEntry = port.type.includes('sw')
        ? [{ name: `软件任意GPIO: ${port.swAnyGpio ? '是' : '否'}`, value: 'swAnyGpio' }]
        : []

      const portField = await select({
        message: `I2C 端口 ${portIdx} 配置:`,
        choices: [
          { name: `模式: ${port.type.join(', ')}`, value: 'type' },
          { name: `IRQ: ${port.irq ? '是' : '否'}`, value: 'irq' },
          ...hwCountEntry,
          ...hwPinGroupEntries,
          ...swAnyGpioEntry,
          { name: chalk.gray('← 返回'), value: 'back' },
        ],
      })

      if (portField === 'back') break

      if (portField === 'type') {
        port.type = await checkbox({
          message: `I2C[${portIdx}] 支持的模式（可多选）:`,
          loop: false,
          choices: [
            { name: 'hw（硬件 I2C）', value: 'hw', checked: port.type.includes('hw') },
            { name: 'sw（软件模拟，任意 GPIO）', value: 'sw', checked: port.type.includes('sw') },
          ],
        })
        // Sync pinGroups: if hw removed, clear them; if sw removed, clear swAnyGpio
        if (!port.type.includes('hw')) port.pinGroups = []
        if (!port.type.includes('sw')) port.swAnyGpio = false
      } else if (portField === 'irq') {
        port.irq = await confirm({ message: `I2C[${portIdx}] 支持 IRQ?`, default: port.irq })
      } else if (portField === 'hwCount') {
        const hwCount = await number({
          message: `I2C[${portIdx}] 硬件引脚组合数:`,
          default: port.pinGroups.length || 1,
        })
        // Rebuild pinGroups to new count
        const newGroups = port.pinGroups.slice(0, hwCount)
        for (let g = newGroups.length; g < hwCount; g++) {
          newGroups.push({ scl: 0, sda: 0 })
        }
        port.pinGroups = newGroups
      } else if (portField === 'swAnyGpio') {
        port.swAnyGpio = await confirm({ message: `I2C[${portIdx}] 软件任意 GPIO?`, default: port.swAnyGpio })
      } else if (portField.startsWith('pg:')) {
        const gIdx = parseInt(portField.split(':')[1], 10)
        const pg = port.pinGroups[gIdx]

        // pin group sub-sub-menu
        while (true) {
          const pgField = await select({
            message: `I2C[${portIdx}] HW 组${gIdx}:`,
            choices: [
              { name: `SCL: ${pg.scl}`, value: 'scl' },
              { name: `SDA: ${pg.sda}`, value: 'sda' },
              { name: chalk.gray('← 返回'), value: 'back' },
            ],
          })
          if (pgField === 'back') break
          if (pgField === 'scl') {
            pg.scl = await number({ message: `I2C[${portIdx}] HW 组${gIdx} SCL 引脚:`, default: pg.scl })
          } else if (pgField === 'sda') {
            pg.sda = await number({ message: `I2C[${portIdx}] HW 组${gIdx} SDA 引脚:`, default: pg.sda })
          }
        }
      }
    }
  }

  return data
}
