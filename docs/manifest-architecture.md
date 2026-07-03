# TuyaOpen Manifest Architecture

## Overview

TuyaOpen IDE Manifest 是连接 IDE、SDK 和硬件的数据层。它定义了从芯片到平台、到开发板、再到示例应用之间的完整层级关系。

---

## 层级架构

```mermaid
graph TD
    subgraph "Manifest Registry"
        REG[registry.json]
        REG --> PLAT_IDX[platforms/index.json]
        REG --> BOARD_IDX[boards-and-chips/index.json]
        REG --> DEMO_IDX[demos/index.json]
        REG --> SKILL_IDX[skills/index.json]
    end

    subgraph "Platform / Chip 层"
        PLAT_IDX --> PLAT_T5AI[platforms/t5ai/t5ai.json]
        PLAT_IDX --> PLAT_T3[platforms/t3/t3.json]
        PLAT_IDX --> PLAT_ESP[platforms/esp32-s3/...]
    end

    subgraph "Board 层"
        BOARD_IDX --> B_EVB[tuya-t5ai-evb.json]
        BOARD_IDX --> B_BOARD[tuya-t5ai-board.json]
        BOARD_IDX --> B_POCKET[tuya-t5ai-pocket.json]
        BOARD_IDX --> B_MORE[... 其他开发板]
    end

    subgraph "Demo / App 层"
        DEMO_IDX --> D1[tuya-ai-your-chat-bot.json]
        DEMO_IDX --> D2[peripherals-button.json]
        DEMO_IDX --> D3[wifi-sta.json]
        DEMO_IDX --> D_MORE[... 81 个示例]
    end

    %% 依赖关系
    B_EVB -->|platformId: t5ai| PLAT_T5AI
    B_BOARD -->|platformId: t5ai| PLAT_T5AI
    D1 -->|boards: tuya-t5ai-evb, ...| B_EVB
    D2 -->|boards: tuya-t5ai-evb, ...| B_EVB
    D3 -->|compatibilityType: universal| PLAT_T5AI
```

---

## 完整依赖关系

```mermaid
graph LR
    subgraph "Hardware"
        CHIP[芯片 T5-E1-IPEX<br/>ARM Cortex-M33<br/>Wi-Fi 6 + BLE 5.4]
    end

    subgraph "Platform"
        PLAT[平台定义<br/>t5ai<br/>GPIO/UART/SPI/I2C<br/>内存/Flash/连接]
    end

    subgraph "Board"
        BOARD_A[TUYA_T5AI_EVB<br/>固定外设<br/>Audio+Display+LED+Button]
        BOARD_B[TUYA_T5AI_BOARD<br/>可配置外设<br/>LCD模块可选]
        BOARD_C[TUYA_T5AI_POCKET<br/>迷你形态<br/>小屏+电池]
    end

    subgraph "Demo/App"
        APP_1[your_chat_bot<br/>板级相关<br/>16 boards]
        APP_2[switch_demo<br/>通用<br/>所有平台]
        EX_1[peripherals/button<br/>板级相关<br/>5 boards]
        EX_2[wifi/sta<br/>通用<br/>跨平台]
    end

    CHIP --> PLAT
    PLAT --> BOARD_A
    PLAT --> BOARD_B
    PLAT --> BOARD_C
    BOARD_A --> APP_1
    BOARD_B --> APP_1
    BOARD_C --> APP_1
    BOARD_A --> EX_1
    PLAT --> APP_2
    PLAT --> EX_2
```

---

## Kconfig 与 Manifest 的映射关系

```mermaid
flowchart TD
    subgraph "SDK Kconfig 层级"
        KC_PLAT["boards/T5AI/Kconfig<br/>PLATFORM_CHOICE=T5AI<br/>↳ choice: 选择开发板"]
        KC_BOARD["boards/T5AI/TUYA_T5AI_EVB/Kconfig<br/>BOARD_CHOICE=TUYA_T5AI_EVB<br/>↳ select: ENABLE_AUDIO_CODECS<br/>↳ select: ENABLE_DISPLAY<br/>↳ select: ENABLE_BUTTON_2"]
        KC_APP["apps/.../config/TUYA_T5AI_EVB.config<br/>CONFIG_BOARD_CHOICE_T5AI=y<br/>CONFIG_BOARD_CHOICE_TUYA_T5AI_EVB=y<br/>CONFIG_ENABLE_GUI_CHATBOT=y"]
        KC_DEFAULT["apps/.../app_default.config<br/>通用默认配置<br/>CONFIG_PROJECT_VERSION<br/>CONFIG_TUYA_PRODUCT_ID"]
    end

    subgraph "Manifest 对应"
        M_PLAT["platforms/index.json<br/>platformId: t5ai"]
        M_BOARD["boards-and-chips/t5ai/tuya-t5ai-evb.json<br/>peripheralPatterns → 引脚映射<br/>Kconfig 条件 → optional 标志"]
        M_DEMO["demos/tuya-ai-your-chat-bot.json<br/>boards: [tuya-t5ai-evb, ...]<br/>boardConfigs: [TUYA_T5AI_EVB, ...]<br/>defaultConfig: {...}"]
    end

    KC_PLAT <-->|对应| M_PLAT
    KC_BOARD <-->|对应| M_BOARD
    KC_APP <-->|对应| M_DEMO
    KC_DEFAULT <-->|对应| M_DEMO

    KC_PLAT --> KC_BOARD
    KC_BOARD --> KC_APP
    KC_APP --> KC_DEFAULT
```

---

## 数据流：创建项目

```mermaid
sequenceDiagram
    participant User as 用户
    participant IDE as TuyaOpen IDE
    participant Manifest as Manifest Registry
    participant SDK as TuyaOpen SDK

    User->>IDE: 选择 Demo (your_chat_bot)
    IDE->>Manifest: 读取 demos/tuya-ai-your-chat-bot.json
    Manifest-->>IDE: boards: [16 个兼容板], source, defaultConfig

    User->>IDE: 选择 Board (TUYA_T5AI_EVB)
    IDE->>Manifest: 读取 boards-and-chips/t5ai/tuya-t5ai-evb.json
    Manifest-->>IDE: platformId, peripheralPatterns, Kconfig

    IDE->>SDK: git clone source.repo (ref: master)
    IDE->>SDK: 复制 source.subpath → 项目目录
    IDE->>IDE: 合并 Kconfig:<br/>1. board Kconfig (BOARD_CHOICE=TUYA_T5AI_EVB)<br/>2. demo config (TUYA_T5AI_EVB.config)<br/>3. app_default.config

    IDE->>User: 项目就绪，可编译
    User->>SDK: tos.py build
    SDK->>SDK: 加载 platform (T5AI)<br/>加载 board config<br/>编译 demo 源码

    Note over User,SDK: 若之后修改了 app_default.config，<br/>必须先 tos.py clean 再 tos.py build
    User->>SDK: (修改 app_default.config 后) tos.py clean
    User->>SDK: tos.py build
```

> ⚠️ **修改 `app_default.config` 后必须 `tos.py clean`**
> 与 `tos.py config choice` / `config menu`（会自动触发 clean）不同，**手动编辑** `app_default.config` 不会触发 clean。此时陈旧的 `.build/cache/using.config` 会被复用，直接 `tos.py build` 会静默忽略你的改动。因此**任何对 `app_default.config` 的手动修改完成后，都需要先执行 `tos.py clean`，再重新 `tos.py build`**，改动才会生效。

---

## 文件系统对照表

### Manifest Registry (声明式元数据)

```
vendor/tuyaopen-ide-manifests/
├── registry.json                          # 入口：4 个域的 URL
├── platforms/
│   ├── index.json                         # 平台列表
│   └── t5ai/
│       └── t5ai.json                      # 芯片详情：架构/内存/引脚/外设能力
├── boards-and-chips/
│   ├── index.json                         # 开发板列表 (id, platformId, summary)
│   └── t5ai/
│       ├── tuya-t5ai-evb.json            # 板级详情 + peripheralPatterns
│       ├── tuya-t5ai-board.json
│       └── ...
├── demos/
│   ├── index.json                         # 81 个 demo 索引
│   ├── tuya-ai-your-chat-bot.json        # 详情：defaultConfig, boardConfigs
│   ├── wifi-sta.json
│   └── ...
└── skills/
    └── index.json                         # IDE AI Skills 注册表
```

### TuyaOpen SDK (构建系统实现)

```
TuyaOpenSDK/
├── platform/
│   ├── platform_config.yaml              # 平台 git 子模块定义
│   └── T5AI/                             # 编译器/工具链/CMake
├── boards/
│   └── T5AI/
│       ├── Kconfig                       # 平台级 Kconfig (选板)
│       ├── TKL_Kconfig                   # 外设驱动 Kconfig
│       ├── config/
│       │   └── T5AI.config              # 平台默认 config
│       ├── TUYA_T5AI_EVB/
│       │   └── Kconfig                  # 板级 Kconfig (启用哪些外设)
│       ├── TUYA_T5AI_BOARD/
│       │   └── Kconfig
│       └── ...
├── apps/                                  # 板级相关应用
│   ├── tuya.ai/
│   │   └── your_chat_bot/
│   │       ├── config/
│   │       │   ├── TUYA_T5AI_EVB.config  # 每个板的配置覆盖
│   │       │   ├── DNESP32S3.config
│   │       │   └── ...
│   │       ├── app_default.config        # 通用默认
│   │       ├── Kconfig                   # App 级可配置项
│   │       └── src/
│   └── tuya_cloud/
│       └── switch_demo/                  # 无 config/ → 通用
│           ├── app_default.config
│           └── src/
└── examples/                              # 通用示例
    ├── peripherals/button/
    │   ├── config/                       # 部分 example 也有板级配置
    │   │   ├── TUYA_T5AI_EVB.config
    │   │   └── ...
    │   └── src/
    └── wifi/sta/                          # 无 config/ → 完全通用
        ├── app_default.config
        └── README.md
```

---

## 关键概念映射

| 概念 | Manifest 字段 | SDK Kconfig | 说明 |
|------|--------------|-------------|------|
| **芯片平台** | `platformId: "t5ai"` | `CONFIG_PLATFORM_CHOICE=T5AI` | 决定工具链和驱动层 |
| **开发板** | `board.id: "tuya-t5ai-evb"` | `CONFIG_BOARD_CHOICE_TUYA_T5AI_EVB=y` | 决定引脚和外设 |
| **外设启用** | `peripheralPatterns.*.optional` | `CONFIG_ENABLE_DISPLAY=y` | Kconfig 条件编译 |
| **兼容性** | `demo.compatibilityType` | 有无 `config/` 目录 | universal=跨平台, board-specific=需选板 |
| **板级配置** | `demo.boardConfigs[]` | `config/*.config` 文件名 | 每个 .config 文件对应一个支持的板 |
| **默认配置** | `demo.defaultConfig` | `app_default.config` 内容 | 项目级通用配置；**修改后须 `tos.py clean` 再构建** |
| **来源** | `demo.source.subpath` | 实际代码路径 | apps/ 或 examples/ 下的子目录 |

---

## 兼容性判断逻辑

```mermaid
flowchart TD
    START[用户选择了一个 Demo] --> CHECK_TYPE{compatibilityType?}
    
    CHECK_TYPE -->|universal| SHOW_ALL[显示所有开发板<br/>该 Demo 跨平台兼容]
    CHECK_TYPE -->|board-specific| CHECK_BOARDS[检查 demo.boards 列表]
    
    CHECK_BOARDS --> FILTER[只显示 boards[] 中<br/>包含的开发板]
    
    SHOW_ALL --> SELECT_BOARD[用户选板]
    FILTER --> SELECT_BOARD
    
    SELECT_BOARD --> GEN_CONFIG[生成项目配置]
    
    GEN_CONFIG --> HAS_BOARD_CONFIG{demo 有该板的<br/>config/*.config?}
    
    HAS_BOARD_CONFIG -->|是| USE_BOARD_CFG[使用板级 config 覆盖]
    HAS_BOARD_CONFIG -->|否| USE_DEFAULT[使用 app_default.config]
    
    USE_BOARD_CFG --> BUILD[tos.py build]
    USE_DEFAULT --> BUILD

    BUILD --> EDIT{修改了<br/>app_default.config?}
    EDIT -->|是| CLEAN[tos.py clean<br/>清除陈旧 .build/cache/using.config]
    EDIT -->|否| DONE[完成]
    CLEAN --> BUILD
```

---

## peripheralPatterns 结构

```mermaid
classDiagram
    class Board {
        +id: string
        +platformId: string
        +peripheralPatterns: map
    }

    class PeripheralCategory {
        +type: string
        +items: Peripheral[]
    }

    class Peripheral {
        +name: LocalizedString
        +model: string
        +interface: string
        +pins: PinMapping
        +optional: boolean
        +kconfig: string
        +group: string
        +role: string
    }

    class PinMapping {
        +role → GPIO 编号
    }

    Board "1" --> "*" PeripheralCategory : peripheralPatterns
    PeripheralCategory "1" --> "*" Peripheral : items
    Peripheral "1" --> "1" PinMapping : pins

    note for Peripheral "interface 类型:\n- INTERNAL (片上)\n- GPIO (直连)\n- SPI (总线)\n- I2C (总线)\n- RGB (显示)\n- DVP (摄像头)"
```

---

## 总结

**核心设计原则:**

1. **声明式分离** — Manifest 只描述「是什么」和「在哪里」，不包含构建逻辑
2. **懒加载** — registry.json → domain index → detail file，逐层加载
3. **双向映射** — Manifest 的 board ID ↔ SDK 的 Kconfig BOARD_CHOICE
4. **兼容性标签** — `universal` vs `board-specific` 让 IDE 知道何时需要用户选板
5. **Config 文件名 = 支持的板** — `config/TUYA_T5AI_EVB.config` 存在即表示该板兼容
