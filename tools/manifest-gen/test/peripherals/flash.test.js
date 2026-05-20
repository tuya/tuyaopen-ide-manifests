// test/peripherals/flash.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/flash.js'

describe('flash 外设模块', () => {
  it('meta.key 为 flash', () => expect(meta.key).toBe('flash'))
  it('scaffold() spec.partitionTypes 非空数组', () => {
    expect(Array.isArray(scaffold().spec.partitionTypes)).toBe(true)
    expect(scaffold().spec.partitionTypes.length).toBeGreaterThan(0)
  })
  it('scaffold() spec.partitionMap 为数组', () => {
    expect(Array.isArray(scaffold().spec.partitionMap)).toBe(true)
  })
  it('scaffold() partitionMap[0] 含 startAddr 字符串', () => {
    expect(typeof scaffold().spec.partitionMap[0].startAddr).toBe('string')
  })
  it('validate() 有效数据无错误', () => {
    expect(validate(scaffold(), 'peripherals.flash')).toEqual([])
  })
  it('validate() partitionMap 非数组时报错', () => {
    const data = scaffold()
    data.spec.partitionMap = null
    expect(validate(data, 'peripherals.flash').length).toBeGreaterThan(0)
  })
})
