import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/dma2d.js'

describe('dma2d 外设模块', () => {
  it('meta.key 为 dma2d', () => expect(meta.key).toBe('dma2d'))
  it('scaffold() spec.formats 含 RGB565', () => {
    expect(scaffold().spec.formats).toContain('TUYA_FRAME_FMT_RGB565')
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.dma2d')).toEqual([]))
})
