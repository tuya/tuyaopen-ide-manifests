import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/dvp.js'

describe('dvp 外设模块', () => {
  it('meta.key 为 dvp', () => expect(meta.key).toBe('dvp'))
  it('scaffold() ports[0].pins.data 为 8 元素数组', () => {
    expect(scaffold().spec.ports[0].pins.data).toHaveLength(8)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.dvp')).toEqual([]))
})
