import { describe, it, expect } from 'vitest'
import { buildPlatform, normalizePlatform } from '../src/generators/platform/builder.js'

const minimalAnswers = {
  platformId: 'test-plat',
  variantId: 'test-v1',
  name: 'Test Platform',
  arch: 'arm-cortex-m33',
  flashInterface: 'qspi',
  connectivity: {
    wifi: { enabled: true, enableMacro: 'ENABLE_WIFI', standard: '802.11b/g/n/ax', bands: ['2.4GHz'], security: ['WPA2'], modes: ['STA'] },
    ble: { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version: '5.4' },
    ethernet: { enabled: false, enableMacro: 'ENABLE_WIRED' },
    cellular: { enabled: false, enableMacro: 'ENABLE_CELLULAR' },
  },
  memory: { sramBytes: 1024, romBytes: 512, flashMaxBytes: 4096, psramMaxBytes: 0, efuse: false },
  kconfigId: 'TEST_PLAT',
  selectedPeripherals: ['gpio', 'uart'],
}

describe('buildPlatform()', () => {
  it('顶层字段正确', () => {
    const result = buildPlatform(minimalAnswers)
    expect(result.schemaVersion).toBe(1)
    expect(result.platformId).toBe('test-plat')
    expect(result.id).toBe('test-v1')
    expect(result.arch).toBe('arm-cortex-m33')
  })

  it('只包含选中的外设', () => {
    const result = buildPlatform(minimalAnswers)
    expect(result.peripherals).toHaveProperty('gpio')
    expect(result.peripherals).toHaveProperty('uart')
    expect(result.peripherals).not.toHaveProperty('spi')
    expect(result.peripherals).not.toHaveProperty('kws')
  })

  it('外设结构为有效 scaffold', () => {
    const result = buildPlatform(minimalAnswers)
    expect(result.peripherals.gpio.count).toBe(0)
    expect(Array.isArray(result.peripherals.gpio.spec.pins)).toBe(true)
  })

  it('外设键顺序按 registry 顺序（gpio 在 uart 前）', () => {
    const result = buildPlatform(minimalAnswers)
    const keys = Object.keys(result.peripherals)
    expect(keys.indexOf('gpio')).toBeLessThan(keys.indexOf('uart'))
  })
})

describe('normalizePlatform()', () => {
  it('重排外设键顺序为 registry 顺序', () => {
    const data = {
      ...buildPlatform(minimalAnswers),
      peripherals: { uart: buildPlatform(minimalAnswers).peripherals.uart, gpio: buildPlatform(minimalAnswers).peripherals.gpio },
    }
    const normalized = normalizePlatform(data)
    const keys = Object.keys(normalized.peripherals)
    expect(keys.indexOf('gpio')).toBeLessThan(keys.indexOf('uart'))
  })
})
