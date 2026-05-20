import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/spi.js'

describe('spi 外设模块', () => {
  it('meta.key 为 spi', () => expect(meta.key).toBe('spi'))
  it('scaffold() count 初始为 0', () => expect(scaffold().count).toBe(0))
  it('scaffold() ports[0].backend 为 spi', () => expect(scaffold().spec.ports[0].backend).toBe('spi'))
  it('scaffold() ports[0].pinGroups[0] 含 clk/cs/mosi/miso', () => {
    const pg = scaffold().spec.ports[0].pinGroups[0]
    expect(pg).toHaveProperty('clk')
    expect(pg).toHaveProperty('cs')
    expect(pg).toHaveProperty('mosi')
    expect(pg).toHaveProperty('miso')
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold()
    data.count = 4
    expect(validate(data, 'peripherals.spi')).toEqual([])
  })
  it('validate() count 为 string 时报错', () => {
    const data = scaffold()
    data.count = '4'
    expect(validate(data, 'peripherals.spi').length).toBeGreaterThan(0)
  })
  it('validate() spec.ports 非数组时报错', () => {
    const data = scaffold()
    data.count = 4
    data.spec.ports = {}
    expect(validate(data, 'peripherals.spi').length).toBeGreaterThan(0)
  })
})
