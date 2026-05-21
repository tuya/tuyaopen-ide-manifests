import { input, number, select } from '@inquirer/prompts'
import chalk from 'chalk'

export const meta = {
  key: 'flash', label: 'Flash',
  enableMacro: null, tklHeader: 'tkl_flash.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: null,
    tklHeader: meta.tklHeader,
    idPrefix: null,
    count: 1,
    spec: {
      partitionTypes: [
        'TUYA_FLASH_TYPE_APP',
        'TUYA_FLASH_TYPE_APP_BIN',
        'TUYA_FLASH_TYPE_OTA',
        'TUYA_FLASH_TYPE_USER0',
        'TUYA_FLASH_TYPE_USER1',
        'TUYA_FLASH_TYPE_KV_DATA',
        'TUYA_FLASH_TYPE_KV_SWAP',
        'TUYA_FLASH_TYPE_KV_KEY',
        'TUYA_FLASH_TYPE_UF',
        'TUYA_FLASH_TYPE_INFO',
        'TUYA_FLASH_TYPE_KV_UF',
        'TUYA_FLASH_TYPE_KV_PROTECT',
        'TUYA_FLASH_TYPE_RCD',
      ],
      partitionMap: [
        {
          type: 'TUYA_FLASH_TYPE_APP',
          startAddr: '0x000000',
          endAddr: '0x000000',
          size: 0,
          blockSize: 4096,
          desc: '',
        },
      ],
    },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (!Array.isArray(data.spec?.partitionMap))
    errors.push(`${path}.spec.partitionMap — 期望 array`)
  else {
    data.spec.partitionMap.forEach((p, i) => {
      if (typeof p.startAddr !== 'string')
        errors.push(`${path}.spec.partitionMap[${i}].startAddr — 期望 string`)
      if (typeof p.size !== 'number')
        errors.push(`${path}.spec.partitionMap[${i}].size — 期望 number`)
    })
  }
  return errors
}

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  while (true) {
    const choices = [
      { name: `分区数: ${chalk.gray(String(data.spec.partitionMap.length))}`, value: 'count' },
      ...data.spec.partitionMap.map((p, i) => ({
        name: `分区${i}  ${p.type} ${p.startAddr}`,
        value: `part:${i}`,
      })),
      { name: chalk.green('✔ 完成'), value: 'done' },
    ]

    const action = await select({ message: 'Flash 配置:', loop: false, choices })

    if (action === 'done') break

    if (action === 'count') {
      const newCount = await number({ message: 'Flash 分区数:', default: data.spec.partitionMap.length })
      while (data.spec.partitionMap.length < newCount)
        data.spec.partitionMap.push({
          type: 'TUYA_FLASH_TYPE_APP',
          startAddr: '0x000000',
          endAddr: '0x000000',
          size: 0,
          blockSize: 4096,
          desc: '',
        })
      data.spec.partitionMap = data.spec.partitionMap.slice(0, newCount)
      data.count = newCount
    } else {
      const idx = Number(action.split(':')[1])
      const p = data.spec.partitionMap[idx]

      while (true) {
        const sub = await select({
          message: `Flash 分区${idx} 配置:`,
          loop: false,
          choices: [
            { name: `类型: ${chalk.gray(p.type)}`, value: 'type' },
            { name: `起始地址: ${chalk.gray(p.startAddr)}`, value: 'startAddr' },
            { name: `结束地址: ${chalk.gray(p.endAddr)}`, value: 'endAddr' },
            { name: `大小: ${chalk.gray(String(p.size) + ' bytes')}`, value: 'size' },
            { name: `块大小: ${chalk.gray(String(p.blockSize) + ' bytes')}`, value: 'blockSize' },
            { name: `描述: ${chalk.gray(p.desc ? '"' + p.desc + '"' : '""')}`, value: 'desc' },
            { name: chalk.gray('← 返回'), value: 'back' },
          ],
        })

        if (sub === 'back') break
        if (sub === 'type') {
          p.type = await select({
            message: `分区${idx} 类型:`,
            loop: false,
            choices: data.spec.partitionTypes.map(t => ({ value: t })),
            default: p.type,
          })
        } else if (sub === 'startAddr') {
          p.startAddr = await input({ message: `分区${idx} 起始地址 (0x...):`, default: p.startAddr })
        } else if (sub === 'endAddr') {
          p.endAddr = await input({ message: `分区${idx} 结束地址 (0x...):`, default: p.endAddr })
        } else if (sub === 'size') {
          p.size = await number({ message: `分区${idx} 大小 (bytes):`, default: p.size })
        } else if (sub === 'blockSize') {
          p.blockSize = await number({ message: `分区${idx} 块大小 (bytes):`, default: p.blockSize })
        } else if (sub === 'desc') {
          p.desc = await input({ message: `分区${idx} 描述:`, default: p.desc })
        }
      }
    }
  }

  return data
}
