import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/i8080.js'

describe('i8080 外设模块', () => {
  it('meta.key 为 i8080', () => expect(meta.key).toBe('i8080'))
  it('scaffold() ports[0].pins.data 为 24 元素数组', () => {
    expect(scaffold().spec.ports[0].pins.data).toHaveLength(24)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.i8080')).toEqual([]))
})
