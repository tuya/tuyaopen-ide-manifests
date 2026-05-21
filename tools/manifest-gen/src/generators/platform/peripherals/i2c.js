import { number, confirm, checkbox } from '@inquirer/prompts'

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

  data.count = await number({ message: 'I2C 端口数:', default: data.count })

  const ports = []
  for (let i = 0; i < data.count; i++) {
    const ex = data.spec.ports[i]
    const types = await checkbox({
      message: `I2C[${i}] 支持的模式（可多选）:`,
      loop: false,
      choices: [
        { name: 'hw（硬件 I2C）', value: 'hw', checked: ex?.type?.includes('hw') ?? true },
        { name: 'sw（软件模拟，任意 GPIO）', value: 'sw', checked: ex?.type?.includes('sw') ?? false },
      ],
    })
    const irq = await confirm({ message: `I2C[${i}] 支持 IRQ?`, default: ex?.irq ?? false })

    const pinGroups = []

    if (types.includes('hw')) {
      const hwCount = await number({
        message: `I2C[${i}] 硬件引脚组合数（pinmux 可选的 SCL/SDA 组合）:`,
        default: ex?.pinGroups?.length ?? 1,
      })
      for (let g = 0; g < hwCount; g++) {
        const exG = ex?.pinGroups?.[g]
        const scl = await number({ message: `I2C[${i}] HW 组合${g} SCL 引脚:`, default: exG?.scl ?? 0 })
        const sda = await number({ message: `I2C[${i}] HW 组合${g} SDA 引脚:`, default: exG?.sda ?? 0 })
        pinGroups.push({ scl, sda })
      }
    }

    const swAnyGpio = types.includes('sw')

    ports.push({ id: i, type: types, irq, swAnyGpio, pinGroups })
  }
  data.spec.ports = ports
  return data
}
