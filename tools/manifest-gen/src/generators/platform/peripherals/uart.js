import { number, confirm, select } from '@inquirer/prompts'
import chalk from 'chalk'

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

  while (true) {
    // Sync ports array to match data.count
    while (data.spec.ports.length < data.count) {
      const i = data.spec.ports.length
      data.spec.ports.push({ id: i, tx: 0, rx: 0, logPort: false })
    }
    if (data.spec.ports.length > data.count) {
      data.spec.ports = data.spec.ports.slice(0, data.count)
    }

    const portChoices = data.spec.ports.map((p, i) => {
      const tx = p.pinGroups?.[0]?.tx ?? p.tx ?? 0
      const rx = p.pinGroups?.[0]?.rx ?? p.rx ?? 0
      const log = p.logPort ? chalk.yellow(' (log)') : ''
      return { name: `端口 ${i}        ${chalk.gray(`TX:${tx} RX:${rx}`)}${log}`, value: `port:${i}` }
    })

    const field = await select({
      message: 'UART 配置:',
      loop: false,
      choices: [
        { name: `端口数       ${chalk.gray(String(data.count))}`, value: 'count' },
        ...portChoices,
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })

    if (field === 'done') break

    if (field === 'count') {
      data.count = await number({ message: 'UART 数量:', default: data.count || 1 })
    } else if (field.startsWith('port:')) {
      const idx = parseInt(field.slice(5), 10)
      const port = data.spec.ports[idx]
      const currentTx = port.pinGroups?.[0]?.tx ?? port.tx ?? 0
      const currentRx = port.pinGroups?.[0]?.rx ?? port.rx ?? 0

      // Port sub-menu
      while (true) {
        const sub = await select({
          message: `UART[${idx}] 配置:`,
          loop: false,
          choices: [
            { name: `TX 引脚      ${chalk.gray(String(currentTx))}`, value: 'tx' },
            { name: `RX 引脚      ${chalk.gray(String(currentRx))}`, value: 'rx' },
            { name: `日志端口     ${chalk.gray(port.logPort ? '是' : '否')}`, value: 'log' },
            { name: chalk.gray('← 返回'), value: 'back' },
          ],
        })
        if (sub === 'back') break
        if (sub === 'tx') {
          const tx = await number({ message: `UART[${idx}] TX 引脚号:`, default: currentTx })
          if (port.pinGroups) port.pinGroups[0].tx = tx
          else port.tx = tx
        } else if (sub === 'rx') {
          const rx = await number({ message: `UART[${idx}] RX 引脚号:`, default: currentRx })
          if (port.pinGroups) port.pinGroups[0].rx = rx
          else port.rx = rx
        } else if (sub === 'log') {
          port.logPort = await confirm({ message: `UART[${idx}] 作为日志串口?`, default: port.logPort ?? false })
        }
      }
    }
  }

  // Normalize ports to canonical shape before returning
  data.spec.ports = data.spec.ports.map((p, i) => ({
    id: i,
    logPort: p.logPort ?? false,
    irq: p.irq ?? { rx: false, tx: false },
    pinGroups: p.pinGroups ?? [{ tx: p.tx ?? 0, rx: p.rx ?? 0 }],
  }))

  return data
}
