import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/vad.js'

describe('vad 外设模块', () => {
  it('meta.key 为 vad', () => expect(meta.key).toBe('vad'))
  it('scaffold() count 为 1', () => expect(scaffold().count).toBe(1))
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.vad')).toEqual([]))
})
