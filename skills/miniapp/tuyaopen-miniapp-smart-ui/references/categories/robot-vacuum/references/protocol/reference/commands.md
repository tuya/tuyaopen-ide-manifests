# 指令参考

本页列出了 `@ray-js/robot-protocol` 提供的全部指令编解码函数。指令按功能分组，
每个指令组包含一个编码函数（App → 机器人）和一个解码函数（机器人 → App）。

所有函数均通过包的主入口导出：

```ts
import { encodeVirtualWall0x12, decodeVirtualWall0x13, ... } from '@ray-js/robot-protocol'
```

## 标准特性指令（帧头 `aa`）

### 虚拟墙 v1（0x12 / 0x13）

在地图上设置线段型虚拟墙，禁止机器人越过。

#### `encodeVirtualWall0x12(params)`

| 参数       | 类型        | 必填 | 说明                               |
| ---------- | ----------- | ---- | ---------------------------------- |
| `walls`    | `Point[][]` | 是   | 虚拟墙端点数组，每条墙由两个点组成 |
| `origin`   | `Point`     | 否   | 地图原点坐标，默认 `{x:0, y:0}`    |
| `mapScale` | `number`    | 否   | 坐标缩放系数                       |
| `version`  | `number`    | 否   | 协议版本（`0` 或 `1`）             |

**返回值**: `string` — 编码后的十六进制指令字符串

#### `decodeVirtualWall0x13(params)`

| 参数       | 类型     | 必填 | 说明                     |
| ---------- | -------- | ---- | ------------------------ |
| `command`  | `string` | 是   | 设备返回的十六进制字符串 |
| `mapScale` | `number` | 否   | 坐标缩放系数             |
| `version`  | `number` | 否   | 协议版本                 |

**返回值**: `Point[][] | null` — 虚拟墙端点数组，解码失败时返回 `null`

---

### 虚拟墙 v2（0x48 / 0x49）

虚拟墙的扩展版本，支持更多参数。函数签名与 v1 相同：

- `encodeVirtualWall0x48(params)` — 参数同 `encodeVirtualWall0x12`
- `decodeVirtualWall0x49(params)` — 参数同 `decodeVirtualWall0x13`

---

### 虚拟区域（0x1a / 0x1b，0x38 / 0x39）

虚拟区域是矩形或多边形禁区，支持"禁扫"、"禁拖"或"全禁"模式。

#### `encodeVirtualArea0x38(params)`

| 参数              | 类型            | 必填 | 说明                            |
| ----------------- | --------------- | ---- | ------------------------------- |
| `protocolVersion` | `1 \| 2`        | 是   | 协议版本（v2 支持多边形和命名） |
| `virtualAreas`    | `VirtualArea[]` | 是   | 虚拟区域数组                    |
| `origin`          | `Point`         | 否   | 地图原点                        |
| `mapScale`        | `number`        | 否   | 坐标缩放系数                    |
| `version`         | `number`        | 否   | 帧协议版本                      |

`VirtualArea` 对象：

| 字段     | 类型            | 说明                                  |
| -------- | --------------- | ------------------------------------- |
| `points` | `Point[]`       | 区域顶点，矩形为 4 个点               |
| `mode`   | `ForbiddenType` | `0x00` 全禁、`0x01` 禁扫、`0x02` 禁拖 |
| `name`   | `string`        | 区域名称（仅 v2）                     |

**返回值**: `string`

#### `decodeVirtualArea0x39(params)`

| 参数       | 类型     | 必填 | 说明         |
| ---------- | -------- | ---- | ------------ |
| `command`  | `string` | 是   | 设备数据     |
| `mapScale` | `number` | 否   | 坐标缩放系数 |
| `version`  | `number` | 否   | 帧协议版本   |

**返回值**: `{ protocolVersion: number, virtualAreas: VirtualArea[] } | null`

---

### 房间清扫 v1（0x14 / 0x15）

指定房间 ID 和清扫次数进行房间清扫。

#### `encodeRoomClean0x14(params)`

| 参数         | 类型       | 必填 | 说明                                       |
| ------------ | ---------- | ---- | ------------------------------------------ |
| `cleanTimes` | `number`   | 是   | 清扫次数                                   |
| `roomHexIds` | `string[]` | 否   | 房间十六进制 ID 数组                       |
| `roomIds`    | `number[]` | 否   | 房间数字 ID 数组（与 `roomHexIds` 二选一） |
| `mapVersion` | `number`   | 否   | 地图版本                                   |
| `version`    | `number`   | 否   | 帧协议版本                                 |

**返回值**: `string`

#### `decodeRoomClean0x15(params)`

**返回值**: `{ cleanTimes: number, roomIds: number[], roomHexIds: string[] } | null`

---

### 房间清扫 v2（0x56 / 0x57）

支持按房间单独设置清扫参数。

#### `encodeRoomClean0x56(params)`

| 参数         | 类型     | 必填 | 说明         |
| ------------ | -------- | ---- | ------------ |
| `rooms`      | `Room[]` | 是   | 房间配置数组 |
| `mapVersion` | `number` | 否   | 地图版本     |
| `version`    | `number` | 否   | 帧协议版本   |

`Room` 对象：

| 字段         | 类型      | 说明                                  |
| ------------ | --------- | ------------------------------------- |
| `roomHexId`  | `string`  | 房间十六进制 ID（与 `roomId` 二选一） |
| `roomId`     | `number`  | 房间数字 ID                           |
| `cleanTimes` | `number`  | 清扫次数                              |
| `yMop`       | `yMop`    | 拖布模式：`0x00`、`0x01`、`0x03`      |
| `suction`    | `Suction` | 吸力级别（`0x00`–`0x04`）             |
| `cistern`    | `Cistern` | 水量（`0x00`–`0x03`）                 |

**返回值**: `string`

#### `decodeRoomClean0x57(params)`

**返回值**: `Room[] | null`

---

### 定点清扫 v1（0x16 / 0x17）

指定单个坐标点进行定点清扫。

#### `encodeSpotClean0x16(params)`

| 参数       | 类型     | 必填 | 说明         |
| ---------- | -------- | ---- | ------------ |
| `point`    | `Point`  | 是   | 清扫目标坐标 |
| `origin`   | `Point`  | 否   | 地图原点     |
| `mapScale` | `number` | 否   | 坐标缩放系数 |
| `version`  | `number` | 否   | 帧协议版本   |

**返回值**: `string`

#### `decodeSpotClean0x17(params)`

**返回值**: `{ point: Point } | null`

---

### 定点清扫 v2（0x3e / 0x3f）

支持多个清扫点及清扫参数设置。

#### `encodeSpotClean0x3e(params)`

| 参数              | 类型        | 必填 | 说明           |
| ----------------- | ----------- | ---- | -------------- |
| `protocolVersion` | `1 \| 2`    | 是   | 子协议版本     |
| `points`          | `Point[]`   | 是   | 清扫坐标点数组 |
| `cleanMode`       | `CleanMode` | 否   | 清扫模式       |
| `suction`         | `Suction`   | 否   | 吸力级别       |
| `cistern`         | `Cistern`   | 否   | 水量           |
| `cleanTimes`      | `number`    | 否   | 清扫次数       |
| `origin`          | `Point`     | 否   | 地图原点       |
| `mapScale`        | `number`    | 否   | 坐标缩放系数   |
| `version`         | `number`    | 否   | 帧协议版本     |

**返回值**: `string`

#### `decodeSpotClean0x3f(params)`

**返回值**: `{ protocolVersion, points, cleanMode?, suction?, cistern?, cleanTimes? } | null`

---

### 区域清扫（0x28 / 0x29）

在指定矩形区域内进行清扫。

#### `encodeZoneClean0x28(params)`

| 参数         | 类型     | 必填 | 说明         |
| ------------ | -------- | ---- | ------------ |
| `zones`      | `Zone[]` | 是   | 清扫区域数组 |
| `cleanTimes` | `number` | 否   | 清扫次数     |
| `origin`     | `Point`  | 否   | 地图原点     |
| `mapScale`   | `number` | 否   | 坐标缩放系数 |
| `version`    | `number` | 否   | 帧协议版本   |

`Zone` 对象中的 `points` 字段包含区域的四个角点坐标。

**返回值**: `string`

#### `decodeZoneClean0x29(params)`

**返回值**: `{ zones: Zone[], cleanTimes?: number } | null`

---

### 房间分割（0x1c / 0x1d）

将一个房间按指定分割线划分为两个房间。

#### `encodePartitionDivision0x1c(params)`

| 参数       | 类型      | 必填 | 说明            |
| ---------- | --------- | ---- | --------------- |
| `roomId`   | `number`  | 是   | 要分割的房间 ID |
| `points`   | `Point[]` | 是   | 分割线端点      |
| `origin`   | `Point`   | 否   | 地图原点        |
| `mapScale` | `number`  | 否   | 坐标缩放系数    |
| `version`  | `number`  | 否   | 帧协议版本      |

**返回值**: `string`

#### `decodePartitionDivision0x1d(params)`

**返回值**: `{ ret: number, success: boolean, roomId: number, points: Point[] } | null`

---

### 房间合并（0x1e / 0x1f）

将两个相邻房间合并为一个房间。

#### `encodePartitionMerge0x1e(params)`

| 参数      | 类型       | 必填 | 说明                |
| --------- | ---------- | ---- | ------------------- |
| `roomIds` | `number[]` | 是   | 要合并的两个房间 ID |
| `version` | `number`   | 否   | 帧协议版本          |

**返回值**: `string`

#### `decodePartitionMerge0x1f(params)`

**返回值**: `{ ret: number, success: boolean } | null`

---

### 设置房间名称（0x24 / 0x25）

#### `encodeSetRoomName0x24(params)`

| 参数         | 类型     | 必填 | 说明                     |
| ------------ | -------- | ---- | ------------------------ |
| `rooms`      | `Room[]` | 是   | 包含房间 ID 和名称的数组 |
| `mapVersion` | `number` | 否   | 地图版本                 |
| `version`    | `number` | 否   | 帧协议版本               |

**返回值**: `string`

#### `decodeSetRoomName0x25(params)`

**返回值**: `Room[] | null`

---

### 设置房间属性 v1（0x22 / 0x23）

设置房间的清扫参数，包括吸力、水量等。

#### `encodeSetRoomProperty0x22(params)`

| 参数         | 类型             | 必填 | 说明         |
| ------------ | ---------------- | ---- | ------------ |
| `rooms`      | `RoomProperty[]` | 是   | 房间属性数组 |
| `mapVersion` | `number`         | 否   | 地图版本     |
| `version`    | `number`         | 否   | 帧协议版本   |

**返回值**: `string`

#### `decodeSetRoomProperty0x23(params)`

**返回值**: `RoomProperty[] | null`

---

### 设置房间属性 v2（0x58 / 0x59）

扩展版房间属性设置，函数签名与 v1 相同：

- `encodeSetRoomProperty0x58(params)`
- `decodeSetRoomProperty0x59(params)`

---

### 清扫顺序（0x26 / 0x27）

设置或查询房间的清扫顺序。

#### `encodeRoomOrder0x26(params)`

| 参数         | 类型       | 必填 | 说明                    |
| ------------ | ---------- | ---- | ----------------------- |
| `roomIdHexs` | `string[]` | 是   | 按清扫顺序排列的房间 ID |
| `mapVersion` | `number`   | 是   | 地图版本                |
| `version`    | `number`   | 否   | 帧协议版本              |

**返回值**: `string`

#### `requestRoomOrder0x26(params)`

发送查询房间顺序请求（不带数据）。

**返回值**: `string`

#### `decodeRoomOrder0x27(params)`

**返回值**: `number[] | null` — 按顺序排列的房间 ID 数组

---

### 设置房间地板材质（0x52 / 0x53）

#### `encodeSetRoomFloorMaterial0x52(params)`

**返回值**: `string`

#### `decodeSetRoomFloorMaterial0x53(params)`

**返回值**: 房间地板材质信息，或 `null`

---

### 勿扰模式 v1（0x32 / 0x33）

旧版勿扰时间段设置，不含时区。

#### `encodeDoNotDisturb0x32(params)` / `decodeDoNotDisturb0x33(params)`

---

### 勿扰模式 v2（0x40 / 0x41）

#### `encodeDoNotDisturb0x40(params)`

| 参数          | 类型      | 必填 | 说明                                      |
| ------------- | --------- | ---- | ----------------------------------------- |
| `enable`      | `boolean` | 是   | 是否开启勿扰模式                          |
| `startHour`   | `number`  | 是   | 开始时（0–23）                            |
| `startMinute` | `number`  | 是   | 开始分（0–59）                            |
| `endHour`     | `number`  | 是   | 结束时（0–23）                            |
| `endMinute`   | `number`  | 是   | 结束分（0–59）                            |
| `timeZone`    | `string`  | 否   | 时区偏移（如 `+08:00`），默认读取系统时区 |
| `version`     | `number`  | 否   | 帧协议版本                                |

**返回值**: `string`

#### `decodeDoNotDisturb0x41(params)`

**返回值**: `{ enable, timeZone, startHour, startMinute, endHour, endMinute } | null`

---

### 定时任务 v1（0x30 / 0x31）

旧版定时清扫任务。

#### `encodeDeviceTimer0x30(params)` / `decodeDeviceTimer0x31(params)`

---

### 定时任务 v2（0x44 / 0x45）

#### `encodeDeviceTimer0x44(params)`

| 参数      | 类型          | 必填 | 说明         |
| --------- | ------------- | ---- | ------------ |
| `list`    | `TimerData[]` | 是   | 定时任务列表 |
| `number`  | `number`      | 是   | 任务总数     |
| `version` | `number`      | 否   | 帧协议版本   |

`TimerData` 字段说明：

| 字段            | 类型        | 说明                             |
| --------------- | ----------- | -------------------------------- |
| `effectiveness` | `number`    | 是否生效（`1` 生效，`0` 无效）   |
| `week`          | `number[]`  | 重复星期（0=周日，1–6=周一至六） |
| `time`          | `string`    | 执行时间，格式 `HH:MM`           |
| `roomIds`       | `number[]`  | 清扫的房间 ID 列表               |
| `cleanMode`     | `CleanMode` | 清扫模式                         |
| `fanLevel`      | `Suction`   | 吸力级别                         |
| `waterLevel`    | `Cistern`   | 水量                             |
| `sweepCount`    | `number`    | 清扫次数                         |

**返回值**: `string`

#### `decodeDeviceTimer0x45(params)`

**返回值**: `{ number: number, timeZone: string, list: TimerData[] }`

---

### 重置地图（0x42）

#### `encodeResetMap0x42(params)`

| 参数      | 类型     | 必填 | 说明       |
| --------- | -------- | ---- | ---------- |
| `version` | `number` | 否   | 帧协议版本 |

**返回值**: `string`

---

### 快速建图（0x3c）

#### `encodeQuickMap0x3c(params)`

| 参数      | 类型     | 必填 | 说明       |
| --------- | -------- | ---- | ---------- |
| `version` | `number` | 否   | 帧协议版本 |

**返回值**: `string`

---

### AI 物体识别（0x37）

#### `requestAIObject0x37(params)` — 请求 AI 识别

**返回值**: `string`

#### `decodeAIObject0x37(params)` — 解码识别结果

**返回值**: `AIObject[]` — 包含坐标和物体类型的数组

---

## 扩展特性指令（帧头 `ab`）

### 保存地图（0x2a / 0x2b）

#### `encodeSaveMap0x2a(saveSpace?)`

| 参数        | 类型     | 必填 | 说明                 |
| ----------- | -------- | ---- | -------------------- |
| `saveSpace` | `number` | 否   | 保存位置（默认 `1`） |

**返回值**: `string`

#### `decodeSaveMap0x2b(params)`

**返回值**: `{ ret: number, success: boolean } | null`

---

### 删除地图（0x2c / 0x2d）

#### `encodeDeleteMap0x2c(mapId?)`

| 参数    | 类型     | 必填 | 说明            |
| ------- | -------- | ---- | --------------- |
| `mapId` | `number` | 否   | 要删除的地图 ID |

**返回值**: `string`

#### `decodeDeleteMap0x2d(params)`

**返回值**: `{ ret: number, success: boolean } | null`

---

### 切换地图（0x2e / 0x2f）

#### `encodeUseMap0x2e(mapId?)`

| 参数    | 类型     | 必填 | 说明            |
| ------- | -------- | ---- | --------------- |
| `mapId` | `number` | 否   | 要使用的地图 ID |

**返回值**: `string`

#### `decodeUseMap0x2f(params)`

**返回值**: `{ ret: number, success: boolean } | null`

---

### 语音（0x34 / 0x35）

#### `encodeVoice0x34(params)`

**返回值**: `string`

#### `decodeVoice0x35(params)`

**返回值**: `{ ret: number, success: boolean } | null`
