import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/qspi.js'

describe('qspi 外设模块', () => {
  it('meta.key 为 qspi', () => expect(meta.key).toBe('qspi'))
  it('scaffold() count 初始为 0', () => expect(scaffold().count).toBe(0))
  it('scaffold() ports[0].pins 含 d0-d3', () => {
    const pins = scaffold().spec.ports[0].pins
    expect(pins).toHaveProperty('clk')
    expect(pins).toHaveProperty('cs')
    expect(pins).toHaveProperty('d0')
    expect(pins).toHaveProperty('d1')
    expect(pins).toHaveProperty('d2')
    expect(pins).toHaveProperty('d3')
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold()
    data.count = 2
    expect(validate(data, 'peripherals.qspi')).toEqual([])
  })
  it('validate() count 为 string 时报错', () => {
    const data = scaffold()
    data.count = '2'
    expect(validate(data, 'peripherals.qspi').length).toBeGreaterThan(0)
  })
  it('validate() spec.ports 非数组时报错', () => {
    const data = scaffold()
    data.count = 2
    data.spec.ports = {}
    expect(validate(data, 'peripherals.qspi').length).toBeGreaterThan(0)
  })
})
