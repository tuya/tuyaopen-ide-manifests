import { number, confirm, select } from '@inquirer/prompts'

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

  data.count = await number({ message: 'I2C 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const ex = data.spec.ports[i]
    const type = await select({
      message: `I2C[${i}] 类型:`,
      choices: [{ value: 'hw' }, { value: 'sw' }],
      default: ex?.type?.[0] ?? 'hw',
    })
    const irq = await confirm({ message: `I2C[${i}] 支持 IRQ?`, default: ex?.irq ?? false })

    let pinGroups
    if (type === 'hw') {
      const scl = await number({ message: `I2C[${i}] SCL 引脚:`, default: ex?.pinGroups?.[0]?.scl ?? 0 })
      const sda = await number({ message: `I2C[${i}] SDA 引脚:`, default: ex?.pinGroups?.[0]?.sda ?? 0 })
      pinGroups = [{ scl, sda }]
    } else {
      // sw: any GPIO can be used — collect multiple validated pin combinations
      const groupCount = await number({
        message: `I2C[${i}] (SW) 引脚组合数（平台上已验证的 SCL/SDA 组合）:`,
        default: ex?.pinGroups?.length ?? 1,
      })
      pinGroups = []
      for (let g = 0; g < groupCount; g++) {
        const scl = await number({ message: `I2C[${i}] 组合${g} SCL 引脚:`, default: ex?.pinGroups?.[g]?.scl ?? 0 })
        const sda = await number({ message: `I2C[${i}] 组合${g} SDA 引脚:`, default: ex?.pinGroups?.[g]?.sda ?? 0 })
        pinGroups.push({ scl, sda })
      }
    }

    ports.push({ id: i, type: [type], irq, pinGroups })
  }
  data.spec.ports = ports
  return data
}
