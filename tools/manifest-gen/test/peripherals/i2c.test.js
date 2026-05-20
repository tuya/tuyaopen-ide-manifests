// test/peripherals/i2c.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/i2c.js'

describe('i2c 外设模块', () => {
  it('meta.key 为 i2c', () => expect(meta.key).toBe('i2c'))
  it('scaffold() spec.ports[0].pinGroups 为数组', () => {
    expect(Array.isArray(scaffold().spec.ports[0].pinGroups)).toBe(true)
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold()
    data.count = 3
    expect(validate(data, 'peripherals.i2c')).toEqual([])
  })
})
