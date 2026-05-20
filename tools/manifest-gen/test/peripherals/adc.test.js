import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/adc.js'

describe('adc 外设模块', () => {
  it('meta.key 为 adc', () => expect(meta.key).toBe('adc'))
  it('scaffold() spec.bits 为 12', () => expect(scaffold().spec.bits).toBe(12))
  it('scaffold() spec.ports[0].channels 为数组', () => {
    expect(Array.isArray(scaffold().spec.ports[0].channels)).toBe(true)
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 1
    expect(validate(data, 'peripherals.adc')).toEqual([])
  })
})
