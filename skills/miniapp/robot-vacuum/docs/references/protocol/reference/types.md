# 类型定义参考

本页列出了 `@ray-js/robot-protocol` 导出的全部 TypeScript 类型定义。
这些类型均从包的主入口直接导出。

```ts
import type { Point, Zone, MapHeader, PathPoint, ... } from '@ray-js/robot-protocol'
```

## 基础几何类型

### `Point`

二维坐标点。

```ts
interface Point {
  x: number
  y: number
}
```

---

## 枚举与常量类型

### `CleanMode`

清扫模式。

| 值     | 说明             |
| ------ | ---------------- |
| `0x00` | 扫拖同步（默认） |
| `0x01` | 仅扫地           |
| `0x02` | 仅拖地           |
| `0x03` | 先扫后拖         |

### `Suction`

吸力级别。

| 值     | 说明 |
| ------ | ---- |
| `0x00` | 关闭 |
| `0x01` | 轻柔 |
| `0x02` | 标准 |
| `0x03` | 强劲 |
| `0x04` | 最强 |

### `Cistern`

水箱水量。

| 值     | 说明   |
| ------ | ------ |
| `0x00` | 关闭   |
| `0x01` | 低水量 |
| `0x02` | 中水量 |
| `0x03` | 高水量 |

### `yMop`

拖布模式。

| 值     | 说明       |
| ------ | ---------- |
| `0x00` | 普通拖地   |
| `0x01` | Y 字形拖地 |
| `0x03` | 其他模式   |

### `ShapeType`

区域形状类型。

| 值     | 说明   |
| ------ | ------ |
| `0x00` | 矩形   |
| `0x01` | 多边形 |

### `ForbiddenType`

虚拟区域的禁区类型。

| 值     | 说明     |
| ------ | -------- |
| `0x00` | 全部禁止 |
| `0x01` | 禁止清扫 |
| `0x02` | 禁止拖地 |

### `SpecialRoomId`

特殊房间 ID 字符串常量。

| 值                | 说明                  |
| ----------------- | --------------------- |
| `'NO_ROOM_DATA'`  | 无房间数据            |
| `'ROOM_GAP'`      | 房间间隙              |
| `'OBSTACLE_ROOM'` | 障碍物区域            |
| `'UNKNOWN_ROOM'`  | 未知区域              |
| `'VERSION0_ROOM'` | v0 格式区域（无房间） |

---

## 地图相关类型

### `MapHeader`

地图帧头元信息。

```ts
interface MapHeader {
  version: number
  id: number
  mapStable: number
  mapWidth: number
  mapHeight: number
  originX: number
  originY: number
  mapResolution: number
  chargeX: number
  chargeY: number
  chargeDirection: number // 仅 v3
  dataLengthBeforeCompress: number
  dataLengthAfterCompress: number
}
```

### `RoomDecoded`

解码后的房间信息。

```ts
interface RoomDecoded {
  id: number
  name: string
  order: number
  suction: Suction
  cistern: Cistern
  mopTimes: number
  sweepTimes: number
  floorMaterial: number
  forbiddenFlags: number
}
```

### `ParsedRasterMapData`

解码后的像素点阵结构化数据（`pointsStructured: true` 时返回）。

```ts
interface ParsedRasterMapData {
  obstacles: Uint32Array
  carpets: Uint32Array
  rooms: Uint32Array
}
```

### `MapData`

完整地图数据，包含房间信息和像素数据。

```ts
interface MapData {
  rooms: RoomDecoded[]
  pointsStr: string // pointsStructured: false 时有值
  parsedRasterMapData: ParsedRasterMapData // pointsStructured: true 时有值
}
```

### `StructuredMapDataSource`

JSON 结构化地图数据（`decodeMapStructured` 的返回类型）。

```ts
interface StructuredMapDataSource {
  id: number
  status: number
  resolution: number
  size: { width: number; height: number }
  origin: Point
  charger: Point
  carpet: Point[]
  obstacles: Point[]
  freeAreas: Zone[]
  rooms: RoomDecoded[]
}
```

---

## 路径相关类型

### `PathHeader`

路径帧头元信息。

```ts
interface PathHeader {
  version: number
  pathId: number
  initFlag: number
  type: number
  count: number
  direction: number
  dataLengthAfterCompress: number
}
```

### `PathPoint`

路径轨迹点。

```ts
interface PathPoint {
  x: number
  y: number
  type: 'common' | 'charge' | 'transitions' | 'mop'
}
```

### `PathData`

完整路径数据。

```ts
interface PathData {
  header: PathHeader
  points: PathPoint[]
}
```

---

## 区域与清扫配置类型

### `Zone`

清扫区域。

```ts
interface Zone {
  points: Point[]
  name?: string
  cleanMode?: CleanMode
  suction?: Suction
  cistern?: Cistern
  order?: number
}
```

### `VirtualWall`

虚拟墙。

```ts
interface VirtualWall {
  points: Point[]
  mode: ForbiddenType
}
```

### `VirtualArea`

虚拟禁区。

```ts
interface VirtualArea {
  points: Point[]
  mode: ForbiddenType
  name?: string
}
```

### `RoomProperty`

房间清扫属性配置。

```ts
interface RoomProperty {
  roomHexId?: string
  roomId?: number
  cleanTimes: number
  yMop: yMop
  suction: Suction
  cistern: Cistern
  cleanMode?: CleanMode
}
```

---

## 定时任务类型

### `TimerData`

定时清扫任务配置。

```ts
interface TimerData {
  effectiveness: number // 1 = 生效，0 = 无效
  week: number[] // 重复星期，0=周日，1–6=周一至六
  time: string // 执行时间，格式 "HH:MM"
  roomIds: number[] // 清扫房间 ID 列表
  cleanMode: CleanMode
  fanLevel: Suction
  waterLevel: Cistern
  sweepCount: number
}
```

---

## AI 识别类型

### `AIObject`

AI 识别到的物体信息。

```ts
interface AIObject extends Point {
  type: number
}
```

### `AiPicInfo`

AI 图片识别结果。

```ts
interface AiPicInfo {
  id: number
  mapId: number
  position: Point
  object: number
  accuracy: number
  reserved: number
  xHex: string
  yHex: string
}
```

---

## 内部工具类型

### `DataArray`

用于 `convertDataArrayToDataStr` 的混合数组类型，可表示十六进制字节序列。

```ts
type DataArray = Array<{ value: number; byte?: number } | number | string>
```
