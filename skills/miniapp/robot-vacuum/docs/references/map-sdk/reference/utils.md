# 工具方法

了解 RobotMap 提供的工具方法。

## decodeRoomProperties

解析点阵协议的地图房间数据并转换为 `RobotMap` 所需的格式。

**类型**

```typescript
function decodeRoomProperties(
  map: string,
  reservedStrHandler?: (reservedStr: string) => Partial<RoomProperty>,
): RoomProperty[]
```

**参数**

- `map`: 点阵协议的地图数据
- `reservedStrHandler`: 处理预留字段的函数，返回的对象会被合并到 `RoomProperty` 数据中

**返回值**

- [`RoomProperty[]`](/reference/types#roomproperty): 转换后的房间属性数组

**示例**

```tsx
import { decodeRoomProperties } from '@ray-js/robot-map'

function MapPage() {
  const map = 'your_map_data_string'

  const roomProperties = decodeRoomProperties(map)

  return <RobotMap roomProperties={roomProperties} />
}
```

## offsetPointsToAvoidOverlap

对点位数组进行偏移，避免与已存在的点位数组重叠。

**类型**

```typescript
function offsetPointsToAvoidOverlap(
  points: Point[],
  existingPointsArray: Point[][],
  maxAttempts?: number,
): Point[]
```

**参数**

- `points`: 需要偏移的点位数组
- `existingPointsArray`: 已存在的点位数组
- `maxAttempts`: 最大尝试次数，默认20次（最多偏移100个单位）

**返回值**

- `Point[]`: 偏移后的点位数组
