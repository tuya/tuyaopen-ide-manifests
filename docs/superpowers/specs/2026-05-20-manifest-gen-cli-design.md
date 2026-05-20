# manifest-gen CLI 设计规格

**日期：** 2026-05-20  
**范围：** Platform JSON 生成与校验工具（`tools/manifest-gen/`）  
**状态：** 已确认

---

## 问题背景

AI 辅助生成 platform 变体 JSON 文件（`platforms/<platformId>/<variantId>.json`）时，输出格式不可靠：必填字段缺失、值类型错误、键顺序混乱、结构偏离模板。需要一个基于硬编码 schema 规则的程序化工具来保证格式正确性。

---

## 范围

- **第一阶段（本规格）：** 只处理 platform JSON（`platforms/`）
- **第二阶段（未来）：** board JSON（`boards-and-chips/`）—— 架构预留扩展插槽

---

## 架构

### 目录结构

```
tools/
└── manifest-gen/
    ├── package.json             # name: manifest-gen，纯 ESM
    ├── bin/
    │   └── manifest-gen.js      # CLI 入口，#!/usr/bin/env node
    └── src/
        ├── cli.js               # commander 子命令注册
        ├── generators/
        │   ├── registry.js      # 外设模块注册表（扩展点）
        │   ├── platform/
        │   │   ├── wizard.js    # 顶层字段交互提问（inquirer）
        │   │   ├── builder.js   # 将向导答案组装成最终 JSON
        │   │   └── peripherals/ # 每种外设一个文件，共约 18 个模块
        │   │       ├── gpio.js
        │   │       ├── uart.js
        │   │       ├── i2c.js
        │   │       ├── spi.js
        │   │       ├── qspi.js
        │   │       ├── pwm.js
        │   │       ├── adc.js
        │   │       ├── timer.js
        │   │       ├── wdt.js
        │   │       ├── rtc.js
        │   │       ├── flash.js
        │   │       ├── pinmux.js
        │   │       ├── dma2d.js
        │   │       ├── rgb.js
        │   │       ├── i8080.js
        │   │       ├── dvp.js
        │   │       ├── kws.js
        │   │       └── vad.js
        │   └── board/
        │       └── index.js     # 空 stub，返回"暂未支持"提示
        ├── validators/
        │   ├── platform.js      # platform JSON 字段校验
        │   └── board.js         # 空 stub
        └── schemas/
            ├── platform.js      # JS 对象描述的字段规则（非 JSON Schema）
            └── board.js         # 空 stub
```

### 依赖

| 包 | 用途 |
|---|---|
| `commander` | 子命令解析 |
| `@inquirer/prompts` | 交互式提问（原生 ESM） |
| `chalk` | 终端彩色输出 |
| `prettier` | JSON 格式化输出——保证所有文件缩进和换行完全一致 |

**不使用 `ajv`：** `peripherals` 各外设结构差异太大，为每个模块单独写 JS 校验函数比维护一个巨型 JSON Schema 更直观、可维护。

---

## CLI 子命令

```bash
# 交互式向导——从零生成新的 platform JSON
manifest-gen platform create

# 校验已有 platform JSON 的格式和字段
manifest-gen platform validate <文件路径>

# 校验 + 格式化已有 platform JSON
manifest-gen platform normalize <文件路径> [--out <输出路径>]
```

---

## `platform create` 分层向导流程

### 第一层：顶层字段（逐一交互填写）

| 字段 | 输入方式 |
|------|---------|
| `platformId` | 文本输入 |
| `id`（variantId） | 文本输入 |
| `name` | 文本输入 |
| `arch` | 单选：`xtensa-lx6` / `xtensa-lx7` / `risc-v` / `arm-cortex-m33` |
| `flashInterface` | 单选：`qspi` / `spi` |
| `connectivity` | 多选：wifi / ble / ethernet / cellular（每项再追问子字段） |
| `memory.*` | 依次数字输入：sramBytes、romBytes、flashMaxBytes、psramMaxBytes、efuse |
| `kconfig.PLATFORM_CHOICE` | 文本输入 |

### 第二层：外设选择

复选框列出全部约 18 种外设类型，用户勾选本平台支持哪些。**未勾选的外设不出现在输出文件中。**

### 第三层：输出

- 对每个已勾选的外设，调用其模块的 `scaffold()` 函数，生成结构完整的骨架（数值部分填 `0` / `null` / 空数组占位，供用户事后填写实际数值）
- `builder.js` 用固定的对象字面量顺序组装所有字段
- 用 `prettier` 格式化后写入 `platforms/<platformId>/<variantId>.json`

---

## `platform validate` 输出示例

```
✔ schemaVersion: 正常
✔ connectivity.wifi: 正常
✗ peripherals.uart.spec.ports[0].pinGroups — 期望 array，实际 object
✗ peripherals.pwm.count — 期望 number，实际 string "12"
发现 2 个错误。
```

---

## `platform normalize`

1. 先运行校验——若有错误则终止并报告，不覆盖原文件
2. 用 `prettier` 重新序列化（2 空格缩进，键顺序由 `builder.js` 固定）
3. 若指定 `--out`，写入新文件；否则原地覆盖

---

## 外设模块规范

`src/generators/platform/peripherals/` 下每个文件导出以下内容：

```js
// 模块元信息
export const meta = {
  key: string,           // peripherals 对象中的键名
  label: string,         // 向导复选框显示名称
  enableMacro: string,
  tklHeader: string,
  idPrefix: string | null,
}

// 生成带占位符的骨架结构
export function scaffold(): object

// 校验已有数据，返回错误信息列表
export function validate(data: object, path: string): string[]
```

`registry.js` 统一导入所有模块并导出 `peripheralModules[]` 数组——这是唯一需要修改的地方，用于新增外设类型或未来添加 board 外设模块。

---

## Board 支持扩展方式

添加 board JSON 支持时，只需：

1. 创建 `src/generators/board/wizard.js`、`builder.js`、`peripherals/`
2. 创建 `src/validators/board.js`
3. 在 `registry.js` 中注册
4. 在 `cli.js` 中添加 `manifest-gen board create|validate|normalize` 子命令

**Platform 相关代码无需改动。**

---

## 关键不变量

- **键顺序**：由 `builder.js` 用固定对象字面量顺序保证，不依赖排序算法
- **格式化**：由 `prettier` 统一保证，不依赖手动 `JSON.stringify` 缩进参数
- **校验范围**：结构校验（类型、必填字段、数组形状），不做语义校验（不检查针脚号是否在 GPIO 范围内）
