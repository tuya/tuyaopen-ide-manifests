import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/pwm.js'

describe('pwm 外设模块', () => {
  it('meta.key 为 pwm', () => expect(meta.key).toBe('pwm'))
  it('scaffold() spec.channels 为数组', () => expect(Array.isArray(scaffold().spec.channels)).toBe(true))
  it('scaffold() spec.duty.max 为 10000', () => expect(scaffold().spec.duty.max).toBe(10000))
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 12
    expect(validate(data, 'peripherals.pwm')).toEqual([])
  })
  it('validate() spec.channels 非数组时报错', () => {
    const data = scaffold(); data.count = 12; data.spec.channels = null
    expect(validate(data, 'peripherals.pwm').length).toBeGreaterThan(0)
  })
})
