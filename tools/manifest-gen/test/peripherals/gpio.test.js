// test/peripherals/gpio.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/gpio.js'

describe('gpio 外设模块', () => {
  describe('meta', () => {
    it('key 为 gpio', () => expect(meta.key).toBe('gpio'))
    it('包含 enableMacro', () => expect(meta.enableMacro).toBe('ENABLE_GPIO'))
    it('包含 tklHeader', () => expect(meta.tklHeader).toBe('tkl_gpio.h'))
    it('包含 idPrefix', () => expect(meta.idPrefix).toBe('TUYA_GPIO_NUM_'))
  })

  describe('scaffold()', () => {
    it('返回 enabled:true', () => expect(scaffold().enabled).toBe(true))
    it('count 初始为 0', () => expect(scaffold().count).toBe(0))
    it('spec.pins 初始为空数组', () => expect(scaffold().spec.pins).toEqual([]))
    it('spec.irq.pins 初始为空数组', () => expect(scaffold().spec.irq.pins).toEqual([]))
    it('spec.direction 包含 INPUT 和 OUTPUT', () => {
      expect(scaffold().spec.direction).toContain('TUYA_GPIO_INPUT')
      expect(scaffold().spec.direction).toContain('TUYA_GPIO_OUTPUT')
    })
  })

  describe('validate()', () => {
    it('有效数据返回空数组', () => {
      const data = scaffold()
      data.count = 56
      data.spec.pins = [0, 1, 2]
      data.spec.irq.pins = [0, 1, 2]
      expect(validate(data, 'peripherals.gpio')).toEqual([])
    })
    it('count 为 string 时报错', () => {
      const data = scaffold()
      data.count = '56'
      expect(validate(data, 'peripherals.gpio')).toContain(
        'peripherals.gpio.count — 期望 number，实际 string'
      )
    })
    it('spec.pins 非数组时报错', () => {
      const data = scaffold()
      data.count = 56
      data.spec.pins = {}
      const errors = validate(data, 'peripherals.gpio')
      expect(errors.some(e => e.includes('spec.pins'))).toBe(true)
    })
  })
})
