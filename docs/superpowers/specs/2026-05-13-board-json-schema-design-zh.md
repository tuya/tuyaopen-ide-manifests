# TuyaOpen Board JSON Schema 设计文档

**日期：** 2026-05-13
**状态：** 已确认，待实现
**作者：** zhouss@tuya.com

---

## 背景

`tuyaopen-ide-manifests` 是 TuyaOpen IDE 运行时拉取的公共清单注册表。`boards-and-chips` 域目前的 schema 非常简单（id、name、brand、chip、summary、tags、source），只够做展示用。

本设计将其扩展为同时服务两个场景：
1. **IDE 展示**：板子列表页显示芯片、Flash、外设、推荐 Demo
2. **AI Vibe Coding 上下文**：开发者用 Cursor 或 VS Code Chat 写代码时，AI 能读懂当前板子有哪些外设、该包哪个头文件、怎么跑 `tos.py`、有哪些常见坑

---

## 目标

1. IDE 展示：板子列表页能显示芯片型号、Flash 大小、外设列表、推荐 Demo
2. AI 上下文：AI 知道该用哪个头文件、哪个函数、跑哪条 `tos.py` 命令、有哪些初始化顺序要注意
3. 构建辅助：IDE 能为新项目自动预填 `BOARD_CHOICE` / `CHIP_CHOICE` / `ENABLE_*` 等 Kconfig 选项

## 不在范围内

- 替代 Kconfig 成为构建配置的唯一来源
- 存储固件二进制或构建产物
- GPIO 级别的引脚定义（太详细，属于原理图的范畴）

---

## 关键决策

| 问题 | 决策 |
|---|---|
| 硬件描述粒度 | 细粒度：外设器件型号、tos.py 参数、API 头文件 |
| AI 获取方式 | AI.md（静态摘要）+ Skill（动态运行时状态）|
| Schema 层级 | 两层：Platform（含芯片变体）+ Board（引用 Platform）|
| 文件粒度 | 每块板子一个 JSON 文件 + 轻量 index.json |
| `detailUrl` 格式 | **相对路径**，加载器根据 registry base URL 解析 |
| `peripherals[].type` | **闭合枚举**，见文末枚举表 |
| 语言策略 | AI 上下文字段（`aiContext.*`）纯英文；页面展示字段（`name`、`summary`、`peripherals[].note` 等）双语 |
| Platform 详情加载 | IDE 板子详情页**懒加载 platform JSON**，board detail 不冗余芯片规格 |

---

## 文件结构

```
tuyaopen-ide-manifests/
├── registry.json                          # 顶层索引，新增 platforms 域
├── platforms/
│   ├── index.json                         # 轻量平台索引
│   ├── t5ai.json                          # T5AI 平台 + 芯片变体完整详情
│   ├── esp32.json                         # ESP32 平台 + 芯片变体完整详情
│   ├── t3.json
│   ├── t2.json
│   └── ...
├── boards-and-chips/
│   ├── index.json                         # 轻量板子索引（只含展示字段）
│   ├── tuya-t5ai-pixel.json              # 板子完整详情
│   ├── tuya-t5ai-pocket.json
│   ├── esp32-c3-devkitm-1.json
│   └── ...
├── demos/
│   └── index.json
└── skills/
    └── index.json
```

`registry.json` 新增一个域：

```json
"platforms": {
  "url": "platforms/index.json",
  "version": "0.1.0",
  "summary": "芯片平台与变体（T5AI / ESP32 / T3 / T2 等）"
}
```

---

## Platform JSON

### `platforms/index.json` — 轻量索引

```json
{
  "schemaVersion": 1,
  "domain": "platforms",
  "publishedAt": "2026-05-13T00:00:00Z",
  "items": [
    {
      "id": "esp32",
      "name": { "en": "Espressif ESP32", "zh-CN": "乐鑫 ESP32" },
      "summary": {
        "en": "Espressif ESP32 family powered by ESP-IDF.",
        "zh-CN": "基于 ESP-IDF 的乐鑫 ESP32 系列。"
      },
      "variantIds": ["esp32", "esp32-c3", "esp32-s3", "esp32-c6"],
      "detailUrl": "platforms/esp32.json"
    },
    {
      "id": "t5ai",
      "name": { "en": "Tuya T5AI", "zh-CN": "涂鸦 T5AI" },
      "summary": {
        "en": "Tuya T5AI platform with built-in NPU for edge AI.",
        "zh-CN": "涂鸦 T5AI 平台，内置 NPU，面向端侧 AI。"
      },
      "variantIds": ["t5ai"],
      "detailUrl": "platforms/t5ai.json"
    }
  ]
}
```

### `platforms/esp32.json` — 平台完整详情

```json
{
  "schemaVersion": 1,
  "id": "esp32",
  "name": { "en": "Espressif ESP32", "zh-CN": "乐鑫 ESP32" },
  "summary": {
    "en": "Espressif ESP32 family powered by ESP-IDF, covering Xtensa LX6/LX7 and RISC-V cores.",
    "zh-CN": "基于 ESP-IDF 的乐鑫 ESP32 系列，涵盖 Xtensa LX6/LX7 与 RISC-V 架构。"
  },
  "tuyaopen": {
    "platformFolder": "ESP32",
    "sdkRepo": "https://github.com/tuya/tuyaos-esp32",
    "ref": "main"
  },
  "variants": [
    {
      "id": "esp32-c3",
      "name": "ESP32-C3",
      "arch": "risc-v",
      "cores": 1,
      "fCpuMaxHz": 160000000,
      "sramBytes": 409600,
      "romBytes": 393216,
      "flashInterface": "qspi",
      "connectivity": ["wifi", "ble"],
      "kconfig": {
        "CHIP_CHOICE": "ESP32-C3"
      }
    },
    {
      "id": "esp32-s3",
      "name": "ESP32-S3",
      "arch": "xtensa-lx7",
      "cores": 2,
      "fCpuMaxHz": 240000000,
      "sramBytes": 524288,
      "romBytes": 393216,
      "flashInterface": "qspi",
      "connectivity": ["wifi", "ble"],
      "kconfig": {
        "CHIP_CHOICE": "ESP32-S3"
      }
    },
    {
      "id": "esp32-c6",
      "name": "ESP32-C6",
      "arch": "risc-v",
      "cores": 1,
      "fCpuMaxHz": 160000000,
      "sramBytes": 524288,
      "romBytes": 393216,
      "flashInterface": "qspi",
      "connectivity": ["wifi", "ble", "zigbee", "thread"],
      "kconfig": {
        "CHIP_CHOICE": "ESP32-C6"
      }
    }
  ]
}
```

### Platform 字段说明

| 字段 | 语言 | 含义 |
|---|---|---|
| `id` | — | 平台唯一 ID，kebab-case |
| `name` | 双语 | 展示用平台名称 |
| `summary` | 双语 | 展示用简介 |
| `tuyaopen.platformFolder` | — | 对应 `boards/<platformFolder>/` 目录名 |
| `tuyaopen.sdkRepo` | — | 底层 SDK 仓库地址 |
| `tuyaopen.ref` | — | SDK 版本（branch / tag / sha） |
| `variants[].id` | — | 芯片变体 ID，board 用 `variantId` 引用 |
| `variants[].arch` | 英文 | CPU 架构：`xtensa-lx6`、`xtensa-lx7`、`risc-v` |
| `variants[].cores` | — | CPU 核心数 |
| `variants[].fCpuMaxHz` | — | 最高主频（Hz） |
| `variants[].sramBytes` | — | 片上 SRAM（字节，不含 PSRAM） |
| `variants[].flashInterface` | — | Flash 总线类型：`qspi`、`spi` |
| `variants[].connectivity` | — | 芯片**内置**连接能力 |
| `variants[].npu` | 英文 note | 可选，有 NPU 才填：`{ "tops": 0.5, "note": "..." }` |
| `variants[].kconfig.CHIP_CHOICE` | — | `tos.py` 构建对应的 Kconfig 值 |

---

## Board JSON

### `boards-and-chips/index.json` — 轻量索引

只放列表页需要的字段：

```json
{
  "schemaVersion": 1,
  "domain": "boardsAndChips",
  "publishedAt": "2026-05-13T00:00:00Z",
  "items": [
    {
      "id": "tuya-t5ai-pixel",
      "name": { "en": "Tuya T5AI Pixel", "zh-CN": "涂鸦 T5AI Pixel 板" },
      "brand": { "en": "Tuya", "zh-CN": "涂鸦智能" },
      "manufacturer": { "en": "Tuya", "zh-CN": "涂鸦智能" },
      "platformId": "t5ai",
      "variantId": "t5ai",
      "summary": {
        "en": "T5AI board with WS2812 pixel LEDs, BMI270 IMU and multi-button layout.",
        "zh-CN": "搭载 WS2812 像素灯珠、BMI270 IMU 和多按键的 T5AI 评估板。"
      },
      "tags": ["wifi", "ble", "edge-ai", "imu", "led-pixel"],
      "image": "assets/tuya-t5ai-pixel.png",
      "detailUrl": "boards-and-chips/tuya-t5ai-pixel.json",
      "recommendedDemos": ["voice-assistant"]
    }
  ]
}
```

### `boards-and-chips/tuya-t5ai-pixel.json` — 板子完整详情

```json
{
  "schemaVersion": 1,
  "id": "tuya-t5ai-pixel",
  "name": { "en": "Tuya T5AI Pixel", "zh-CN": "涂鸦 T5AI Pixel 板" },
  "brand": { "en": "Tuya", "zh-CN": "涂鸦智能" },
  "manufacturer": { "en": "Tuya", "zh-CN": "涂鸦智能" },
  "platformId": "t5ai",
  "variantId": "t5ai",

  "memory": {
    "flashSizeBytes": 16777216,
    "psramSizeBytes": 0,
    "psramInterface": null
  },

  "peripherals": [
    {
      "type": "led-pixel",
      "model": "WS2812B",
      "count": 8,
      "interface": "SPI",
      "note": {
        "en": "RGB addressable LEDs; SPI-driven (not PWM) — timing is strict",
        "zh-CN": "RGB 可寻址灯珠，SPI 驱动（不是 PWM），时序要求严格"
      }
    },
    {
      "type": "imu",
      "model": "BMI270",
      "axes": 6,
      "interface": "I2C",
      "note": {
        "en": "6-axis accelerometer + gyroscope; default I2C address 0x68",
        "zh-CN": "6 轴加速度计 + 陀螺仪，默认 I2C 地址 0x68"
      }
    },
    {
      "type": "button",
      "count": 3,
      "note": {
        "en": "Mapped to ENABLE_BUTTON / ENABLE_BUTTON_2 / ENABLE_BUTTON_3 in Kconfig",
        "zh-CN": "对应 Kconfig 中的 ENABLE_BUTTON / ENABLE_BUTTON_2 / ENABLE_BUTTON_3"
      }
    },
    {
      "type": "buzzer",
      "count": 1,
      "interface": "GPIO",
      "note": {
        "en": "Passive buzzer; controlled via board_buzzer_api.h",
        "zh-CN": "无源蜂鸣器，通过 board_buzzer_api.h 控制"
      }
    }
  ],

  "tuyaopen": {
    "boardChoice": "TUYA_T5AI_PIXEL",
    "kconfig": {
      "BOARD_CHOICE": "TUYA_T5AI_PIXEL",
      "CHIP_CHOICE": "T5AI",
      "PLATFORM_FLASHSIZE_16M": true,
      "ENABLE_LED": true,
      "ENABLE_LEDS_PIXEL": true,
      "ENABLE_IMU": true,
      "ENABLE_IMU_BMI270": true,
      "ENABLE_BUTTON": true,
      "ENABLE_BUTTON_2": true,
      "ENABLE_BUTTON_3": true
    },
    "buildCommands": {
      "config": "tos.py config",
      "build": "tos.py build",
      "flash": "tos.py flash",
      "monitor": "tos.py monitor"
    },
    "source": {
      "repo": "https://github.com/tuya/TuyaOpen",
      "subpath": "boards/T5AI/TUYA_T5AI_PIXEL",
      "ref": "main"
    }
  },

  "aiContext": {
    "capabilities": ["pixel-led", "motion-sensing", "gesture-detection"],
    "boardApiHeader": "board_com_api.h",
    "peripheralApis": [
      {
        "peripheral": "led-pixel",
        "header": "board_pixel_api.h",
        "keyFunctions": [
          "board_pixel_init()",
          "board_pixel_set_color(index, r, g, b)"
        ]
      },
      {
        "peripheral": "imu",
        "header": "board_bmi270_api.h",
        "keyFunctions": [
          "board_bmi270_init()",
          "board_bmi270_read(accel, gyro)"
        ]
      },
      {
        "peripheral": "buzzer",
        "header": "board_buzzer_api.h",
        "keyFunctions": [
          "board_buzzer_init()",
          "board_buzzer_set(freq, duration_ms)"
        ]
      }
    ],
    "notes": [
      "Call board_register_hardware() before using any peripheral",
      "WS2812B is SPI-driven, not PWM — timing is strict",
      "BMI270 default I2C address is 0x68; must initialize before reading data"
    ]
  },

  "links": {
    "schematic": null,
    "datasheet": null,
    "productPage": null
  },

  "tags": ["wifi", "ble", "edge-ai", "imu", "led-pixel"],
  "recommendedDemos": ["voice-assistant"]
}
```

### 语言策略说明

| 字段 | 语言 | 原因 |
|---|---|---|
| `name`、`summary` | 双语 | 展示在 IDE 列表页和详情页 |
| `peripherals[].note` | 双语 | 展示在 IDE 外设列表的 tooltip |
| `brand`、`manufacturer` | 双语 | 展示在 IDE 页面 |
| `aiContext.notes` | 纯英文 | 注入 AI prompt，技术内容英文更稳定 |
| `aiContext.capabilities` | 纯英文 | 仅供 AI 推断，不展示 |
| `aiContext.peripheralApis` | 纯英文 | 代码符号，语言无关 |
| `tuyaopen.*` | 纯英文 | 构建参数，语言无关 |

### Board 详情字段说明

| 区块 | 字段 | AI 用途 | IDE 用途 |
|---|---|---|---|
| `memory` | `flashSizeBytes` | 判断是否需要 PSRAM 分配大缓冲区 | 显示存储规格 |
| `memory` | `psramSizeBytes` | 知道能否调用 `ps_malloc()` | 显示 PSRAM 标签 |
| `peripherals[]` | `type`（闭合枚举）、`model`、`count`、`interface` | 知道有哪些硬件可用 | 展示外设列表 |
| `peripherals[]` | `note`（双语） | 了解注意事项 | tooltip 提示 |
| `tuyaopen.kconfig` | 所有 `ENABLE_*` | 知道哪些能力在编译时已启用 | 新建项目预填 Kconfig |
| `tuyaopen.buildCommands` | config/build/flash/monitor | 直接生成可执行 shell 命令 | 一键构建集成 |
| `aiContext.peripheralApis` | `header`、`keyFunctions` | 知道包哪个头文件、调哪个函数 | 不使用 |
| `aiContext.notes` | 英文字符串数组 | 避免初始化顺序、地址、时序等常见坑 | 不使用 |
| `links` | schematic、datasheet | 调试时查阅 | 展示文档链接 |

### IDE 加载板子详情的数据拼合流程

```
用户点击某块板子
  → 加载 boards-and-chips/tuya-t5ai-pixel.json
  → 读取 platformId="t5ai"、variantId="t5ai"
  → 懒加载 platforms/t5ai.json
  → 在 variants[] 中找到 id="t5ai" 的变体
  → 合并展示：芯片规格来自 platform，外设/构建信息来自 board
```

Board detail JSON **不冗余**芯片规格，只保存 `platformId + variantId` 引用。

---

## AI.md 模板

项目创建时由 IDE 自动生成，写入 `<项目根目录>/AI.md`。

```markdown
# TuyaOpen 项目上下文

## 目标开发板
- **板子**：涂鸦 T5AI Pixel（`TUYA_T5AI_PIXEL`）
- **平台**：T5AI（`boards/T5AI/TUYA_T5AI_PIXEL`）
- **芯片**：T5AI — 双核 Xtensa LX7 @ 480 MHz，512 KB SRAM，内置 NPU（0.5 TOPS）
- **Flash**：16 MB（QSPI）
- **连接能力**：Wi-Fi + BLE

## 硬件外设
| 外设 | 型号 | 接口 | 说明 |
|---|---|---|---|
| LED Pixel | WS2812B × 8 | SPI | RGB addressable; use board_pixel_api.h |
| IMU | BMI270 6-axis | I2C | Accel + Gyro; I2C addr 0x68 |
| Button | × 3 | GPIO | ENABLE_BUTTON / _2 / _3 |
| Buzzer | × 1 | GPIO | board_buzzer_api.h |

## 构建命令
\```bash
tos.py config    # 打开 menuconfig
tos.py build     # 编译固件
tos.py flash     # 烧录到设备
tos.py monitor   # 打开串口监视器
\```

## 关键 Kconfig 选项
\```
BOARD_CHOICE=TUYA_T5AI_PIXEL
CHIP_CHOICE=T5AI
PLATFORM_FLASHSIZE_16M=y
ENABLE_LEDS_PIXEL=y
ENABLE_IMU=y / ENABLE_IMU_BMI270=y
ENABLE_BUTTON=y / ENABLE_BUTTON_2=y / ENABLE_BUTTON_3=y
\```

## 板级 API 入口
- 所有外设使用前先调用：`board_register_hardware()`
- LED Pixel：`board_pixel_api.h` → `board_pixel_init()`、`board_pixel_set_color(index, r, g, b)`
- IMU：`board_bmi270_api.h` → `board_bmi270_init()`、`board_bmi270_read(accel, gyro)`
- Buzzer：`board_buzzer_api.h` → `board_buzzer_init()`、`board_buzzer_set(freq, duration_ms)`

## Notes
- Call board_register_hardware() before using any peripheral
- WS2812B is SPI-driven (not PWM) — timing is strict
- BMI270 default I2C address is 0x68; initialize before reading
```

> AI.md 中外设说明列（Notes 列）使用英文，与 `aiContext.notes` 保持一致。

---

## Skill 动态上下文

AI.md 是静态快照，Skill 补充运行时动态状态：

```
Skill 读取流程：

1. 读 .config（当前 Kconfig 实际状态）
   → 告诉 AI 现在哪些 ENABLE_* 是 y/n

2. 读 boards-and-chips/<board-id>.json（manifest 详情）
   → 补充 AI.md 没有的字段（links、完整 peripheralApis）

3. 读 boards/<PLATFORM>/<BOARD>/board_com_api.h（源码）
   → 获取实际函数签名（比 JSON 摘要更精确）

4. 拼成 prompt 注入 AI 上下文
```

| | AI.md | Skill |
|---|---|---|
| 写入时机 | 项目创建时一次性写入 | 开发者提问时实时生成 |
| 内容 | 静态硬件事实 | 当前构建状态 + 实时 API 签名 |
| 换板子 | 需重新生成 | 自动从 `.config` 读取 `BOARD_CHOICE` |
| Token 消耗 | 每次对话约 400 token | 按需注入 |

---

## 外设 type 闭合枚举

| `type` 值 | 中文描述 |
|---|---|
| `display` | 显示屏（LCD / OLED / 电子墨水屏） |
| `touch` | 触摸屏 |
| `audio` | 音频编解码（麦克风 + 扬声器） |
| `camera` | 图像传感器 |
| `imu` | 惯性测量单元（加速度计 / 陀螺仪 / 磁力计） |
| `button` | 物理按键 |
| `led` | 单色 LED |
| `led-pixel` | 可寻址 RGB 灯珠（WS2812 等） |
| `buzzer` | 无源或有源蜂鸣器 |
| `nfc` | NFC 模块 |
| `pmic` | 电源管理芯片 |
| `io-expander` | GPIO 扩展芯片 |
| `storage` | 外部存储（SD 卡、外置 Flash） |
