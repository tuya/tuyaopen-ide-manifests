import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/kws.js'

describe('kws 外设模块', () => {
  it('meta.key 为 kws', () => expect(meta.key).toBe('kws'))
  it('scaffold() spec.wakeupWords 为非空数组', () => {
    expect(scaffold().spec.wakeupWords.length).toBeGreaterThan(0)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.kws')).toEqual([]))
})
