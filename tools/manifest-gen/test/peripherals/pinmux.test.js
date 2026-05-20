import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/pinmux.js'

describe('pinmux 外设模块', () => {
  it('meta.key 为 pinmux', () => expect(meta.key).toBe('pinmux'))
  it('scaffold() spec.remappableFuncs 含 i2c/uart/spi/pwm/adc/dac/i2s 键', () => {
    const rf = scaffold().spec.remappableFuncs
    for (const k of ['i2c', 'uart', 'spi', 'pwm', 'adc', 'dac', 'i2s'])
      expect(rf).toHaveProperty(k)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.pinmux')).toEqual([]))
})
