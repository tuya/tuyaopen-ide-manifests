# 工具函数参考

本页列出了 `@ray-js/robot-protocol` 导出的工具函数，分为三类：帧构建/解析、
几何算法、以及坐标与进制转换。

```ts
import {
  encodeStandardFeatureCommand,
  circleIntersectRect,
  getHexXYFromXY,
  // ...
} from '@ray-js/robot-protocol'
```

## 帧构建与解析

这组函数是所有指令编解码函数的底层实现，适合需要自定义指令的开发者直接使用。

### `encodeStandardFeatureCommand(cmd, data, version)`

构建标准特性帧（`aa` 头）。

| 参数      | 类型         | 说明                         |
| --------- | ------------ | ---------------------------- |
| `cmd`     | `string`     | 指令码十六进制字符串（2 位） |
| `data`    | `string`     | 数据段十六进制字符串         |
| `version` | `'0' \| '1'` | 协议版本                     |

**返回值**: `string` — 完整帧字符串

---

### `encodeExtendFeatureCommand(cmd, data)`

构建扩展特性帧（`ab` 头）。

| 参数   | 类型     | 说明                         |
| ------ | -------- | ---------------------------- |
| `cmd`  | `string` | 指令码十六进制字符串（2 位） |
| `data` | `string` | 数据段十六进制字符串         |

**返回值**: `string` — 完整帧字符串

---

### `decodeStandardFeatureCommand(command, cmd, version?)`

从标准特性帧中提取数据段，并校验指令码是否匹配。

| 参数      | 类型         | 必填 | 说明                 |
| --------- | ------------ | ---- | -------------------- |
| `command` | `string`     | 是   | 完整帧字符串         |
| `cmd`     | `string`     | 是   | 期望的指令码         |
| `version` | `'0' \| '1'` | 否   | 协议版本，默认 `'1'` |

**返回值**: `{ valid: boolean, dataLength?: number, cmdStr?: string, dataStr?: string }`

- `valid: false` 表示指令码不匹配或数据长度校验失败
- `dataStr` 为去除指令码后的纯数据段

---

### `getFeatureProtocolVersion(command)`

从帧字符串中读取协议版本字段。

**返回值**: `'0' | '1'`

---

### `getCmdStrFromStandardFeatureCommand(command, version?)`

从帧字符串中提取指令码。

**返回值**: `string` — 2 位十六进制指令码

---

### `convertDataArrayToDataStr(dataArray)`

将混合类型数组转换为十六进制数据字符串，方便组装数据段。

数组项支持三种形式：

| 类型               | 说明                                  |
| ------------------ | ------------------------------------- |
| `number`           | 按 1 字节编码                         |
| `string`           | 直接拼接（已是十六进制字符串）        |
| `{ value, byte? }` | 按 `byte` 指定字节数编码，默认 1 字节 |

```ts
convertDataArrayToDataStr([
  { value: 3, byte: 2 }, // → "0003"
  255, // → "ff"
  'ab12', // → "ab12"
])
// → "0003ffab12"
```

**返回值**: `string`

---

## 几何算法

这组函数用于地图渲染场景中的碰撞检测与区域关系判断。

### `pointToLine(x1, y1, x2, y2, x0, y0)`

计算点 `(x0, y0)` 到线段 `(x1, y1)–(x2, y2)` 的最短距离。

**返回值**: `number`

---

### `isAdjacent(list1, list2, threshold?)`

判断两组像素点是否相邻（任意两点距离小于阈值）。

| 参数        | 类型      | 必填 | 说明               |
| ----------- | --------- | ---- | ------------------ |
| `list1`     | `Point[]` | 是   | 第一组点           |
| `list2`     | `Point[]` | 是   | 第二组点           |
| `threshold` | `number`  | 否   | 距离阈值，默认 `5` |

**返回值**: `boolean`

---

### `isBorder(points1, points2)`

判断两个多边形区域是否接壤（点到边距离小于 5）。与 `isAdjacent` 的区别在于
此函数计算的是点到线段的距离，更适用于判断房间边界是否共边。

**返回值**: `boolean`

---

### `circleIntersectRect(circle, rect)`

判断圆是否与矩形相交。

| 参数     | 类型                           | 说明                               |
| -------- | ------------------------------ | ---------------------------------- |
| `circle` | `{ x, y, radius }`             | 圆心坐标和半径                     |
| `rect`   | `[Point, Point, Point, Point]` | 矩形的四个顶点（顺序连接成四边形） |

**返回值**: `boolean`

---

### `lineIntersectCircle(circle, line)`

判断线段是否与圆相交。

| 参数     | 类型               | 说明           |
| -------- | ------------------ | -------------- |
| `circle` | `{ x, y, radius }` | 圆心坐标和半径 |
| `line`   | `[Point, Point]`   | 线段两端点     |

**返回值**: `boolean`

---

## 坐标与进制转换

### `getHexXYFromXY(point, origin, mapScale?)`

将世界坐标（像素坐标系）转换为协议所需的十六进制 X/Y 字节，
编码时会应用原点偏移和 Y 轴翻转。

| 参数       | 类型     | 必填 | 说明                   |
| ---------- | -------- | ---- | ---------------------- |
| `point`    | `Point`  | 是   | 目标坐标 `{x, y}`      |
| `origin`   | `Point`  | 是   | 地图原点坐标           |
| `mapScale` | `number` | 否   | 坐标缩放系数，默认 `1` |

**返回值**: `{ hexX: string, hexY: string }` — 各 4 位十六进制字符串

---

### `transformXY(mapScale, value)`

将设备坐标值（含符号处理）缩放为实际坐标。内部依次调用
`dealPL`（处理负数溢出）和 `scaleNumber`（缩放）。

**返回值**: `number`

---

### `makeXYArray(hexStr, mapScale?)`

将 8 字节（16 个十六进制字符）的坐标字符串解析为 `{x, y}` 坐标，
用于处理老版本设备发送的 8 位坐标格式。

**返回值**: `{ x: number, y: number }`

---

### `numToHexString(num, padding?)`

将十进制数转为指定位数的十六进制字符串。

| 参数      | 类型     | 说明               |
| --------- | -------- | ------------------ |
| `num`     | `number` | 待转换的十进制数   |
| `padding` | `number` | 输出位数，默认 `2` |

```ts
numToHexString(255) // → "ff"
numToHexString(255, 4) // → "00ff"
```

**返回值**: `string`

---

### `hexToUint8Array(hexString)`

高性能地将十六进制字符串转换为 `Uint8Array`。

**返回值**: `Uint8Array`

---

### `hexToUTF8(hex)`

将十六进制字符串解码为 UTF-8 字符串，自动过滤控制字符，兼容中文等多字节字符。

**返回值**: `string`

---

### `bytesToHexString(bytes)`

将字节数组转为十六进制字符串。

**返回值**: `string`

---

### `getTimezoneOffset()`

读取当前系统时区偏移，返回格式如 `+08:00` 或 `-05:00`，
供定时任务和勿扰模式的编码函数使用。

**返回值**: `string`

---

### `transformChargeXY(charge, origin)`

将充电桩的绝对坐标转换为相对于地图原点的坐标。
当 `chargeX <= 0 && chargeY <= 0` 时视为无效充电桩，返回 `null`。

| 参数     | 类型                                   | 说明           |
| -------- | -------------------------------------- | -------------- |
| `charge` | `{ chargeX: number, chargeY: number }` | 充电桩绝对坐标 |
| `origin` | `{ originX: number, originY: number }` | 地图原点坐标   |

**返回值**: `{ x: number, y: number } | null`
