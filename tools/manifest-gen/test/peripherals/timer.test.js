import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/timer.js'

describe('timer 外设模块', () => {
  it('meta.key 为 timer', () => expect(meta.key).toBe('timer'))
  it('scaffold() spec.bits 为 32', () => expect(scaffold().spec.bits).toBe(32))
  it('scaffold() spec.ids 为数组', () => expect(Array.isArray(scaffold().spec.ids)).toBe(true))
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 3; data.spec.ids = [3, 4, 5]
    expect(validate(data, 'peripherals.timer')).toEqual([])
  })
})
