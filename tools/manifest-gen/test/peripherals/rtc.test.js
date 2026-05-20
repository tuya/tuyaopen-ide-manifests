import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/rtc.js'

describe('rtc 外设模块', () => {
  it('meta.key 为 rtc', () => expect(meta.key).toBe('rtc'))
  it('scaffold() count 为 1', () => expect(scaffold().count).toBe(1))
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.rtc')).toEqual([]))
})
