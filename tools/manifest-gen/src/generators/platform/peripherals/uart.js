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
