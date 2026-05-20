import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/wdt.js'

describe('wdt 外设模块', () => {
  it('meta.key 为 wdt', () => expect(meta.key).toBe('wdt'))
  it('scaffold() count 为 1', () => expect(scaffold().count).toBe(1))
  it('scaffold() idPrefix 为 null', () => expect(scaffold().idPrefix).toBeNull())
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.wdt')).toEqual([]))
})
