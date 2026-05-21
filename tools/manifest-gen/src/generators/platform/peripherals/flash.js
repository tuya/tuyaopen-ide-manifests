import { input, number, select } from '@inquirer/prompts'

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

  const partCount = await number({ message: 'Flash 分区数:', default: data.spec.partitionMap.length })

  const partitionMap = []
  for (let i = 0; i < partCount; i++) {
    const ex = data.spec.partitionMap[i] ?? {}
    const type      = await select({
      message: `分区[${i}] 类型:`,
      choices: data.spec.partitionTypes.map(t => ({ value: t })),
      default: ex.type ?? data.spec.partitionTypes[0],
    })
    const startAddr = await input({ message: `分区[${i}] 起始地址 (0x...):`, default: ex.startAddr ?? '0x000000' })
    const endAddr   = await input({ message: `分区[${i}] 结束地址 (0x...):`, default: ex.endAddr   ?? '0x000000' })
    const size      = await number({ message: `分区[${i}] 大小 (bytes):`,      default: ex.size      ?? 0 })
    const blockSize = await number({ message: `分区[${i}] 块大小 (bytes):`,    default: ex.blockSize ?? 4096 })
    const desc      = await input({ message: `分区[${i}] 描述:`,               default: ex.desc      ?? '' })
    partitionMap.push({ type, startAddr, endAddr, size, blockSize, desc })
  }
  data.spec.partitionMap = partitionMap
  return data
}
