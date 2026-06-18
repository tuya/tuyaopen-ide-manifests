---
name: miniapp-robot-vacuum
id: miniapp-robot-vacuum
description: "Tuya/涂鸦 sweep robot/扫地机 panel development with proprietary API docs not available from general knowledge. Trigger on RobotMap/RjsRobotMap component; sweep robot DP codes (switch_go, pause, mode, suction, status, command_trans); map features (room/zone/spot cleaning, forbidden areas, virtual walls); @ray-js/robot-map, @ray-js/robot-map-sdk, @ray-js/robot-protocol, @ray-js/robot-data-stream; sweeprobottemplate; protocol encoding/decoding (raster hex/binary or structured JSON/MQTT); robot vacuum map rendering, layers, or cleaning commands in Tuya context. Do NOT trigger for iRobot/Roborock SDK, Google/Mapbox maps, generic MQTT, or Tuya IPC/cameras."
---

# 涂鸦扫地机面板开发助手

## 概述 {#description}

你是涂鸦智能扫地机器人面板开发领域的专家。帮助开发者在 Ray.js 小程序框架下开发扫地机设备面板，涵盖地图组件使用、协议编解码、功能实现等全部环节。

### 生态总览

涂鸦扫地机面板开发涉及多个库的协作：

```
┌─────────────────────────────────────────────────────┐
│                    开发者的面板项目                      │
│              (基于 sweeprobottemplate)                 │
├─────────────┬──────────────┬────────────────────────┤
│  地图组件    │   协议库      │    数据通信             │
│  @ray-js/   │  @ray-js/    │  @ray-js/              │
│  robot-map  │  robot-      │  robot-data-stream     │
│             │  protocol    │                        │
├─────────────┴──────────────┴────────────────────────┤
│              @ray-js/robot-map-sdk                    │
│              (地图渲染引擎, 基于 PIXI.js)              │
└─────────────────────────────────────────────────────┘
```

| 库 | 作用 | 协议 |
|---|---|---|
| `@ray-js/robot-map` | 地图 React 组件（RobotMap / RjsRobotMap） | 两种协议都支持 |
| `@ray-js/robot-map-sdk` | 底层渲染引擎 | 两种协议都支持 |
| `@ray-js/robot-protocol` | 点阵协议编解码（raw 类型协议） | 点阵格式 |
| `@ray-js/robot-data-stream` | P2P 连接 + MQTT 通信（结构化协议） | 结构化 |

### 协议类型对比

扫地机数据协议分为两种类型，开发者需要根据设备支持的协议选择对应方案：

| 维度 | 点阵格式协议（raw 类型） | 结构化协议 |
|---|---|---|
| 数据格式 | 十六进制字节流 | JSON |
| 地图数据 | LZ4 压缩像素矩阵 | 结构化 JSON |
| 指令下发 | DP 指令（commandTrans） | MQTT 消息 |
| 帧格式 | `aa/ab + 版本 + 长度 + 指令码 + 数据 + 校验` | `{ reqType, taskId, version, ... }` |
| 协议库 | `@ray-js/robot-protocol` | `@ray-js/robot-data-stream` |
| 编码函数 | `encodeXxx0x{code}()` | `useXxxClean()` hooks |
| 开发模板 | sweeprobottemplate | sweeper_miniapp（公版面板） |

### 技术栈

- **框架**: Ray.js（涂鸦小程序框架）
- **UI**: React + Redux
- **语言**: TypeScript
- **地图渲染**: PIXI.js (WebGL)
- **组件模式**: WebView（RobotMap）或 RJS 原生（RjsRobotMap）

### 数据流

```
设备 → P2P 通道 → useP2PDataStream hook → 原始数据(map.bin/cleanPath.bin)
  → 传入 <RobotMap map={data} path={pathData} /> → 渲染地图
```

开发者通常只需要：
1. 通过 `useP2PDataStream` 获取原始地图和路径数据
2. 将数据传入 `<RobotMap>` 组件
3. 在 `onMapReady(mapApi)` 回调中保存 `mapApi` 引用 — 这是调用所有地图方法（`getCleanZones()`、`snapshot()` 等）的唯一入口
4. 监听回调（如 `onClickRoom`、`onUpdateCleanZone`）
5. 通过协议库编码指令并下发

### 常用 DP Codes 速查

#### 控制指令
| 常量名 | DP Code | 说明 |
|---|---|---|
| `switchGoCode` | `switch_go` | 开始/停止清扫 |
| `pauseCode` | `pause` | 暂停 |
| `switchChargeCode` | `switch_charge` | 回充 |
| `modeCode` | `mode` | 清扫模式（smart/selectRoom/pose/zone/manual） |
| `commandTransCode` | `command_trans` | 指令透传（点阵格式协议的核心 DP） |
| `directionControlCode` | `direction_control` | 遥控方向（forward/backward/turn_left/turn_right/exit） |
| `seekCode` | `seek` | 寻找机器人 |

#### 清扫设置
| 常量名 | DP Code | 说明 |
|---|---|---|
| `workModeCode` | `work_mode` | 工作模式（仅扫/仅拖/扫拖） |
| `suctionCode` | `suction` | 吸力档位 |
| `cisternCode` | `cistern` | 水箱档位 |
| `cleanTimesCode` | `clean_times` | 清扫次数 |
| `carpetCleanPreferCode` | `carpet_clean_prefer` | 地毯清洁偏好 |
| `autoBoostCode` | `auto_boost` | 自动增压 |
| `yMopCode` | `y_mop` | Y 字形拖地 |
| `customizeModeSwitchCode` | `customize_mode_switch` | 自定义模式开关 |

#### 设备状态
| 常量名 | DP Code | 说明 |
|---|---|---|
| `statusCode` | `status` | 工作状态 |
| `batteryPercentageCode` | `battery_percentage` | 电量百分比 |
| `faultCode` | `fault` | 故障码 |
| `cleanTimeCode` | `clean_time` | 本次清扫时间 |
| `cleanAreaCode` | `clean_area` | 本次清扫面积 |

#### 耗材寿命
| 常量名 | DP Code | 说明 |
|---|---|---|
| `edgeBrushLifeCode` | `edge_brush_life` | 边刷寿命 |
| `rollBrushLifeCode` | `roll_brush_life` | 滚刷寿命 |
| `filterLifeCode` | `filter_life` | 滤网寿命 |
| `ragLifeCode` | `rag_life` | 拖布寿命 |

#### 设备管理
| 常量名 | DP Code | 说明 |
|---|---|---|
| `volumeSetCode` | `volume_set` | 音量 |
| `switchLedCode` | `switch_led` | LED 开关 |
| `childLockCode` | `child_lock` | 童锁 |
| `disturbTimeSetCode` | `disturb_time_set` | 勿扰时段 |
| `deviceTimerCode` | `device_timer` | 定时任务 |
| `mapResetCode` | `map_reset` | 重置地图 |
| `voiceDataCode` | `voice_data` | 语音包 |
| `dustCollectionSwitchCode` | `dust_collection_switch` | 集尘开关 |
| `dustCollectionNumCode` | `dust_collection_num` | 集尘次数 |
| `breakCleanCode` | `break_clean` | 断点续扫 |

## 适用场景 {#scene}

- **地图组件开发**：使用 RobotMap/RjsRobotMap 组件渲染地图、配置图层、处理交互回调
- **协议编解码**：点阵格式（raw 类型）hex 编解码或结构化协议 MQTT hooks 调用
- **功能实现**：选区清扫、禁区编辑、虚拟墙、选房清扫、定点清扫、路径展示等端到端实现
- **家具摆放**：在地图上放置可拖拽/旋转/缩放的家具图片（furnitures）
- **自定义区域**：通过 customZoneTypes 定义项目专属的矩形区域类型
- **自定义地毯**：在地图上展示地毯区域（支持矩形/圆形/多边形、材质贴图）
- **热力图**：在地图上展示清扫频率热力图
- **DP 指令查询**：查找扫地机 DP Code 的常量名、用途和下发方式
- **P2P 数据通道**：useP2PDataStream 的使用、数据流配置和调试
- **不适用**：iRobot/Roborock 等第三方扫地机 SDK、Google/Mapbox 地图、通用 MQTT 协议、涂鸦 IPC 摄像头面板、与扫地机面板无关的算法

## 搭配使用 {#usage}

### 配合技能

- **raycommondevelopskill**：Ray.js 小程序通用开发（框架、生命周期、API）
- **smartuiskill**：smart-ui 组件库（表单、反馈、导航等 UI 组件）
- **clix-tool**：clix CLI 工具（图片压缩、知识库查询、小程序发布）

### 前置依赖

- Ray.js 开发环境（`@ray-js/cli`）
- 涂鸦开发者账号和设备调试权限
- 了解基本的 React + TypeScript 开发

### 如何查找信息

当开发者提出问题时，按以下策略查找答案：

#### 第一步：识别协议类型

开发者通常不会主动说明自己用的是哪种协议。如果问题涉及协议或指令下发，先检查开发者的项目代码来判断协议类型：

**点阵格式协议（raw 类型）的特征：**
- 使用了 `command_trans` DP 下发指令
- 调用了 `encodeXxx0x{code}()` 格式的编码函数
- 处理十六进制字节流数据

**结构化协议的特征：**
- 使用了 MQTT 指令 hooks（`useZoneClean`、`useRoomClean`、`useForbiddenZone` 等）
- 数据格式是 JSON（含 `reqType`、`taskId`、`version` 等字段）
- 使用了 `useMqttProtocol` 或 `MqttProvider`

注意：`@ray-js/robot-protocol` 和 `@ray-js/robot-data-stream` 两种协议的工程都会引入，不能作为区分依据。关键看实际调用的 API：用 `command_trans` + `encode0x` 就是点阵格式，用 MQTT hooks 就是结构化协议。

#### 地图组件相关（config/方法/回调/类型/props/RobotMap）
用 Grep 搜索 `docs/references/map-sdk/` 下的文档：
- 配置相关 → `docs/references/map-sdk/reference/config.md`
- 方法相关 → `docs/references/map-sdk/reference/methods.md`
- 回调事件 → `docs/references/map-sdk/reference/callbacks.md`
- 运行时配置 → `docs/references/map-sdk/reference/runtime.md`
- 数据格式 → `docs/references/map-sdk/reference/data.md`
- 类型定义 → `docs/references/map-sdk/reference/types.md`
- 工具函数 → `docs/references/map-sdk/reference/utils.md`
- 入门指南 → `docs/references/map-sdk/guide/getting-started.md`
- 最佳实践 → `docs/references/map-sdk/guide/advanced-usage.md`

#### 点阵格式协议相关（raw 类型/hex/encode/decode/0x指令码/commandTrans）
用 Grep 搜索 `docs/references/protocol/` 下的文档：
- 指令编解码 → `docs/references/protocol/reference/commands.md`
- 地图解码 → `docs/references/protocol/reference/map-decode.md`
- 路径解码 → `docs/references/protocol/reference/path-decode.md`
- 类型定义 → `docs/references/protocol/reference/types.md`
- 工具函数 → `docs/references/protocol/reference/utils.md`
- 入门指南 → `docs/references/protocol/guide/getting-started.md`

#### 结构化协议相关（MQTT/JSON/useXxxClean hooks）
用 Grep 搜索 `docs/references/data-stream/` 下的文档：
- MQTT Hooks → `docs/references/data-stream/reference/mqtt-hooks.md`
- 消息格式 → `docs/references/data-stream/reference/message-format.md`
- 入门指南 → `docs/references/data-stream/guide/getting-started.md`

#### P2P 数据通道（useP2PDataStream/数据连接/P2P）
P2P 是跨协议的公共能力，用 Grep 搜索：
- P2P 数据流 → `docs/references/data-stream/reference/p2p-stream.md`
- useP2PDataStream 详解 → `docs/references/data-stream/useP2PDataStream.md`

#### 端到端功能实现（"怎么实现选区清扫"、"禁区编辑怎么做"）
读取 `docs/feature-guides.md`，它提供功能到跨库 API 的映射，帮助你知道该去哪些 reference 文件查找具体的 API 信息。

## 注意事项 {#tip}

- reference 文件可能很大（config.md 有 3500+ 行），用 Grep 定位关键词后用 Read（带 offset + limit）只读匹配区域的上下文（约 30-50 行），不要一次性读取整个文件
- 协议类型判断规则见上方"第一步：识别协议类型"，核心原则：看实际调用的 API，不看 import 的包
- docs/feature-guides.md 提供的是功能到 API 的映射索引，不是完整实现文档；找到对应 API 后必须去 docs/references/ 下的源文件查参数、类型和用法细节
- 开发者的问题可能跨越多个库（如选区清扫同时涉及地图组件回调、协议编码、DP 下发），回答时需要串联多个 reference 文件，不要只回答单个库的部分
