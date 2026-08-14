# 快速开始

`@ray-js/robot-protocol` 是一个用于涂鸦扫地机器人通信的协议编解码库。它提供了
将 App 指令编码为设备可读的十六进制字符串，以及将设备返回的十六进制数据解码为
结构化 JavaScript 对象的能力。

## 安装

```bash
npm install @ray-js/robot-protocol
# 或
yarn add @ray-js/robot-protocol
```

## 基本用法

下面的示例演示了如何编码一条虚拟墙指令，并解码设备的应答：

```ts
import { encodeVirtualWall0x12, decodeVirtualWall0x13 } from '@ray-js/robot-protocol'

// 编码：告诉机器人在指定坐标绘制虚拟墙
const command = encodeVirtualWall0x12({
  walls: [
    [
      { x: 100, y: 200 },
      { x: 300, y: 200 },
    ],
  ],
  origin: { x: 0, y: 0 },
  mapScale: 1,
})
console.log(command) // "aa01..."（十六进制字符串）

// 解码：解析设备返回的虚拟墙数据
const result = decodeVirtualWall0x13({
  command: 'aa01...',
  mapScale: 1,
})
console.log(result) // [[{ x: 100, y: 200 }, { x: 300, y: 200 }]]
```

## 帧格式说明

本库使用两种帧格式在 App 与设备之间传递数据。

### 标准特性帧（header: `aa`）

标准特性帧用于大多数常规指令（如虚拟墙、房间清扫、区域清扫等）。

```
[aa] [version] [length] [cmd] [data] [checksum]
  2      2       4–8       2    var       2       (十六进制字符数)
```

| 字段       | 长度（十六进制字符） | 说明                                        |
| ---------- | -------------------- | ------------------------------------------- |
| `aa`       | 2                    | 帧头，固定值                                |
| `version`  | 2                    | 协议版本：`01`（v1）或 `00`（v0）           |
| `length`   | 4（v1）或 2（v0）    | `cmd` + `data` 的字节长度                   |
| `cmd`      | 2                    | 指令码，参见[指令参考](/reference/commands) |
| `data`     | 可变                 | 指令携带的数据                              |
| `checksum` | 2                    | `cmd` + `data` 所有字节 XOR 后 mod 256      |

### 扩展特性帧（header: `ab`）

扩展特性帧用于多地图管理、语音等扩展功能。

```
[ab] [00] [length] [cmd] [data] [checksum]
  2    2      8       2    var       2       (十六进制字符数)
```

| 字段       | 长度（十六进制字符） | 说明                    |
| ---------- | -------------------- | ----------------------- |
| `ab`       | 2                    | 帧头，固定值            |
| `00`       | 2                    | 保留字段，固定为 `00`   |
| `length`   | 8                    | `cmd` + `data` 字节长度 |
| `cmd`      | 2                    | 扩展指令码              |
| `data`     | 可变                 | 指令携带的数据          |
| `checksum` | 2                    | 校验和                  |

### 坐标系说明

库中所有坐标均基于地图像素坐标系，使用 `mapScale` 参数控制缩放比例。

- **`mapScale`**: 坐标缩放系数，等于 `10^scale`。例如 `mapScale: 1` 时，
  存储值与像素值相等；`mapScale: 10` 时，存储值为实际坐标除以 10。
- **`origin`**: 地图原点坐标 `{x, y}`，用于将世界坐标转换为相对坐标。
- **Y 轴翻转**: 设备坐标系 Y 轴向下，显示时通常需要翻转。

## 地图解码

解码地图数据需要先解析帧头，再解码像素数据和房间信息：

```ts
import { decodeMap } from '@ray-js/robot-protocol'

const { mapHeader, mapData } = decodeMap(mapHexString, {
  pointsStructured: true,
})

console.log(mapHeader.mapWidth, mapHeader.mapHeight)
console.log(mapData.rooms) // 房间信息数组
console.log(mapData.parsedRasterMapData) // 像素数组（Uint32Array）
```

完整 API 参见[地图解码参考](/reference/map-decode)。

## 路径解码

```ts
import { decodePath } from '@ray-js/robot-protocol'

const pathData = decodePath(pathHexString)

console.log(pathData.header.count) // 路径点数量
console.log(pathData.points) // PathPoint[]
```

完整 API 参见[路径解码参考](/reference/path-decode)。
