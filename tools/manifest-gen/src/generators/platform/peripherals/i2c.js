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
