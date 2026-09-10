# 路径解码 API

本页介绍解码涂鸦扫地机路径数据的全部 API。路径数据记录机器人的运动轨迹，
以十六进制字符串形式传输，支持 LZ4 压缩。

## 完整解码

### `decodePath(pathStr)`

一次性解码路径字符串，返回帧头和路径点数组。

```ts
import { decodePath } from '@ray-js/robot-protocol'

const pathData = decodePath(pathHexString)
console.log(pathData.header.count) // 路径点数量
pathData.points.forEach(point => {
  console.log(point.x, point.y, point.type)
})
```

**参数**

| 参数      | 类型     | 必填 | 说明               |
| --------- | -------- | ---- | ------------------ |
| `pathStr` | `string` | 是   | 路径十六进制字符串 |

**返回值**: `PathData`

| 字段     | 类型          | 说明           |
| -------- | ------------- | -------------- |
| `header` | `PathHeader`  | 路径帧头信息   |
| `points` | `PathPoint[]` | 路径坐标点数组 |

---

## 帧头解码

### `decodePathHeader(pathStr)`

解析路径帧头，提取元信息。帧头固定为 13 字节（26 个十六进制字符）。

**参数**

| 参数      | 类型     | 必填 | 说明               |
| --------- | -------- | ---- | ------------------ |
| `pathStr` | `string` | 是   | 路径十六进制字符串 |

**返回值**: `PathHeader`

`PathHeader` 字段说明：

| 字段                      | 类型     | 偏移（字节） | 说明                                         |
| ------------------------- | -------- | ------------ | -------------------------------------------- |
| `version`                 | `number` | 0            | 路径协议版本                                 |
| `pathId`                  | `number` | 1–2          | 路径 ID                                      |
| `initFlag`                | `number` | 3            | 初始化标志（`0x00` 正常，`0x01` 从零初始化） |
| `type`                    | `number` | 4            | 路径类型                                     |
| `count`                   | `number` | 5–7          | 路径点数量                                   |
| `direction`               | `number` | 8–9          | 方向                                         |
| `dataLengthAfterCompress` | `number` | 10–11        | LZ4 压缩后数据长度，`0` 表示未压缩           |

---

## 点数据解码

### `decodePathData(pathStr, pathHeader)`

解码路径点数组，自动处理 LZ4 解压缩。

**参数**

| 参数         | 类型         | 必填 | 说明               |
| ------------ | ------------ | ---- | ------------------ |
| `pathStr`    | `string`     | 是   | 路径十六进制字符串 |
| `pathHeader` | `PathHeader` | 是   | 已解析的路径帧头   |

**返回值**: `PathPoint[]`

---

## 路径点格式

每个路径点由 4 字节（8 个十六进制字符）编码：

```
[X 高字节] [X 低字节] [Y 高字节] [Y 低字节]
```

坐标的最低位用于编码路径点类型：

| X 最低位 | Y 最低位 | 类型            | 说明                   |
| -------- | -------- | --------------- | ---------------------- |
| `0`      | `0`      | `'common'`      | 普通清扫轨迹点         |
| `0`      | `1`      | `'mop'`         | 拖地轨迹点             |
| `1`      | `0`      | `'transitions'` | 过渡路径点（抬起换位） |
| `1`      | `1`      | `'charge'`      | 充电返回路径点         |

`PathPoint` 字段说明：

| 字段   | 类型                                             | 说明       |
| ------ | ------------------------------------------------ | ---------- |
| `x`    | `number`                                         | X 坐标     |
| `y`    | `number`                                         | Y 坐标     |
| `type` | `'common' \| 'charge' \| 'transitions' \| 'mop'` | 路径点类型 |

---

## 坐标缩放

路径坐标通过 `mapScale` 参数进行缩放，与地图坐标系保持一致。缩放公式为：

```
actualCoord = storedValue / mapScale
```

默认 `mapScale` 为 `1`，即存储值等于实际坐标值。
