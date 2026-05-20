import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/rgb.js'

describe('rgb 外设模块', () => {
  it('meta.key 为 rgb', () => expect(meta.key).toBe('rgb'))
  it('scaffold() ports[0].pins.r 为 8 元素数组', () => {
    expect(scaffold().spec.ports[0].pins.r).toHaveLength(8)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.rgb')).toEqual([]))
})
