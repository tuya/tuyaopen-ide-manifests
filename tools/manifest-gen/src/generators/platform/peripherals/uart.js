import { number, confirm } from '@inquirer/prompts'

export const meta = {
  key: 'uart',
  label: 'UART',
  enableMacro: 'ENABLE_UART',
  tklHeader: 'tkl_uart.h',
  idPrefix: 'TUYA_UART_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      baudrate: { min: 0, max: 0 },
      databits: [
        'TUYA_UART_DATA_LEN_5BIT',
        'TUYA_UART_DATA_LEN_6BIT',
        'TUYA_UART_DATA_LEN_7BIT',
        'TUYA_UART_DATA_LEN_8BIT',
      ],
      stopbits: ['TUYA_UART_STOP_LEN_1BIT', 'TUYA_UART_STOP_LEN_2BIT'],
      parity: [
        'TUYA_UART_PARITY_TYPE_NONE',
        'TUYA_UART_PARITY_TYPE_ODD',
        'TUYA_UART_PARITY_TYPE_EVEN',
      ],
      flowctrl: ['TUYA_UART_FLOWCTRL_NONE'],
      ports: [
        {
          id: 0,
          logPort: false,
          irq: { rx: false, tx: false },
          pinGroups: [{ tx: 0, rx: 0 }],
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

  const count = await number({ message: 'UART 数量:', default: data.count || 1 })
  data.count = count

  const ports = []
  for (let i = 0; i < count; i++) {
    const ep = data.spec.ports[i]
    const tx = await number({ message: `  UART[${i}] TX 引脚号:`, default: ep?.pinGroups[0]?.tx ?? 0 })
    const rx = await number({ message: `  UART[${i}] RX 引脚号:`, default: ep?.pinGroups[0]?.rx ?? 0 })
    const logPort = await confirm({ message: `  UART[${i}] 作为日志串口?`, default: ep?.logPort ?? false })
    ports.push({ id: i, logPort, irq: ep?.irq ?? { rx: false, tx: false }, pinGroups: [{ tx, rx }] })
  }
  data.spec.ports = ports

  return data
}
