import { peripheralModules } from '../registry.js'

export function buildPlatform(answers) {
  const { platformId, variantId, name, arch, flashInterface, connectivity, memory, kconfig, selectedPeripherals, peripheralConfigs = {} } = answers

  const peripherals = {}
  for (const mod of peripheralModules) {
    if (selectedPeripherals.includes(mod.meta.key)) {
      peripherals[mod.meta.key] = peripheralConfigs[mod.meta.key] ?? mod.scaffold()
    }
  }

  return {
    schemaVersion: 1,
    platformId,
    id: variantId,
    name,
    arch,
    flashInterface,
    connectivity,
    memory,
    peripherals,
    kconfig,
  }
}

export function normalizePlatform(data) {
  const orderedPeripherals = {}
  for (const mod of peripheralModules) {
    if (data.peripherals?.[mod.meta.key]) {
      orderedPeripherals[mod.meta.key] = data.peripherals[mod.meta.key]
    }
  }
  for (const key of Object.keys(data.peripherals ?? {})) {
    if (!orderedPeripherals[key]) {
      process.stderr.write(`[normalize] 警告：未知外设键 "${key}" 已忽略\n`)
    }
  }
  return { ...data, peripherals: orderedPeripherals }
}
