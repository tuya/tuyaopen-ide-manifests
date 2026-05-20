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
