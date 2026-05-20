# manifest-gen CLI 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `tools/manifest-gen/` 下实现一个 Node.js CLI 工具，通过分层交互向导生成符合模板的 platform JSON，并提供校验和格式化命令。

**Architecture:** 纯 ESM Node.js 项目，`commander` 管理子命令，`@inquirer/prompts` 驱动交互向导，每种外设是一个独立模块（`meta` + `scaffold()` + `validate()`），`registry.js` 是唯一需要修改的扩展点，`prettier` 保证输出格式绝对一致。

**Tech Stack:** Node.js (ESM), commander ^12, @inquirer/prompts ^7, chalk ^5, prettier ^3, vitest ^2

---

## 文件结构

```
tools/manifest-gen/
├── package.json
├── bin/
│   └── manifest-gen.js                   # 新建：CLI 入口
└── src/
    ├── cli.js                             # 新建：子命令注册
    ├── generators/
    │   ├── registry.js                    # 新建：外设模块注册表
    │   ├── platform/
    │   │   ├── wizard.js                  # 新建：顶层字段 + 外设选择向导
    │   │   ├── builder.js                 # 新建：answers → JSON 对象
    │   │   └── peripherals/
    │   │       ├── gpio.js                # 新建
    │   │       ├── uart.js                # 新建
    │   │       ├── i2c.js                 # 新建
    │   │       ├── spi.js                 # 新建
    │   │       ├── qspi.js                # 新建
    │   │       ├── pwm.js                 # 新建
    │   │       ├── adc.js                 # 新建
    │   │       ├── timer.js               # 新建
    │   │       ├── wdt.js                 # 新建
    │   │       ├── rtc.js                 # 新建
    │   │       ├── flash.js               # 新建
    │   │       ├── pinmux.js              # 新建
    │   │       ├── dma2d.js               # 新建
    │   │       ├── rgb.js                 # 新建
    │   │       ├── i8080.js               # 新建
    │   │       ├── dvp.js                 # 新建
    │   │       ├── kws.js                 # 新建
    │   │       └── vad.js                 # 新建
    │   └── board/
    │       └── index.js                   # 新建：空 stub
    ├── validators/
    │   ├── platform.js                    # 新建：platform 校验
    │   └── board.js                       # 新建：空 stub
    └── commands/
        ├── platform-create.js             # 新建
        ├── platform-validate.js           # 新建
        └── platform-normalize.js          # 新建
test/
├── peripherals/
│   ├── gpio.test.js                       # 新建
│   ├── uart.test.js                       # 新建
│   ├── i2c.test.js                        # 新建
│   ├── spi.test.js                        # 新建
│   ├── qspi.test.js                       # 新建
│   ├── pwm.test.js                        # 新建
│   ├── adc.test.js                        # 新建
│   ├── timer.test.js                      # 新建
│   ├── wdt.test.js                        # 新建
│   ├── rtc.test.js                        # 新建
│   ├── flash.test.js                      # 新建
│   ├── pinmux.test.js                     # 新建
│   ├── dma2d.test.js                      # 新建
│   ├── rgb.test.js                        # 新建
│   ├── i8080.test.js                      # 新建
│   ├── dvp.test.js                        # 新建
│   ├── kws.test.js                        # 新建
│   └── vad.test.js                        # 新建
├── builder.test.js                        # 新建
└── validator.test.js                      # 新建
```

---

## Task 1: 项目脚手架

**Files:**
- Create: `tools/manifest-gen/package.json`
- Create: `tools/manifest-gen/bin/manifest-gen.js`
- Create: `tools/manifest-gen/src/cli.js`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "manifest-gen",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "manifest-gen": "./bin/manifest-gen.js"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@inquirer/prompts": "^7.0.0",
    "chalk": "^5.0.0",
    "commander": "^12.0.0",
    "prettier": "^3.0.0"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd tools/manifest-gen && npm install
```

预期：`node_modules/` 创建成功，无报错。

- [ ] **Step 3: 创建 bin/manifest-gen.js**

```js
#!/usr/bin/env node
import '../src/cli.js'
```

- [ ] **Step 4: 创建 src/cli.js（骨架，后续任务中填充命令）**

```js
import { Command } from 'commander'

const program = new Command()
program
  .name('manifest-gen')
  .description('TuyaOpen manifest JSON 生成工具')
  .version('1.0.0')

const platform = program.command('platform').description('Platform JSON 操作')

platform
  .command('create')
  .description('交互向导生成新的 platform JSON')
  .action(async () => {
    const { runPlatformCreate } = await import('./commands/platform-create.js')
    await runPlatformCreate()
  })

platform
  .command('validate <file>')
  .description('校验已有 platform JSON')
  .action(async (file) => {
    const { runPlatformValidate } = await import('./commands/platform-validate.js')
    await runPlatformValidate(file)
  })

platform
  .command('normalize <file>')
  .description('校验并格式化已有 platform JSON')
  .option('--out <outfile>', '输出路径（默认覆盖原文件）')
  .action(async (file, options) => {
    const { runPlatformNormalize } = await import('./commands/platform-normalize.js')
    await runPlatformNormalize(file, options.out)
  })

program.parse()
```

- [ ] **Step 5: 验证 CLI 可运行**

```bash
cd tools/manifest-gen && node bin/manifest-gen.js --help
```

预期输出包含 `platform` 命令描述。

- [ ] **Step 6: 提交**

```bash
git add tools/manifest-gen/
git commit -m "feat(tools): scaffold manifest-gen CLI project"
```

---

## Task 2: gpio 外设模块（建立模块契约）

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/gpio.js`
- Create: `tools/manifest-gen/test/peripherals/gpio.test.js`

- [ ] **Step 1: 写失败测试**

```js
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
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

预期：FAIL，模块文件不存在。

- [ ] **Step 3: 实现 gpio.js**

```js
// src/generators/platform/peripherals/gpio.js
export const meta = {
  key: 'gpio',
  label: 'GPIO',
  enableMacro: 'ENABLE_GPIO',
  tklHeader: 'tkl_gpio.h',
  idPrefix: 'TUYA_GPIO_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      pins: [],
      direction: ['TUYA_GPIO_INPUT', 'TUYA_GPIO_OUTPUT'],
      mode: [
        'TUYA_GPIO_PUSH_PULL',
        'TUYA_GPIO_PULLUP',
        'TUYA_GPIO_PULLDOWN',
        'TUYA_GPIO_FLOATING',
        'TUYA_GPIO_OPENDRAIN',
        'TUYA_GPIO_OPENDRAIN_PULLUP',
      ],
      irq: {
        supported: true,
        triggers: [
          'TUYA_GPIO_IRQ_RISE',
          'TUYA_GPIO_IRQ_FALL',
          'TUYA_GPIO_IRQ_RISE_FALL',
          'TUYA_GPIO_IRQ_LOW',
          'TUYA_GPIO_IRQ_HIGH',
        ],
        pins: [],
      },
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.pins))
    errors.push(`${path}.spec.pins — 期望 array`)
  if (!Array.isArray(data.spec?.irq?.pins))
    errors.push(`${path}.spec.irq.pins — 期望 array`)
  return errors
}
```

- [ ] **Step 4: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

预期：所有 gpio 测试 PASS。

- [ ] **Step 5: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/gpio.js \
        tools/manifest-gen/test/peripherals/gpio.test.js
git commit -m "feat(manifest-gen): add gpio peripheral module"
```

---

## Task 3: uart + i2c 外设模块

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/uart.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/i2c.js`
- Create: `tools/manifest-gen/test/peripherals/uart.test.js`
- Create: `tools/manifest-gen/test/peripherals/i2c.test.js`

- [ ] **Step 1: 写 uart 和 i2c 测试**

```js
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
```

```js
// test/peripherals/i2c.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/i2c.js'

describe('i2c 外设模块', () => {
  it('meta.key 为 i2c', () => expect(meta.key).toBe('i2c'))
  it('scaffold() spec.ports[0].pinGroups 为数组', () => {
    expect(Array.isArray(scaffold().spec.ports[0].pinGroups)).toBe(true)
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold()
    data.count = 3
    expect(validate(data, 'peripherals.i2c')).toEqual([])
  })
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

预期：uart 和 i2c 测试 FAIL。

- [ ] **Step 3: 实现 uart.js**

```js
// src/generators/platform/peripherals/uart.js
export const meta = {
  key: 'uart',
  label: 'UART',
  enableMacro: 'ENABLE_UART',
  tklHeader: 'tkl_uart.h',
  idPrefix: 'TUYA_UART_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      baudrate: { min: 0, max: 0 },
      databits: [
        'TUYA_UART_DATA_LEN_5BIT',
        'TUYA_UART_DATA_LEN_6BIT',
        'TUYA_UART_DATA_LEN_7BIT',
        'TUYA_UART_DATA_LEN_8BIT',
      ],
      stopbits: ['TUYA_UART_STOP_LEN_1BIT', 'TUYA_UART_STOP_LEN_2BIT'],
      parity: [
        'TUYA_UART_PARITY_TYPE_NONE',
        'TUYA_UART_PARITY_TYPE_ODD',
        'TUYA_UART_PARITY_TYPE_EVEN',
      ],
      flowctrl: ['TUYA_UART_FLOWCTRL_NONE'],
      ports: [
        {
          id: 0,
          logPort: false,
          irq: { rx: false, tx: false },
          pinGroups: [{ tx: 0, rx: 0 }],
        },
      ],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  else {
    data.spec.ports.forEach((port, i) => {
      if (!Array.isArray(port.pinGroups))
        errors.push(`${path}.spec.ports[${i}].pinGroups — 期望 array`)
    })
  }
  return errors
}
```

- [ ] **Step 4: 实现 i2c.js**

```js
// src/generators/platform/peripherals/i2c.js
export const meta = {
  key: 'i2c',
  label: 'I2C',
  enableMacro: 'ENABLE_I2C',
  tklHeader: 'tkl_i2c.h',
  idPrefix: 'TUYA_I2C_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      role: ['TUYA_IIC_MODE_MASTER'],
      speed: ['TUYA_IIC_BUS_SPEED_100K', 'TUYA_IIC_BUS_SPEED_400K'],
      addrWidth: ['TUYA_IIC_ADDRESS_7BIT'],
      portType: ['hw', 'sw'],
      ports: [
        {
          id: 0,
          type: ['hw', 'sw'],
          irq: false,
          pinGroups: [{ scl: 0, sda: 0 }],
        },
      ],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  return errors
}
```

- [ ] **Step 5: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

预期：uart 和 i2c 测试均 PASS。

- [ ] **Step 6: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/uart.js \
        tools/manifest-gen/src/generators/platform/peripherals/i2c.js \
        tools/manifest-gen/test/peripherals/uart.test.js \
        tools/manifest-gen/test/peripherals/i2c.test.js
git commit -m "feat(manifest-gen): add uart and i2c peripheral modules"
```

---

## Task 4: spi + qspi 外设模块

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/spi.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/qspi.js`
- Create: `tools/manifest-gen/test/peripherals/spi.test.js`
- Create: `tools/manifest-gen/test/peripherals/qspi.test.js`

- [ ] **Step 1: 写测试**

```js
// test/peripherals/spi.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/spi.js'

describe('spi 外设模块', () => {
  it('meta.key 为 spi', () => expect(meta.key).toBe('spi'))
  it('scaffold() ports[0].backend 为 spi', () => expect(scaffold().spec.ports[0].backend).toBe('spi'))
  it('scaffold() ports[0].pinGroups[0] 含 clk/cs/mosi/miso', () => {
    const pg = scaffold().spec.ports[0].pinGroups[0]
    expect(pg).toHaveProperty('clk')
    expect(pg).toHaveProperty('mosi')
    expect(pg).toHaveProperty('miso')
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 4
    expect(validate(data, 'peripherals.spi')).toEqual([])
  })
})
```

```js
// test/peripherals/qspi.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/qspi.js'

describe('qspi 外设模块', () => {
  it('meta.key 为 qspi', () => expect(meta.key).toBe('qspi'))
  it('scaffold() ports[0].pins 含 d0-d3', () => {
    const pins = scaffold().spec.ports[0].pins
    expect(pins).toHaveProperty('d0')
    expect(pins).toHaveProperty('d3')
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 2
    expect(validate(data, 'peripherals.qspi')).toEqual([])
  })
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 spi.js**

```js
// src/generators/platform/peripherals/spi.js
export const meta = {
  key: 'spi',
  label: 'SPI',
  enableMacro: 'ENABLE_SPI',
  tklHeader: 'tkl_spi.h',
  idPrefix: 'TUYA_SPI_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      role: [
        'TUYA_SPI_ROLE_MASTER',
        'TUYA_SPI_ROLE_SLAVE',
        'TUYA_SPI_ROLE_MASTER_SIMPLEX',
        'TUYA_SPI_ROLE_SLAVE_SIMPLEX',
      ],
      mode: ['TUYA_SPI_MODE0', 'TUYA_SPI_MODE1', 'TUYA_SPI_MODE2', 'TUYA_SPI_MODE3'],
      csType: ['TUYA_SPI_AUTO_TYPE', 'TUYA_SPI_SOFT_TYPE', 'TUYA_SPI_SOFT_ONE_WIRE_TYPE'],
      databits: ['TUYA_SPI_DATA_BIT8', 'TUYA_SPI_DATA_BIT16'],
      bitorder: ['TUYA_SPI_ORDER_MSB2LSB', 'TUYA_SPI_ORDER_LSB2MSB'],
      ports: [
        {
          id: 0,
          backend: 'spi',
          irq: false,
          dma: false,
          freq: { min: 0, max: 0 },
          pinGroups: [{ clk: 0, cs: 0, mosi: 0, miso: 0 }],
        },
      ],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  return errors
}
```

- [ ] **Step 4: 实现 qspi.js**

```js
// src/generators/platform/peripherals/qspi.js
export const meta = {
  key: 'qspi',
  label: 'QSPI',
  enableMacro: 'ENABLE_QSPI',
  tklHeader: 'tkl_qspi.h',
  idPrefix: 'TUYA_QSPI_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      wireMode: ['TUYA_QSPI_1WIRE', 'TUYA_QSPI_2WIRE', 'TUYA_QSPI_4WIRE'],
      role: ['TUYA_QSPI_ROLE_MASTER'],
      type: ['TUYA_QSPI_TYPE_FLASH', 'TUYA_QSPI_TYPE_LCD', 'TUYA_QSPI_TYPE_PSRAM'],
      mode: ['TUYA_SPI_MODE0', 'TUYA_SPI_MODE1', 'TUYA_SPI_MODE2', 'TUYA_SPI_MODE3'],
      freq: { min: 0, max: 0 },
      ports: [
        {
          id: 0,
          dma: false,
          pins: { clk: 0, cs: 0, d0: 0, d1: 0, d2: 0, d3: 0 },
        },
      ],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  return errors
}
```

- [ ] **Step 5: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 6: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/spi.js \
        tools/manifest-gen/src/generators/platform/peripherals/qspi.js \
        tools/manifest-gen/test/peripherals/spi.test.js \
        tools/manifest-gen/test/peripherals/qspi.test.js
git commit -m "feat(manifest-gen): add spi and qspi peripheral modules"
```

---

## Task 5: pwm + adc 外设模块

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/pwm.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/adc.js`
- Create: `tools/manifest-gen/test/peripherals/pwm.test.js`
- Create: `tools/manifest-gen/test/peripherals/adc.test.js`

- [ ] **Step 1: 写测试**

```js
// test/peripherals/pwm.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/pwm.js'

describe('pwm 外设模块', () => {
  it('meta.key 为 pwm', () => expect(meta.key).toBe('pwm'))
  it('scaffold() spec.channels 为数组', () => expect(Array.isArray(scaffold().spec.channels)).toBe(true))
  it('scaffold() spec.duty.max 为 10000', () => expect(scaffold().spec.duty.max).toBe(10000))
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 12
    expect(validate(data, 'peripherals.pwm')).toEqual([])
  })
  it('validate() spec.channels 非数组时报错', () => {
    const data = scaffold(); data.count = 12; data.spec.channels = null
    expect(validate(data, 'peripherals.pwm').length).toBeGreaterThan(0)
  })
})
```

```js
// test/peripherals/adc.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/adc.js'

describe('adc 外设模块', () => {
  it('meta.key 为 adc', () => expect(meta.key).toBe('adc'))
  it('scaffold() spec.bits 为 12', () => expect(scaffold().spec.bits).toBe(12))
  it('scaffold() spec.ports[0].channels 为数组', () => {
    expect(Array.isArray(scaffold().spec.ports[0].channels)).toBe(true)
  })
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 1
    expect(validate(data, 'peripherals.adc')).toEqual([])
  })
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 pwm.js**

```js
// src/generators/platform/peripherals/pwm.js
export const meta = {
  key: 'pwm',
  label: 'PWM',
  enableMacro: 'ENABLE_PWM',
  tklHeader: 'tkl_pwm.h',
  idPrefix: 'TUYA_PWM_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      polarity: ['TUYA_PWM_NEGATIVE', 'TUYA_PWM_POSITIVE'],
      countMode: ['TUYA_PWM_CNT_UP'],
      duty: { min: 0, max: 10000 },
      freq: { min: 0, max: 0 },
      capture: { supported: false },
      channels: [{ id: 0, pin: 0, irq: false }],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.channels))
    errors.push(`${path}.spec.channels — 期望 array`)
  return errors
}
```

- [ ] **Step 4: 实现 adc.js**

```js
// src/generators/platform/peripherals/adc.js
export const meta = {
  key: 'adc',
  label: 'ADC',
  enableMacro: 'ENABLE_ADC',
  tklHeader: 'tkl_adc.h',
  idPrefix: 'TUYA_ADC_NUM_',
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 0,
    spec: {
      bits: 12,
      mode: ['TUYA_ADC_SINGLE', 'TUYA_ADC_CONTINUOUS'],
      ports: [{ id: 0, channels: [{ id: 0, pin: 0 }] }],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  return errors
}
```

- [ ] **Step 5: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 6: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/pwm.js \
        tools/manifest-gen/src/generators/platform/peripherals/adc.js \
        tools/manifest-gen/test/peripherals/pwm.test.js \
        tools/manifest-gen/test/peripherals/adc.test.js
git commit -m "feat(manifest-gen): add pwm and adc peripheral modules"
```

---

## Task 6: timer + wdt + rtc 外设模块

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/timer.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/wdt.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/rtc.js`
- Create: `tools/manifest-gen/test/peripherals/timer.test.js`
- Create: `tools/manifest-gen/test/peripherals/wdt.test.js`
- Create: `tools/manifest-gen/test/peripherals/rtc.test.js`

- [ ] **Step 1: 写测试**

```js
// test/peripherals/timer.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/timer.js'

describe('timer 外设模块', () => {
  it('meta.key 为 timer', () => expect(meta.key).toBe('timer'))
  it('scaffold() spec.bits 为 32', () => expect(scaffold().spec.bits).toBe(32))
  it('scaffold() spec.ids 为数组', () => expect(Array.isArray(scaffold().spec.ids)).toBe(true))
  it('validate() 有效数据无错误', () => {
    const data = scaffold(); data.count = 3; data.spec.ids = [3, 4, 5]
    expect(validate(data, 'peripherals.timer')).toEqual([])
  })
})
```

```js
// test/peripherals/wdt.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/wdt.js'

describe('wdt 外设模块', () => {
  it('meta.key 为 wdt', () => expect(meta.key).toBe('wdt'))
  it('scaffold() count 为 1', () => expect(scaffold().count).toBe(1))
  it('scaffold() idPrefix 为 null', () => expect(scaffold().idPrefix).toBeNull())
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.wdt')).toEqual([]))
})
```

```js
// test/peripherals/rtc.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/rtc.js'

describe('rtc 外设模块', () => {
  it('meta.key 为 rtc', () => expect(meta.key).toBe('rtc'))
  it('scaffold() count 为 1', () => expect(scaffold().count).toBe(1))
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.rtc')).toEqual([]))
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 timer.js、wdt.js、rtc.js**

```js
// src/generators/platform/peripherals/timer.js
export const meta = {
  key: 'timer', label: 'Timer',
  enableMacro: 'ENABLE_TIMER', tklHeader: 'tkl_timer.h', idPrefix: 'TUYA_TIMER_NUM_',
}
export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix, count: 0,
    spec: { bits: 32, mode: ['TUYA_TIMER_MODE_ONCE', 'TUYA_TIMER_MODE_PERIOD'], ids: [] },
  }
}
export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  if (!Array.isArray(data.spec?.ids))
    errors.push(`${path}.spec.ids — 期望 array`)
  return errors
}
```

```js
// src/generators/platform/peripherals/wdt.js
export const meta = {
  key: 'wdt', label: 'Watchdog',
  enableMacro: 'ENABLE_WATCHDOG', tklHeader: 'tkl_watchdog.h', idPrefix: null,
}
export function scaffold() {
  return { enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 1 }
}
export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  return errors
}
```

```js
// src/generators/platform/peripherals/rtc.js
export const meta = {
  key: 'rtc', label: 'RTC',
  enableMacro: 'ENABLE_RTC', tklHeader: 'tkl_rtc.h', idPrefix: null,
}
export function scaffold() {
  return { enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 1 }
}
export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  return errors
}
```

- [ ] **Step 4: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 5: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/timer.js \
        tools/manifest-gen/src/generators/platform/peripherals/wdt.js \
        tools/manifest-gen/src/generators/platform/peripherals/rtc.js \
        tools/manifest-gen/test/peripherals/timer.test.js \
        tools/manifest-gen/test/peripherals/wdt.test.js \
        tools/manifest-gen/test/peripherals/rtc.test.js
git commit -m "feat(manifest-gen): add timer, wdt, rtc peripheral modules"
```

---

## Task 7: flash 外设模块

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/flash.js`
- Create: `tools/manifest-gen/test/peripherals/flash.test.js`

- [ ] **Step 1: 写测试**

```js
// test/peripherals/flash.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/flash.js'

describe('flash 外设模块', () => {
  it('meta.key 为 flash', () => expect(meta.key).toBe('flash'))
  it('scaffold() spec.partitionTypes 非空数组', () => {
    expect(Array.isArray(scaffold().spec.partitionTypes)).toBe(true)
    expect(scaffold().spec.partitionTypes.length).toBeGreaterThan(0)
  })
  it('scaffold() spec.partitionMap 为数组', () => {
    expect(Array.isArray(scaffold().spec.partitionMap)).toBe(true)
  })
  it('scaffold() partitionMap[0] 含 startAddr 字符串', () => {
    expect(typeof scaffold().spec.partitionMap[0].startAddr).toBe('string')
  })
  it('validate() 有效数据无错误', () => {
    expect(validate(scaffold(), 'peripherals.flash')).toEqual([])
  })
  it('validate() partitionMap 非数组时报错', () => {
    const data = scaffold()
    data.spec.partitionMap = null
    expect(validate(data, 'peripherals.flash').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 flash.js**

```js
// src/generators/platform/peripherals/flash.js
export const meta = {
  key: 'flash', label: 'Flash',
  enableMacro: null, tklHeader: 'tkl_flash.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: null,
    tklHeader: meta.tklHeader,
    idPrefix: null,
    count: 1,
    spec: {
      partitionTypes: [
        'TUYA_FLASH_TYPE_APP',
        'TUYA_FLASH_TYPE_APP_BIN',
        'TUYA_FLASH_TYPE_OTA',
        'TUYA_FLASH_TYPE_USER0',
        'TUYA_FLASH_TYPE_USER1',
        'TUYA_FLASH_TYPE_KV_DATA',
        'TUYA_FLASH_TYPE_KV_SWAP',
        'TUYA_FLASH_TYPE_KV_KEY',
        'TUYA_FLASH_TYPE_UF',
        'TUYA_FLASH_TYPE_INFO',
        'TUYA_FLASH_TYPE_KV_UF',
        'TUYA_FLASH_TYPE_KV_PROTECT',
        'TUYA_FLASH_TYPE_RCD',
      ],
      partitionMap: [
        {
          type: 'TUYA_FLASH_TYPE_APP',
          startAddr: '0x000000',
          endAddr: '0x000000',
          size: 0,
          blockSize: 4096,
          desc: '',
        },
      ],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (!Array.isArray(data.spec?.partitionMap))
    errors.push(`${path}.spec.partitionMap — 期望 array`)
  else {
    data.spec.partitionMap.forEach((p, i) => {
      if (typeof p.startAddr !== 'string')
        errors.push(`${path}.spec.partitionMap[${i}].startAddr — 期望 string`)
      if (typeof p.size !== 'number')
        errors.push(`${path}.spec.partitionMap[${i}].size — 期望 number`)
    })
  }
  return errors
}
```

- [ ] **Step 4: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 5: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/flash.js \
        tools/manifest-gen/test/peripherals/flash.test.js
git commit -m "feat(manifest-gen): add flash peripheral module"
```

---

## Task 8: pinmux + dma2d 外设模块

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/pinmux.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/dma2d.js`
- Create: `tools/manifest-gen/test/peripherals/pinmux.test.js`
- Create: `tools/manifest-gen/test/peripherals/dma2d.test.js`

- [ ] **Step 1: 写测试**

```js
// test/peripherals/pinmux.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/pinmux.js'

describe('pinmux 外设模块', () => {
  it('meta.key 为 pinmux', () => expect(meta.key).toBe('pinmux'))
  it('scaffold() spec.remappableFuncs 含 i2c/uart/spi/pwm/adc/dac/i2s 键', () => {
    const rf = scaffold().spec.remappableFuncs
    for (const k of ['i2c', 'uart', 'spi', 'pwm', 'adc', 'dac', 'i2s'])
      expect(rf).toHaveProperty(k)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.pinmux')).toEqual([]))
})
```

```js
// test/peripherals/dma2d.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/dma2d.js'

describe('dma2d 外设模块', () => {
  it('meta.key 为 dma2d', () => expect(meta.key).toBe('dma2d'))
  it('scaffold() spec.formats 含 RGB565', () => {
    expect(scaffold().spec.formats).toContain('TUYA_FRAME_FMT_RGB565')
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.dma2d')).toEqual([]))
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 pinmux.js**

```js
// src/generators/platform/peripherals/pinmux.js
export const meta = {
  key: 'pinmux', label: 'Pin Mux',
  enableMacro: null, tklHeader: 'tkl_pinmux.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true, enableMacro: null, tklHeader: meta.tklHeader, idPrefix: null, count: 1,
    spec: {
      remappableFuncs: { i2c: [], uart: [], spi: [], pwm: [], adc: [], dac: [], i2s: [] },
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (typeof data.spec?.remappableFuncs !== 'object' || data.spec.remappableFuncs === null)
    errors.push(`${path}.spec.remappableFuncs — 期望 object`)
  return errors
}
```

- [ ] **Step 4: 实现 dma2d.js**

```js
// src/generators/platform/peripherals/dma2d.js
export const meta = {
  key: 'dma2d', label: 'DMA2D',
  enableMacro: 'ENABLE_DMA2D', tklHeader: 'tkl_dma2d.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 1,
    spec: { formats: ['TUYA_FRAME_FMT_YUV422', 'TUYA_FRAME_FMT_RGB565', 'TUYA_FRAME_FMT_RGB888'] },
  }
}

export function validate(data, path) {
  const errors = []
  if (!Array.isArray(data.spec?.formats))
    errors.push(`${path}.spec.formats — 期望 array`)
  return errors
}
```

- [ ] **Step 5: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 6: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/pinmux.js \
        tools/manifest-gen/src/generators/platform/peripherals/dma2d.js \
        tools/manifest-gen/test/peripherals/pinmux.test.js \
        tools/manifest-gen/test/peripherals/dma2d.test.js
git commit -m "feat(manifest-gen): add pinmux and dma2d peripheral modules"
```

---

## Task 9: rgb + i8080 + dvp 外设模块

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/rgb.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/i8080.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/dvp.js`
- Create: `tools/manifest-gen/test/peripherals/rgb.test.js`
- Create: `tools/manifest-gen/test/peripherals/i8080.test.js`
- Create: `tools/manifest-gen/test/peripherals/dvp.test.js`

- [ ] **Step 1: 写测试**

```js
// test/peripherals/rgb.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/rgb.js'

describe('rgb 外设模块', () => {
  it('meta.key 为 rgb', () => expect(meta.key).toBe('rgb'))
  it('scaffold() ports[0].pins.r 为 8 元素数组', () => {
    expect(scaffold().spec.ports[0].pins.r).toHaveLength(8)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.rgb')).toEqual([]))
})
```

```js
// test/peripherals/i8080.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/i8080.js'

describe('i8080 外设模块', () => {
  it('meta.key 为 i8080', () => expect(meta.key).toBe('i8080'))
  it('scaffold() ports[0].pins.data 为 24 元素数组', () => {
    expect(scaffold().spec.ports[0].pins.data).toHaveLength(24)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.i8080')).toEqual([]))
})
```

```js
// test/peripherals/dvp.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/dvp.js'

describe('dvp 外设模块', () => {
  it('meta.key 为 dvp', () => expect(meta.key).toBe('dvp'))
  it('scaffold() ports[0].pins.data 为 8 元素数组', () => {
    expect(scaffold().spec.ports[0].pins.data).toHaveLength(8)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.dvp')).toEqual([]))
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 rgb.js**

```js
// src/generators/platform/peripherals/rgb.js
export const meta = {
  key: 'rgb', label: 'RGB LCD',
  enableMacro: 'ENABLE_RGB', tklHeader: 'tkl_rgb.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 0,
    spec: {
      pixelFmt: ['TUYA_PIXEL_FMT_RGB565', 'TUYA_PIXEL_FMT_RGB666', 'TUYA_PIXEL_FMT_RGB888'],
      outDataClkEdge: ['TUYA_RGB_DATA_IN_FALLING_EDGE', 'TUYA_RGB_DATA_IN_RISING_EDGE'],
      dclkFreq: { min: 0, max: 0 },
      ports: [{
        id: 0,
        pins: {
          dclk: 0, disp: 0, de: 0, hsync: 0, vsync: 0,
          r: [0, 0, 0, 0, 0, 0, 0, 0],
          g: [0, 0, 0, 0, 0, 0, 0, 0],
          b: [0, 0, 0, 0, 0, 0, 0, 0],
        },
      }],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  else {
    const pins = data.spec.ports[0]?.pins
    if (pins) {
      if (!Array.isArray(pins.r) || pins.r.length !== 8)
        errors.push(`${path}.spec.ports[0].pins.r — 期望 8 元素 array`)
    }
  }
  return errors
}
```

- [ ] **Step 4: 实现 i8080.js**

```js
// src/generators/platform/peripherals/i8080.js
export const meta = {
  key: 'i8080', label: 'MCU8080',
  enableMacro: 'ENABLE_MCU8080', tklHeader: 'tkl_8080.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 0,
    spec: {
      pixelFmt: ['TUYA_PIXEL_FMT_RGB565', 'TUYA_PIXEL_FMT_RGB666', 'TUYA_PIXEL_FMT_RGB888'],
      pixelFmtDataBits: {
        'TUYA_PIXEL_FMT_RGB565': [8, 16],
        'TUYA_PIXEL_FMT_RGB666': [9, 18],
        'TUYA_PIXEL_FMT_RGB888': [8, 16, 24],
      },
      clkFreq: { min: 0, max: 0 },
      ports: [{
        id: 0,
        pins: { rdx: 0, wdx: 0, rsx: 0, reset: 0, csx: 0, data: Array(24).fill(0) },
      }],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  else {
    const pins = data.spec.ports[0]?.pins
    if (pins && (!Array.isArray(pins.data) || pins.data.length !== 24))
      errors.push(`${path}.spec.ports[0].pins.data — 期望 24 元素 array`)
  }
  return errors
}
```

- [ ] **Step 5: 实现 dvp.js**

```js
// src/generators/platform/peripherals/dvp.js
export const meta = {
  key: 'dvp', label: 'DVP Camera',
  enableMacro: 'ENABLE_DVP', tklHeader: 'tkl_dvp.h', idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 0,
    spec: {
      syncMode: ['TUYA_DVP_SYNC_MODE_0', 'TUYA_DVP_SYNC_MODE_1', 'TUYA_DVP_SYNC_MODE_2', 'TUYA_DVP_SYNC_MODE_3'],
      outputMode: [
        'TUYA_CAMERA_OUTPUT_YUV422', 'TUYA_CAMERA_OUTPUT_JPEG', 'TUYA_CAMERA_OUTPUT_H264',
        'TUYA_CAMERA_OUTPUT_JPEG_YUV422_BOTH', 'TUYA_CAMERA_OUTPUT_H264_YUV422_BOTH',
      ],
      mclkFreq: { min: 0, max: 0 },
      ports: [{
        id: 0,
        pins: { mclk: 0, pclk: 0, hsync: 0, vsync: 0, data: [0, 0, 0, 0, 0, 0, 0, 0] },
      }],
    },
  }
}

export function validate(data, path) {
  const errors = []
  if (!Array.isArray(data.spec?.ports))
    errors.push(`${path}.spec.ports — 期望 array`)
  else {
    const pins = data.spec.ports[0]?.pins
    if (pins && (!Array.isArray(pins.data) || pins.data.length !== 8))
      errors.push(`${path}.spec.ports[0].pins.data — 期望 8 元素 array`)
  }
  return errors
}
```

- [ ] **Step 6: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 7: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/rgb.js \
        tools/manifest-gen/src/generators/platform/peripherals/i8080.js \
        tools/manifest-gen/src/generators/platform/peripherals/dvp.js \
        tools/manifest-gen/test/peripherals/rgb.test.js \
        tools/manifest-gen/test/peripherals/i8080.test.js \
        tools/manifest-gen/test/peripherals/dvp.test.js
git commit -m "feat(manifest-gen): add rgb, i8080, dvp peripheral modules"
```

---

## Task 10: kws + vad 模块 + registry

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/peripherals/kws.js`
- Create: `tools/manifest-gen/src/generators/platform/peripherals/vad.js`
- Create: `tools/manifest-gen/src/generators/registry.js`
- Create: `tools/manifest-gen/test/peripherals/kws.test.js`
- Create: `tools/manifest-gen/test/peripherals/vad.test.js`

- [ ] **Step 1: 写测试**

```js
// test/peripherals/kws.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/kws.js'

describe('kws 外设模块', () => {
  it('meta.key 为 kws', () => expect(meta.key).toBe('kws'))
  it('scaffold() spec.wakeupWords 为非空数组', () => {
    expect(scaffold().spec.wakeupWords.length).toBeGreaterThan(0)
  })
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.kws')).toEqual([]))
})
```

```js
// test/peripherals/vad.test.js
import { describe, it, expect } from 'vitest'
import { meta, scaffold, validate } from '../../src/generators/platform/peripherals/vad.js'

describe('vad 外设模块', () => {
  it('meta.key 为 vad', () => expect(meta.key).toBe('vad'))
  it('scaffold() count 为 1', () => expect(scaffold().count).toBe(1))
  it('validate() 有效数据无错误', () => expect(validate(scaffold(), 'peripherals.vad')).toEqual([]))
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 kws.js 和 vad.js**

```js
// src/generators/platform/peripherals/kws.js
export const meta = {
  key: 'kws', label: 'KWS (关键词唤醒)',
  enableMacro: 'ENABLE_MEDIA', tklHeader: 'tkl_kws.h', idPrefix: null,
}
export function scaffold() {
  return {
    enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 1,
    spec: {
      wakeupWords: [
        'TKL_KWS_WAKEUP_NIHAO_TUYA', 'TKL_KWS_WAKEUP_NIHAO_XIAOZHI',
        'TKL_KWS_WAKEUP_HEY_TUYA', 'TKL_KWS_WAKEUP_SMARTLIFE',
        'TKL_KWS_WAKEUP_ZHINENGGUANJIA', 'TKL_KWS_WAKEUP_XIAOZHI_TONGXUE',
        'TKL_KWS_WAKEUP_XIAOZHI_GUANJIA', 'TKL_KWS_WAKEUP_XIAOAI_XIAOAI',
        'TKL_KWS_WAKEUP_XIAODU_XIAODU',
      ],
    },
  }
}
export function validate(data, path) {
  const errors = []
  if (!Array.isArray(data.spec?.wakeupWords))
    errors.push(`${path}.spec.wakeupWords — 期望 array`)
  return errors
}
```

```js
// src/generators/platform/peripherals/vad.js
export const meta = {
  key: 'vad', label: 'VAD (语音活动检测)',
  enableMacro: 'ENABLE_MEDIA', tklHeader: 'tkl_vad.h', idPrefix: null,
}
export function scaffold() {
  return { enabled: true, enableMacro: meta.enableMacro, tklHeader: meta.tklHeader, idPrefix: null, count: 1 }
}
export function validate(data, path) {
  const errors = []
  if (typeof data.count !== 'number')
    errors.push(`${path}.count — 期望 number，实际 ${typeof data.count}`)
  return errors
}
```

- [ ] **Step 4: 实现 registry.js**

```js
// src/generators/registry.js
import * as gpio   from './platform/peripherals/gpio.js'
import * as uart   from './platform/peripherals/uart.js'
import * as i2c    from './platform/peripherals/i2c.js'
import * as spi    from './platform/peripherals/spi.js'
import * as qspi   from './platform/peripherals/qspi.js'
import * as pwm    from './platform/peripherals/pwm.js'
import * as adc    from './platform/peripherals/adc.js'
import * as timer  from './platform/peripherals/timer.js'
import * as wdt    from './platform/peripherals/wdt.js'
import * as rtc    from './platform/peripherals/rtc.js'
import * as flash  from './platform/peripherals/flash.js'
import * as pinmux from './platform/peripherals/pinmux.js'
import * as dma2d  from './platform/peripherals/dma2d.js'
import * as rgb    from './platform/peripherals/rgb.js'
import * as i8080  from './platform/peripherals/i8080.js'
import * as dvp    from './platform/peripherals/dvp.js'
import * as kws    from './platform/peripherals/kws.js'
import * as vad    from './platform/peripherals/vad.js'

// 新增外设：在此添加 import 和数组条目，其余代码无需修改
export const peripheralModules = [
  gpio, uart, i2c, spi, qspi, pwm, adc,
  timer, wdt, rtc, flash, pinmux,
  dma2d, rgb, i8080, dvp, kws, vad,
]
```

- [ ] **Step 5: 运行所有测试**

```bash
cd tools/manifest-gen && npm test
```

预期：全部 PASS。

- [ ] **Step 6: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/peripherals/kws.js \
        tools/manifest-gen/src/generators/platform/peripherals/vad.js \
        tools/manifest-gen/src/generators/registry.js \
        tools/manifest-gen/test/peripherals/kws.test.js \
        tools/manifest-gen/test/peripherals/vad.test.js
git commit -m "feat(manifest-gen): add kws, vad modules and peripheral registry"
```

---

## Task 11: board stub

**Files:**
- Create: `tools/manifest-gen/src/generators/board/index.js`
- Create: `tools/manifest-gen/src/validators/board.js`

- [ ] **Step 1: 创建 board stub**

```js
// src/generators/board/index.js
export function runBoardCreate() {
  console.error('Board JSON 生成尚未支持（计划 Phase 2）')
  process.exit(1)
}
```

```js
// src/validators/board.js
export function validateBoard(_data) {
  throw new Error('Board JSON 校验尚未支持（计划 Phase 2）')
}
```

- [ ] **Step 2: 提交**

```bash
git add tools/manifest-gen/src/generators/board/index.js \
        tools/manifest-gen/src/validators/board.js
git commit -m "feat(manifest-gen): add board stubs for Phase 2"
```

---

## Task 12: platform builder

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/builder.js`
- Create: `tools/manifest-gen/test/builder.test.js`

- [ ] **Step 1: 写失败测试**

```js
// test/builder.test.js
import { describe, it, expect } from 'vitest'
import { buildPlatform, normalizePlatform } from '../src/generators/platform/builder.js'

const minimalAnswers = {
  platformId: 'test-plat',
  variantId: 'test-v1',
  name: 'Test Platform',
  arch: 'arm-cortex-m33',
  flashInterface: 'qspi',
  connectivity: {
    wifi: { enabled: true, enableMacro: 'ENABLE_WIFI', standard: '802.11b/g/n/ax', bands: ['2.4GHz'], security: ['WPA2'], modes: ['STA'] },
    ble: { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version: '5.4' },
    ethernet: { enabled: false, enableMacro: 'ENABLE_WIRED' },
    cellular: { enabled: false, enableMacro: 'ENABLE_CELLULAR' },
  },
  memory: { sramBytes: 1024, romBytes: 512, flashMaxBytes: 4096, psramMaxBytes: 0, efuse: false },
  kconfig: { PLATFORM_CHOICE: 'TEST_PLAT' },
  selectedPeripherals: ['gpio', 'uart'],
}

describe('buildPlatform()', () => {
  it('顶层字段正确', () => {
    const result = buildPlatform(minimalAnswers)
    expect(result.schemaVersion).toBe(1)
    expect(result.platformId).toBe('test-plat')
    expect(result.id).toBe('test-v1')
    expect(result.arch).toBe('arm-cortex-m33')
  })

  it('只包含选中的外设', () => {
    const result = buildPlatform(minimalAnswers)
    expect(result.peripherals).toHaveProperty('gpio')
    expect(result.peripherals).toHaveProperty('uart')
    expect(result.peripherals).not.toHaveProperty('spi')
    expect(result.peripherals).not.toHaveProperty('kws')
  })

  it('外设结构为有效 scaffold', () => {
    const result = buildPlatform(minimalAnswers)
    expect(result.peripherals.gpio.count).toBe(0)
    expect(Array.isArray(result.peripherals.gpio.spec.pins)).toBe(true)
  })

  it('外设键顺序按 registry 顺序（gpio 在 uart 前）', () => {
    const result = buildPlatform(minimalAnswers)
    const keys = Object.keys(result.peripherals)
    expect(keys.indexOf('gpio')).toBeLessThan(keys.indexOf('uart'))
  })
})

describe('normalizePlatform()', () => {
  it('重排外设键顺序为 registry 顺序', () => {
    const data = {
      ...buildPlatform(minimalAnswers),
      peripherals: { uart: buildPlatform(minimalAnswers).peripherals.uart, gpio: buildPlatform(minimalAnswers).peripherals.gpio },
    }
    const normalized = normalizePlatform(data)
    const keys = Object.keys(normalized.peripherals)
    expect(keys.indexOf('gpio')).toBeLessThan(keys.indexOf('uart'))
  })
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 builder.js**

```js
// src/generators/platform/builder.js
import { peripheralModules } from '../registry.js'

export function buildPlatform(answers) {
  const { platformId, variantId, name, arch, flashInterface, connectivity, memory, kconfig, selectedPeripherals } = answers

  const peripherals = {}
  for (const mod of peripheralModules) {
    if (selectedPeripherals.includes(mod.meta.key)) {
      peripherals[mod.meta.key] = mod.scaffold()
    }
  }

  return {
    schemaVersion: 1,
    platformId,
    id: variantId,
    name,
    arch,
    flashInterface,
    connectivity,
    memory,
    peripherals,
    kconfig,
  }
}

export function normalizePlatform(data) {
  const orderedPeripherals = {}
  for (const mod of peripheralModules) {
    if (data.peripherals?.[mod.meta.key]) {
      orderedPeripherals[mod.meta.key] = data.peripherals[mod.meta.key]
    }
  }
  // 保留 registry 中没有的外设（未来新增外设向后兼容）
  for (const key of Object.keys(data.peripherals ?? {})) {
    if (!orderedPeripherals[key]) orderedPeripherals[key] = data.peripherals[key]
  }
  return { ...data, peripherals: orderedPeripherals }
}
```

- [ ] **Step 4: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 5: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/builder.js \
        tools/manifest-gen/test/builder.test.js
git commit -m "feat(manifest-gen): add platform builder"
```

---

## Task 13: platform validator

**Files:**
- Create: `tools/manifest-gen/src/validators/platform.js`
- Create: `tools/manifest-gen/test/validator.test.js`

- [ ] **Step 1: 写失败测试**

```js
// test/validator.test.js
import { describe, it, expect } from 'vitest'
import { validatePlatform } from '../src/validators/platform.js'
import { buildPlatform } from '../src/generators/platform/builder.js'

const validAnswers = {
  platformId: 't5ai', variantId: 't5ai', name: 'T5AI',
  arch: 'arm-cortex-m33', flashInterface: 'qspi',
  connectivity: {
    wifi: { enabled: true, enableMacro: 'ENABLE_WIFI', standard: '802.11b/g/n/ax', bands: ['2.4GHz'], security: ['WPA2'], modes: ['STA'] },
    ble: { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version: '5.4' },
    ethernet: { enabled: false, enableMacro: 'ENABLE_WIRED' },
    cellular: { enabled: false, enableMacro: 'ENABLE_CELLULAR' },
  },
  memory: { sramBytes: 655360, romBytes: 65536, flashMaxBytes: 16777216, psramMaxBytes: 16777216, efuse: true },
  kconfig: { PLATFORM_CHOICE: 'T5AI' },
  selectedPeripherals: ['gpio', 'uart'],
}

describe('validatePlatform()', () => {
  it('有效 platform 无错误', () => {
    const data = buildPlatform(validAnswers)
    expect(validatePlatform(data)).toEqual([])
  })

  it('schemaVersion 非 1 时报错', () => {
    const data = buildPlatform(validAnswers)
    data.schemaVersion = 2
    expect(validatePlatform(data).some(e => e.includes('schemaVersion'))).toBe(true)
  })

  it('platformId 为 number 时报错', () => {
    const data = buildPlatform(validAnswers)
    data.platformId = 123
    expect(validatePlatform(data).some(e => e.includes('platformId'))).toBe(true)
  })

  it('memory.sramBytes 为 string 时报错', () => {
    const data = buildPlatform(validAnswers)
    data.memory.sramBytes = '655360'
    expect(validatePlatform(data).some(e => e.includes('sramBytes'))).toBe(true)
  })

  it('外设校验错误被汇总', () => {
    const data = buildPlatform(validAnswers)
    data.peripherals.gpio.count = 'bad'
    const errors = validatePlatform(data)
    expect(errors.some(e => e.includes('peripherals.gpio.count'))).toBe(true)
  })
})
```

- [ ] **Step 2: 运行确认测试失败**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 3: 实现 validators/platform.js**

```js
// src/validators/platform.js
import { peripheralModules } from '../generators/registry.js'

const VALID_ARCHES = ['xtensa-lx6', 'xtensa-lx7', 'risc-v', 'arm-cortex-m33']
const VALID_FLASH  = ['qspi', 'spi']

export function validatePlatform(data) {
  const errors = []

  if (data.schemaVersion !== 1)
    errors.push(`schemaVersion — 期望 1，实际 ${data.schemaVersion}`)

  for (const field of ['platformId', 'id', 'name']) {
    if (typeof data[field] !== 'string')
      errors.push(`${field} — 期望 string，实际 ${typeof data[field]}`)
  }

  if (!VALID_ARCHES.includes(data.arch))
    errors.push(`arch — 期望 ${VALID_ARCHES.join(' | ')}，实际 "${data.arch}"`)

  if (!VALID_FLASH.includes(data.flashInterface))
    errors.push(`flashInterface — 期望 qspi | spi，实际 "${data.flashInterface}"`)

  const mem = data.memory ?? {}
  for (const field of ['sramBytes', 'romBytes', 'flashMaxBytes', 'psramMaxBytes']) {
    if (typeof mem[field] !== 'number')
      errors.push(`memory.${field} — 期望 number，实际 ${typeof mem[field]}`)
  }

  if (data.peripherals && typeof data.peripherals === 'object') {
    for (const mod of peripheralModules) {
      const key = mod.meta.key
      if (data.peripherals[key]) {
        errors.push(...mod.validate(data.peripherals[key], `peripherals.${key}`))
      }
    }
  }

  return errors
}
```

- [ ] **Step 4: 运行确认测试通过**

```bash
cd tools/manifest-gen && npm test
```

- [ ] **Step 5: 提交**

```bash
git add tools/manifest-gen/src/validators/platform.js \
        tools/manifest-gen/test/validator.test.js
git commit -m "feat(manifest-gen): add platform validator"
```

---

## Task 14: platform wizard（交互向导）

**Files:**
- Create: `tools/manifest-gen/src/generators/platform/wizard.js`

> 交互式提问无法用 vitest 自动测试，此 Task 改为手动冒烟测试。

- [ ] **Step 1: 实现 wizard.js**

```js
// src/generators/platform/wizard.js
import { input, select, checkbox, number, confirm } from '@inquirer/prompts'
import { peripheralModules } from '../../registry.js'

export async function runPlatformWizard() {
  console.log('\n=== Platform JSON 生成向导 ===\n')

  // --- 第一层：顶层字段 ---
  const platformId     = await input({ message: 'platformId (小写连字符，如 t5ai):' })
  const variantId      = await input({ message: 'variantId（通常与 platformId 相同）:', default: platformId })
  const name           = await input({ message: '平台显示名称（如 T5AI）:' })
  const arch           = await select({
    message: '处理器架构:',
    choices: [
      { value: 'arm-cortex-m33' },
      { value: 'xtensa-lx6' },
      { value: 'xtensa-lx7' },
      { value: 'risc-v' },
    ],
  })
  const flashInterface = await select({
    message: 'Flash 接口:',
    choices: [{ value: 'qspi' }, { value: 'spi' }],
  })

  // --- connectivity ---
  const connChoices = await checkbox({
    message: '选择连接方式:',
    choices: [
      { name: 'WiFi',     value: 'wifi',     checked: true },
      { name: 'BLE',      value: 'ble',      checked: true },
      { name: 'Ethernet', value: 'ethernet', checked: false },
      { name: 'Cellular', value: 'cellular', checked: false },
    ],
  })

  let wifiStandard = '802.11b/g/n'
  if (connChoices.includes('wifi')) {
    wifiStandard = await select({
      message: 'WiFi 标准:',
      choices: [{ value: '802.11b/g/n' }, { value: '802.11b/g/n/ax' }],
    })
  }

  let bleVersion = '5.4'
  if (connChoices.includes('ble')) {
    bleVersion = await select({
      message: 'BLE 版本:',
      choices: [{ value: '5.0' }, { value: '5.2' }, { value: '5.4' }],
    })
  }

  const connectivity = {
    wifi: connChoices.includes('wifi')
      ? { enabled: true, enableMacro: 'ENABLE_WIFI', standard: wifiStandard, bands: ['2.4GHz'], security: ['WPA', 'WPA2', 'WPA3-Personal'], modes: ['STA', 'AP', 'Direct'] }
      : { enabled: false, enableMacro: 'ENABLE_WIFI' },
    ble: connChoices.includes('ble')
      ? { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version: bleVersion }
      : { enabled: false, enableMacro: 'ENABLE_BLUETOOTH' },
    ethernet: { enabled: connChoices.includes('ethernet'), enableMacro: 'ENABLE_WIRED' },
    cellular: { enabled: connChoices.includes('cellular'), enableMacro: 'ENABLE_CELLULAR' },
  }

  // --- memory ---
  console.log('\n--- 内存配置 ---')
  const sramBytes    = await number({ message: 'SRAM 大小 (bytes):', default: 0 })
  const romBytes     = await number({ message: 'ROM 大小 (bytes):',  default: 0 })
  const flashMaxBytes = await number({ message: '最大 Flash 大小 (bytes):', default: 0 })
  const psramMaxBytes = await number({ message: '最大 PSRAM 大小 (bytes, 0=无):', default: 0 })
  const efuse        = await confirm({ message: '是否支持 eFuse?', default: false })

  const kconfigValue = await input({ message: 'PLATFORM_CHOICE Kconfig 值（如 T5AI）:' })

  // --- 第二层：外设选择 ---
  console.log('\n--- 外设选择 ---')
  const selectedPeripherals = await checkbox({
    message: '选择本平台支持的外设（空格选择，回车确认）:',
    choices: peripheralModules.map(m => ({ name: `${m.meta.label} (${m.meta.key})`, value: m.meta.key, checked: true })),
  })

  return {
    platformId,
    variantId,
    name,
    arch,
    flashInterface,
    connectivity,
    memory: { sramBytes, romBytes, flashMaxBytes, psramMaxBytes, efuse },
    kconfig: { PLATFORM_CHOICE: kconfigValue },
    selectedPeripherals,
  }
}
```

- [ ] **Step 2: 冒烟测试（手动运行，确认向导可以完成）**

```bash
cd tools/manifest-gen && node -e "
import('./src/generators/platform/wizard.js').then(m => m.runPlatformWizard()).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error)
"
```

按提示填写，最终应打印出包含 `platformId`、`selectedPeripherals` 等字段的 JSON 对象。

- [ ] **Step 3: 提交**

```bash
git add tools/manifest-gen/src/generators/platform/wizard.js
git commit -m "feat(manifest-gen): add platform interactive wizard"
```

---

## Task 15: platform create 命令

**Files:**
- Create: `tools/manifest-gen/src/commands/platform-create.js`

- [ ] **Step 1: 实现 platform-create.js**

```js
// src/commands/platform-create.js
import { promises as fs } from 'fs'
import path from 'path'
import prettier from 'prettier'
import chalk from 'chalk'
import { runPlatformWizard } from '../generators/platform/wizard.js'
import { buildPlatform } from '../generators/platform/builder.js'

export async function runPlatformCreate() {
  const answers = await runPlatformWizard()
  const data    = buildPlatform(answers)
  const json    = JSON.stringify(data, null, 2)
  const formatted = await prettier.format(json, { parser: 'json' })

  const outDir  = path.join(process.cwd(), 'platforms', answers.platformId)
  const outFile = path.join(outDir, `${answers.variantId}.json`)

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(outFile, formatted, 'utf8')

  console.log(chalk.green(`\n✔ 已生成：${outFile}`))
}
```

- [ ] **Step 2: 手动运行端到端测试**

```bash
cd /home/share/samba/tuyaopen-ide-manifests && \
node tools/manifest-gen/bin/manifest-gen.js platform create
```

填写信息后，检查 `platforms/<platformId>/<variantId>.json` 是否存在，内容是否为格式化 JSON。

```bash
# 验证生成的文件是有效 JSON
node -e "JSON.parse(require('fs').readFileSync('platforms/<your-id>/<your-id>.json', 'utf8')); console.log('JSON 有效')"
```

- [ ] **Step 3: 提交**

```bash
git add tools/manifest-gen/src/commands/platform-create.js
git commit -m "feat(manifest-gen): add platform create command"
```

---

## Task 16: platform validate 命令

**Files:**
- Create: `tools/manifest-gen/src/commands/platform-validate.js`

- [ ] **Step 1: 实现 platform-validate.js**

```js
// src/commands/platform-validate.js
import { promises as fs } from 'fs'
import chalk from 'chalk'
import { validatePlatform } from '../validators/platform.js'

export async function runPlatformValidate(filePath) {
  let raw
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch {
    console.error(chalk.red(`✗ 无法读取文件：${filePath}`))
    process.exit(1)
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    console.error(chalk.red(`✗ JSON 解析失败：${e.message}`))
    process.exit(1)
  }

  const errors = validatePlatform(data)

  if (errors.length === 0) {
    console.log(chalk.green('✔ 校验通过，格式正确'))
  } else {
    for (const err of errors) console.error(chalk.red(`✗ ${err}`))
    console.error(chalk.red(`\n发现 ${errors.length} 个错误`))
    process.exit(1)
  }
}
```

- [ ] **Step 2: 用现有 t5ai.json 测试（应通过）**

```bash
cd /home/share/samba/tuyaopen-ide-manifests && \
node tools/manifest-gen/bin/manifest-gen.js platform validate platforms/t5ai/t5ai.json
```

预期输出：`✔ 校验通过，格式正确`

- [ ] **Step 3: 用损坏的 JSON 测试（应报错）**

```bash
echo '{"schemaVersion":1,"platformId":123}' > /tmp/bad-platform.json && \
node tools/manifest-gen/bin/manifest-gen.js platform validate /tmp/bad-platform.json
```

预期输出包含 `✗ platformId — 期望 string`。

- [ ] **Step 4: 提交**

```bash
git add tools/manifest-gen/src/commands/platform-validate.js
git commit -m "feat(manifest-gen): add platform validate command"
```

---

## Task 17: platform normalize 命令

**Files:**
- Create: `tools/manifest-gen/src/commands/platform-normalize.js`

- [ ] **Step 1: 实现 platform-normalize.js**

```js
// src/commands/platform-normalize.js
import { promises as fs } from 'fs'
import prettier from 'prettier'
import chalk from 'chalk'
import { validatePlatform } from '../validators/platform.js'
import { normalizePlatform } from '../generators/platform/builder.js'

export async function runPlatformNormalize(filePath, outPath) {
  let raw
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch {
    console.error(chalk.red(`✗ 无法读取文件：${filePath}`))
    process.exit(1)
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    console.error(chalk.red(`✗ JSON 解析失败：${e.message}`))
    process.exit(1)
  }

  const errors = validatePlatform(data)
  if (errors.length > 0) {
    for (const err of errors) console.error(chalk.red(`✗ ${err}`))
    console.error(chalk.red(`\n发现 ${errors.length} 个错误，中止格式化`))
    process.exit(1)
  }

  const normalized = normalizePlatform(data)
  const json = JSON.stringify(normalized, null, 2)
  const formatted = await prettier.format(json, { parser: 'json' })

  const target = outPath ?? filePath
  await fs.writeFile(target, formatted, 'utf8')
  console.log(chalk.green(`✔ 已格式化：${target}`))
}
```

- [ ] **Step 2: 用 t5ai.json 测试（输出到临时文件）**

```bash
cd /home/share/samba/tuyaopen-ide-manifests && \
node tools/manifest-gen/bin/manifest-gen.js platform normalize platforms/t5ai/t5ai.json --out /tmp/t5ai-normalized.json
```

预期：`✔ 已格式化：/tmp/t5ai-normalized.json`，内容为格式化 JSON。

- [ ] **Step 3: 对比原文件与格式化后的文件（应只有空白差异，键顺序一致）**

```bash
diff platforms/t5ai/t5ai.json /tmp/t5ai-normalized.json
```

预期：无实质性差异（仅可能有末尾换行等微小空白差异）。

- [ ] **Step 4: 提交**

```bash
git add tools/manifest-gen/src/commands/platform-normalize.js
git commit -m "feat(manifest-gen): add platform normalize command"
```

---

## Task 18: 运行全套测试并提交最终状态

- [ ] **Step 1: 运行完整测试套件**

```bash
cd tools/manifest-gen && npm test
```

预期：所有测试 PASS，0 failures。

- [ ] **Step 2: 验证 CLI --help**

```bash
node tools/manifest-gen/bin/manifest-gen.js --help
node tools/manifest-gen/bin/manifest-gen.js platform --help
```

预期：显示 create / validate / normalize 三个子命令及说明。

- [ ] **Step 3: 端到端冒烟测试（validate 现有 t5ai.json）**

```bash
cd /home/share/samba/tuyaopen-ide-manifests && \
node tools/manifest-gen/bin/manifest-gen.js platform validate platforms/t5ai/t5ai.json
```

预期：`✔ 校验通过，格式正确`

- [ ] **Step 4: 提交**

```bash
git add tools/manifest-gen/
git commit -m "feat(tools): complete manifest-gen CLI v1 — platform create/validate/normalize"
```
