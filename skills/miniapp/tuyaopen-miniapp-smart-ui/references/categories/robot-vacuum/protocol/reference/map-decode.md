# 地图解码 API

本页介绍解码涂鸦扫地机地图数据的全部 API。地图数据是一段十六进制字符串，
包含帧头元信息和像素点阵数据，支持 v0–v3 四个版本协议。

## 完整解码

### `decodeMap(mapStr, options?)`

一次性解码地图字符串，返回帧头和像素数据。这是最常用的入口函数。

```ts
import { decodeMap } from '@ray-js/robot-protocol'

const result = decodeMap(mapHexString, { pointsStructured: true })
if (result) {
  const { mapHeader, mapData } = result
}
```

**参数**

| 参数                       | 类型      | 必填 | 说明                                                       |
| -------------------------- | --------- | ---- | ---------------------------------------------------------- |
| `mapStr`                   | `string`  | 是   | 地图十六进制字符串                                         |
| `options.pointsStructured` | `boolean` | 否   | `true` 时返回 `Uint32Array` 结构，`false` 时返回点阵字符串 |

**返回值**: `{ mapHeader: MapHeader, mapData: MapData } | null`

---

## 帧头解码

### `decodeMapHeader(mapStr)`

解析地图帧头，提取地图元信息。帧头长度根据版本不同为 48 或 52 个十六进制字符。

```ts
import { decodeMapHeader } from '@ray-js/robot-protocol'

const header = decodeMapHeader(mapHexString)
console.log(header.mapWidth, header.mapHeight)
```

**参数**

| 参数     | 类型     | 必填 | 说明               |
| -------- | -------- | ---- | ------------------ |
| `mapStr` | `string` | 是   | 地图十六进制字符串 |

**返回值**: `MapHeader`

`MapHeader` 字段说明：

| 字段                       | 类型     | 说明                           |
| -------------------------- | -------- | ------------------------------ |
| `version`                  | `number` | 地图协议版本（0–3）            |
| `id`                       | `number` | 地图 ID                        |
| `mapStable`                | `number` | 地图稳定状态标志               |
| `mapWidth`                 | `number` | 地图宽度（像素）               |
| `mapHeight`                | `number` | 地图高度（像素）               |
| `originX`                  | `number` | 地图原点 X 坐标                |
| `originY`                  | `number` | 地图原点 Y 坐标                |
| `mapResolution`            | `number` | 地图分辨率（米/像素）          |
| `chargeX`                  | `number` | 充电桩 X 坐标                  |
| `chargeY`                  | `number` | 充电桩 Y 坐标                  |
| `chargeDirection`          | `number` | 充电桩朝向角度（仅 v3）        |
| `dataLengthBeforeCompress` | `number` | 压缩前数据长度（字节）         |
| `dataLengthAfterCompress`  | `number` | 压缩后数据长度，`0` 表示未压缩 |

---

## 像素数据解码

### `decodeMapData(mapStr, mapHeader, options?)`

解码地图像素点阵数据，自动处理 LZ4 解压缩。

**参数**

| 参数                       | 类型        | 必填 | 说明                       |
| -------------------------- | ----------- | ---- | -------------------------- |
| `mapStr`                   | `string`    | 是   | 地图十六进制字符串         |
| `mapHeader`                | `MapHeader` | 是   | 已解析的地图帧头           |
| `options.pointsStructured` | `boolean`   | 否   | 是否返回结构化 Uint32Array |

**返回值**: `MapData`

`MapData` 字段说明：

| 字段                  | 类型                  | 说明                                          |
| --------------------- | --------------------- | --------------------------------------------- |
| `rooms`               | `RoomDecoded[]`       | 房间信息数组（仅 v1+ 地图包含房间数据时有值） |
| `pointsStr`           | `string`              | 点阵字符串（`pointsStructured: false` 时）    |
| `parsedRasterMapData` | `ParsedRasterMapData` | 结构化像素数组（`pointsStructured: true` 时） |

`ParsedRasterMapData` 字段说明：

| 字段        | 类型          | 说明                      |
| ----------- | ------------- | ------------------------- |
| `obstacles` | `Uint32Array` | 障碍物像素索引数组        |
| `carpets`   | `Uint32Array` | 地毯像素索引数组（v2/v3） |
| `rooms`     | `Uint32Array` | 按房间 ID 分组的像素索引  |

---

## 像素编码规则

不同协议版本使用不同的像素编码方式。

### v0 版本

每字节编码 4 个像素（每像素 2 位）：

| 位模式 | 含义       |
| ------ | ---------- |
| `00`   | 可清扫区域 |
| `01`   | 物理障碍物 |
| `10`   | 未使用     |
| `11`   | 未知/背景  |

### v1 版本

每字节编码 1 个像素：

| 位           | 含义            |
| ------------ | --------------- |
| 高 6 位      | 房间 ID（0–63） |
| 低 2 位 `00` | 可清扫区域      |
| 低 2 位 `01` | 障碍物          |
| 低 2 位 `10` | 未知            |
| 低 2 位 `11` | 背景            |

### v2 / v3 版本

每字节编码 1 个像素：

| 位            | 含义            |
| ------------- | --------------- |
| 高 5 位       | 房间 ID（0–31） |
| 低 3 位 `000` | 背景            |
| 低 3 位 `001` | 障碍物          |
| 低 3 位 `010` | 地毯            |
| 低 3 位 `111` | 可清扫区域      |

房间 ID 28–31 映射为特殊值：

| ID  | 含义       |
| --- | ---------- |
| 28  | 无房间数据 |
| 29  | 房间间隙   |
| 30  | 障碍物房间 |
| 31  | 未知房间   |

---

## 房间数据解码

### `decodeMapRooms(mapRoomData, version)`

解析地图中附带的房间元数据（名称、清扫属性等）。

**参数**

| 参数          | 类型     | 必填 | 说明                   |
| ------------- | -------- | ---- | ---------------------- |
| `mapRoomData` | `string` | 是   | 房间数据十六进制字符串 |
| `version`     | `number` | 是   | 地图协议版本           |

**返回值**: `RoomDecoded[]`

`RoomDecoded` 字段说明：

| 字段             | 类型      | 说明              |
| ---------------- | --------- | ----------------- |
| `id`             | `number`  | 房间数字 ID       |
| `name`           | `string`  | 房间名称（UTF-8） |
| `order`          | `number`  | 清扫顺序          |
| `suction`        | `Suction` | 吸力级别          |
| `cistern`        | `Cistern` | 水量级别          |
| `mopTimes`       | `number`  | 拖地次数          |
| `sweepTimes`     | `number`  | 清扫次数          |
| `floorMaterial`  | `number`  | 地板材质类型      |
| `forbiddenFlags` | `number`  | 禁区标志位        |

---

## 结构化地图解码

### `decodeMapStructured(mapStr)`

将地图字符串从十六进制转换为 UTF-8 并解析为 JSON 结构。适用于已序列化为 JSON 的
高级地图格式。

**参数**

| 参数     | 类型     | 必填 | 说明               |
| -------- | -------- | ---- | ------------------ |
| `mapStr` | `string` | 是   | 地图十六进制字符串 |

**返回值**: `StructuredMapDataSource` — JSON 格式的地图数据，包含房间、障碍物、
自由区域等高级信息。

---

## 工具函数

### `getMapProtocolVersion(mapStr)`

快速读取地图协议版本号，无需完整解析。

**参数**

| 参数     | 类型     | 必填 | 说明               |
| -------- | -------- | ---- | ------------------ |
| `mapStr` | `string` | 是   | 地图十六进制字符串 |

**返回值**: `number` — 版本号（0–3）
