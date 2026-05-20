// test/peripherals/uart.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/uart.js'

describe('uart 外设模块', () => {
  it('meta.key 为 uart', () => expect(meta.key).toBe('uart'))
  it('scaffold() count 初始为 0', () => expect(scaffold().count).toBe(0))
  it('scaffold() spec.ports 为非空数组', () => {
    expect(Array.isArray(scaffold().spec.ports)).toBe(true)
    expect(scaffold().spec.ports.length).toBeGreaterThan(0)
  })
  it('scaffold() ports[0] 含 pinGroups 数组', () => {
    expect(Array.isArray(scaffold().spec.ports[0].pinGroups)).toBe(true)
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold()
    data.count = 3
    expect(validate(data, 'peripherals.uart')).toEqual([])
  })
  it('validate() count 为 string 时报错', () => {
    const data = scaffold()
    data.count = '3'
    expect(validate(data, 'peripherals.uart').length).toBeGreaterThan(0)
  })
  it('validate() spec.ports 非数组时报错', () => {
    const data = scaffold()
    data.count = 3
    data.spec.ports = {}
    expect(validate(data, 'peripherals.uart').length).toBeGreaterThan(0)
  })
})
