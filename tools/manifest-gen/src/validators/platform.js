import { peripheralModules } from '../generators/registry.js'

const VALID_FLASH = ['qspi', 'spi']

export function validatePlatform(data) {
  const errors = []

  if (data.schemaVersion !== 1)
    errors.push(`schemaVersion — 期望 1，实际 ${data.schemaVersion}`)

  for (const field of ['platformId', 'id', 'name']) {
    if (typeof data[field] !== 'string')
      errors.push(`${field} — 期望 string，实际 ${typeof data[field]}`)
  }

  if (typeof data.arch !== 'string' || data.arch.length === 0)
    errors.push(`arch — 期望非空 string，实际 "${data.arch}"`)

  if (!VALID_FLASH.includes(data.flashInterface))
    errors.push(`flashInterface — 期望 qspi | spi，实际 "${data.flashInterface}"`)

  const mem = data.memory ?? {}
  for (const field of ['sramBytes', 'romBytes', 'flashMaxBytes', 'psramMaxBytes']) {
    if (typeof mem[field] !== 'number')
      errors.push(`memory.${field} — 期望 number，实际 ${typeof mem[field]}`)
  }

  if (data.connectivity == null || typeof data.connectivity !== 'object' || Array.isArray(data.connectivity))
    errors.push('connectivity — 期望 object')

  if (typeof data.kconfigId !== 'string' || data.kconfigId.length === 0)
    errors.push('kconfigId — 期望非空 string')

  if (data.peripherals && typeof data.peripherals === 'object') {
    for (const mod of peripheralModules) {
      const key = mod.meta.key
      if (data.peripherals[key]) {
        errors.push(...mod.validate(data.peripherals[key], `peripherals.${key}`))
      }
    }
  }

  return errors
}
