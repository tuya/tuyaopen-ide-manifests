import { describe, it, expect } from 'vitest'
import { validatePlatform } from '../src/validators/platform.js'
import { buildPlatform } from '../src/generators/platform/builder.js'

const validAnswers = {
  platformId: 't5ai', variantId: 't5ai', name: 'T5AI',
  arch: 'arm-cortex-m33', flashInterface: 'qspi',
  connectivity: {
    wifi: { enabled: true, enableMacro: 'ENABLE_WIFI', standard: '802.11b/g/n/ax', bands: ['2.4GHz'], security: ['WPA2'], modes: ['STA'] },
    ble: { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version: '5.4' },
    ethernet: { enabled: false, enableMacro: 'ENABLE_WIRED' },
    cellular: { enabled: false, enableMacro: 'ENABLE_CELLULAR' },
  },
  memory: { sramBytes: 655360, romBytes: 65536, flashMaxBytes: 16777216, psramMaxBytes: 16777216, efuse: true },
  kconfigId: 'T5AI',
  selectedPeripherals: ['gpio', 'uart'],
}

describe('validatePlatform()', () => {
  it('有效 platform 无错误', () => {
    const data = buildPlatform(validAnswers)
    expect(validatePlatform(data)).toEqual([])
  })

  it('schemaVersion 非 1 时报错', () => {
    const data = buildPlatform(validAnswers)
    data.schemaVersion = 2
    expect(validatePlatform(data).some(e => e.includes('schemaVersion'))).toBe(true)
  })

  it('platformId 为 number 时报错', () => {
    const data = buildPlatform(validAnswers)
    data.platformId = 123
    expect(validatePlatform(data).some(e => e.includes('platformId'))).toBe(true)
  })

  it('memory.sramBytes 为 string 时报错', () => {
    const data = buildPlatform(validAnswers)
    data.memory.sramBytes = '655360'
    expect(validatePlatform(data).some(e => e.includes('sramBytes'))).toBe(true)
  })

  it('外设校验错误被汇总', () => {
    const data = buildPlatform(validAnswers)
    data.peripherals.gpio.count = 'bad'
    const errors = validatePlatform(data)
    expect(errors.some(e => e.includes('peripherals.gpio.count'))).toBe(true)
  })
})
