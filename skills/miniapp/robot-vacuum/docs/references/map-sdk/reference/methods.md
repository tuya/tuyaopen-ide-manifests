# 地图方法

了解 RobotMap 提供的 API 方法。

## 使用示例

通过 `onMapReady` 回调获得 `MapApi` 实例，该实例包含所有可调用的地图方法。这些方法让你可以主动控制地图行为、查询数据和执行各种操作。

```tsx
import { MapApi } from '@ray-js/robot-map'

function MapPage() {
  const mapApi = useRef<MapApi>(null)

  const handleMapReady = (mapApi: MapApi) => {
    mapApi.current = mapApi
  }

  const handleResetMapView = () => {
    mapApi.current?.resetPanZoom()
  }

  const handleGetCleanZones = async () => {
    const zones = await mapApi.current?.getCleanZones()
  }

  return (
    <RobotMap
      onMapReady={handleMapReady}
      // ... 其他属性
    />
  )
}
```

::: tip
注意所有地图方法都是异步的Promise，需要使用 `await` 或 `then` 来获取结果。
:::

## isMapDrawn

地图是否已绘制完成。

**类型**:

```ts
readonly isMapDrawn: boolean
```

**返回值**: `Promise<boolean>`

**示例**:

```ts
const drawn = await mapApi.isMapDrawn
if (drawn) {
  // 地图已就绪，可以执行后续操作
}
```

## updateConfig()

动态更新静态配置。支持深度增量更新，配置变化会自动通知订阅的组件进行重绘。主要用于主题切换、颜色调整等场景。

**类型**:

```ts
function updateConfig(partialConfig: DeepPartial<AppConfig>): Promise<void>
```

**参数**:

- `partialConfig`: `DeepPartial<AppConfig>` - 部分配置对象，支持深度增量更新。

**返回值**: `Promise<void>`

**示例**:

```ts
// 切换背景颜色
await mapApi.updateConfig({
  global: { backgroundColor: '#1a1a1a' }
})

// 切换房间颜色主题
await mapApi.updateConfig({
  room: {
    colors: {
      active: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a'],
      inactive: ['#ffcccb', '#b4f8c8', '#a0e7e5', '#ffdab9'],
    }
  }
})
```

::: tip
通常情况下你不需要手动调用此方法。通过组件的 `config` prop 更新配置即可，组件会自动调用此方法。此方法适用于需要直接操作 `mapApi` 的场景。
:::

## updateRuntime()

动态更新运行时配置。

**类型**:

```ts
function updateRuntime(runtime: DeepPartialRuntimeConfig): Promise<void>
```

**参数**:

- `runtime`: `DeepPartialRuntimeConfig` - 要更新的运行时配置。

**返回值**: `Promise<void>`

**示例**:

```ts
// 显示房间选择模式
await mapApi.updateRuntime({
  enableRoomSelection: true,
  selectRoomIds: [1, 2, 3]
})
```

::: tip
通常情况下你不需要手动调用此方法。通过组件的 `runtime` prop 更新即可，组件会自动调用此方法。此方法适用于需要直接操作 `mapApi` 的场景。
:::

## getCustomCarpets()

获取当前地图上所有自定义地毯数据。

**类型**:

```ts
function getCustomCarpets(): Promise<CustomCarpetParam[]>
```

**返回值**: [`Promise<CustomCarpetParam[]>`](/reference/types#customcarpetparam)

## areRoomsAdjacent()

判断指定的房间是否相邻（连通）。

判定阈值由 `config.map.adjacencyThreshold` 配置决定。

**类型**:

```ts
function areRoomsAdjacent(roomIds: number[]): Promise<boolean>
```

**参数**:

- `roomIds`: `number[]` - 要检测的房间ID数组

**返回值**: [`Promise<boolean>`](/reference/types#boolean)

## getForbiddenSweepZones()

获取当前地图上所有禁扫区域数据。

**类型**:

```ts
function getForbiddenSweepZones(): Promise<ZoneParam[]>
```

**返回值**: [`Promise<ZoneParam[]>`](/reference/types#zoneparam)

## getForbiddenMopZones()

获取当前地图上所有禁拖区域数据。

**类型**:

```ts
function getForbiddenMopZones(): Promise<ZoneParam[]>
```

**返回值**: [`Promise<ZoneParam[]>`](/reference/types#zoneparam)

## getCleanZones()

获取当前地图上所有清扫区域数据。

**类型**:

```ts
function getCleanZones(): Promise<ZoneParam[]>
```

**返回值**: [`Promise<ZoneParam[]>`](/reference/types#zoneparam)

## getVirtualWalls()

获取当前地图上所有虚拟墙数据。

**类型**:

```ts
function getVirtualWalls(): Promise<VirtualWallParam[]>
```

**返回值**: [`Promise<VirtualWallParam[]>`](/reference/types#virtualwallparam)

## getSpots()

获取当前地图上所有定点清扫数据。

**类型**:

```ts
function getSpots(): Promise<SpotParam[]>
```

**返回值**: [`Promise<SpotParam[]>`](/reference/types#spotparam)

## getWayPoints()

获取当前地图上所有途径点数据。

**类型**:

```ts
function getWayPoints(): Promise<WayPointParam[]>
```

**返回值**: [`Promise<WayPointParam[]>`](/reference/types#waypointparam)

## getEffectiveDividerPoints()

获取分割线有效端点。

**类型**:

```ts
function getEffectiveDividerPoints(): Promise<Point[] | null>
```

**返回值**: [`Promise<Point[] | null>`](/reference/types#point) | `null`

## getDividerEndPoints()

获取分割线端点。

**类型**:

```ts
function getDividerEndPoints(): Promise<Point[] | null>
```

**返回值**: [`Point[]`](/reference/types#point) | `null`

## getViewportCenterPoint()

获取当前视口中心点坐标。

**类型**:

```ts
function getViewportCenterPoint(): Promise<Point | null>
```

**返回值**: [`Promise<Point[]>`](/reference/types#point) | `null`

## getMapCenterPoint()

获取地图中心点坐标。

**类型**:

```ts
function getMapCenterPoint(): Promise<Point | null>
```

**返回值**: [`Promise<Point[]>`](/reference/types#point) | `null`

## getWallPointsByViewportCenter()

基于视口中心生成虚拟墙端点坐标。

**类型**:

```ts
function getWallPointsByViewportCenter(options?: {
  width?: number
  direction?: Direction
  offsetX?: number
  offsetY?: number
}): Promise<Point[]>
```

**参数**:

- `options` - 配置选项
- `options.width`: `number` - 虚拟墙长度，单位米，默认使用配置中的最小宽度
- `options.direction`: [`Direction`](/reference/types#direction) - 虚拟墙方向，'horizontal' 或 'vertical'，默认为 'horizontal'
- `options.offsetX`: `number` - X方向像素偏移，支持负数，默认为 0
- `options.offsetY`: `number` - Y方向像素偏移，支持负数，默认为 0

**返回值**: [`Promise<Point[]>`](/reference/types#point)

## getForbiddenSweepZonePointsByViewportCenter()

基于视口中心生成禁扫区域顶点坐标。

**类型**:

```ts
function getForbiddenSweepZonePointsByViewportCenter(options?: {
  size?: number
  offsetX?: number
  offsetY?: number
}): Promise<Point[]>
```

**参数**:

- `options` - 配置选项
- `options.size`: `number` - 区域大小，单位米，默认使用配置中的最小尺寸
- `options.offsetX`: `number` - X方向像素偏移，支持负数，默认为 0
- `options.offsetY`: `number` - Y方向像素偏移，支持负数，默认为 0

**返回值**: [`Promise<Point[]>`](/reference/types#point)

## getForbiddenMopZonePointsByViewportCenter()

基于视口中心生成禁拖区域顶点坐标。

**类型**:

```ts
function getForbiddenMopZonePointsByViewportCenter(options?: {
  size?: number
  offsetX?: number
  offsetY?: number
}): Promise<Point[]>
```

**参数**:

- `options` - 配置选项
- `options.size`: `number` - 区域大小，单位米，默认使用配置中的最小尺寸
- `options.offsetX`: `number` - X方向像素偏移，支持负数，默认为 0
- `options.offsetY`: `number` - Y方向像素偏移，支持负数，默认为 0

**返回值**: [`Promise<Point[]>`](/reference/types#point)

## getCleanZonePointsByViewportCenter()

**类型**:

```ts
function getCleanZonePointsByViewportCenter(options?: {
  size?: number
  offsetX?: number
  offsetY?: number
}): Promise<Point[]>
```

**参数**:

- `options` - 配置选项
- `options.size`: `number` - 区域大小，单位米，默认使用配置中的最小尺寸
- `options.offsetX`: `number` - X方向像素偏移，支持负数，默认为 0
- `options.offsetY`: `number` - Y方向像素偏移，支持负数，默认为 0

**返回值**: [`Promise<Point[]>`](/reference/types#point)

## drawFurnitures()

绘制家具。

**类型**:

```ts
function drawFurnitures(items: FurnitureParam[]): Promise<void>
```

**参数**:

- `items`: [`FurnitureParam[]`](/reference/types#furnitureparam) - 家具数据数组。新 ID 会被添加，已有 ID 的数据变化会被更新，不在列表中的已有 ID 会被移除。传入空数组即清空所有家具。

**返回值**: `Promise<void>`

## getFurniturePointsByViewportCenter()

基于视口中心生成家具的四个顶点坐标。初始尺寸来源于 `config.furniture.assets` 中对应类型的 `width`/`height`（单位为米），SDK 内部根据地图 `resolution` 自动转换为像素坐标。

**类型**:

```ts
function getFurniturePointsByViewportCenter(options?: {
  furnitureType?: number
  offsetX?: number
  offsetY?: number
}): Promise<Point[]>
```

**参数**:

- `options` - 配置选项
- `options.furnitureType`: `number` - 家具类型编号，匹配 `config.furniture.assets` 中的 `type`。默认使用第一个素材的类型
- `options.offsetX`: `number` - X方向像素偏移，支持负数，默认为 0
- `options.offsetY`: `number` - Y方向像素偏移，支持负数，默认为 0

**返回值**: [`Promise<Point[]>`](/reference/types#point)

## getCustomCarpetPointsByViewportCenter()

基于视口中心生成自定义地毯可用的四个顶点坐标。返回的点集既可用于
`shape: 'rectangle'`，也可用于 `shape: 'round'`。默认宽高和尺寸约束
来自 `controls.carpet.minSize` / `controls.carpet.maxSize`。

**类型**:

```ts
function getCustomCarpetPointsByViewportCenter(options?: {
  width?: number
  height?: number
  offsetX?: number
  offsetY?: number
}): Point[]
```

**参数**:

- `options` - 配置选项
- `options.width`: `number` - 地毯宽度，单位米。未传且只传了 `height`
  时跟随 `height`
- `options.height`: `number` - 地毯高度，单位米。未传且只传了 `width`
  时跟随 `width`
- `options.offsetX`: `number` - X方向像素偏移，支持负数，默认为 `0`
- `options.offsetY`: `number` - Y方向像素偏移，支持负数，默认为 `0`

**返回值**: [`Point[]`](/reference/types#point)

## getFurnitures()

获取当前地图上所有家具数据。

**类型**:

```ts
function getFurnitures(): Promise<FurnitureParam[]>
```

**返回值**: [`Promise<FurnitureParam[]>`](/reference/types#furnitureparam)

## getSpotPointByViewportCenter()

基于视口中心生成定点清扫的点坐标。

**类型**:

```ts
function getSpotPointByViewportCenter(options?: {
  offsetX?: number
  offsetY?: number
}): Promise<Point>
```

**参数**:

- `options` - 配置选项
- `options.size`: `number` - 区域大小，单位米，默认使用配置中的最小尺寸
- `options.offsetX`: `number` - X方向像素偏移，支持负数，默认为 0
- `options.offsetY`: `number` - Y方向像素偏移，支持负数，默认为 0

**返回值**: [`Promise<Point[]>`](/reference/types#point)

## isNearChargerOrRobot()

判断一个点、墙体或区域是否与充电桩或机器人距离小于阈值。

**类型**:

```ts
function isNearChargerOrRobot(
  points: Point[],
  thresholdMeters: number,
  options?: {
    checkCharger?: boolean
    checkRobot?: boolean
  },
): boolean
```

**参数**:

- `points`: [`Point[]`](/reference/types#point) - 点坐标数组，支持点/墙体/区域三种类型。
- `thresholdMeters`: `number` - 阈值距离，单位米
- `options` - 配置选项
- `options.checkCharger`: `boolean` - 是否检查与充电桩的距离，默认为 true
- `options.checkRobot`: `boolean` - 是否检查与机器人的距离，默认为 false

**返回值**: `boolean` - 是否在判定范围内（true 表示过近，false 表示距离足够）

**示例**:

```ts
// 判断拖拽后的墙体是否与充电桩或机器人距离小于1米
function MapPage() {
  const [mapApi, setMapApi] = useState<MapApi | null>(null)

  const handleMapReady = (mapApi: MapApi) => {
    setMapApi(mapApi)
  }

  const handleUpdateVirtualWall = async (wall: VirtualWallParam) => {
    const isNearChargerOrRobot = await mapApi?.isNearChargerOrRobot(
      wall.points,
      1,
      { checkCharger: true, checkRobot: true },
    )
    if (isNearChargerOrRobot) {
      console.log('墙体与充电桩或机器人距离小于1米')
    } else {
      console.log('墙体与充电桩或机器人距离大于1米')
    }
  }
}

  return (
    <RobotMap
      onMapReady={handleMapReady}
      // ... 其他属性
      onUpdateVirtualWall={handleUpdateVirtualWall}
    />
  )
}
```

## isPointInAnyRoom()

判断一个点是否在任意房间内。

::: tip
需要传入基于机器坐标系的点
:::

**类型**:

```ts
function isPointInAnyRoom(point: Point): Promise<RoomData | null>
```

**参数**:

- `point`: [`Point`](/reference/types#point) - 待检测的点坐标（机器坐标系）

**返回值**: [`Promise<RoomData | null>`](/reference/types#roomdata) - 如果点在某个房间内，返回该房间的 RoomData；否则返回 null

**示例**:

```ts
// 判断一个点是否在房间内
const roomData = await mapApi.isPointInAnyRoom({ x: 100, y: 200 })
if (roomData) {
  console.log(`点在房间 ${roomData.name} 内`)
} else {
  console.log('点不在任何房间内')
}
```

## isWallIntersectsAnyRoom()

判断一个墙体是否与任意房间有交集。

**类型**:

```ts
function isWallIntersectsAnyRoom(points: Point[]): Promise<boolean>
```

**参数**:

- `points`: [`Point[]`](/reference/types#point) - 墙体的两个端点坐标（机器坐标系）

**返回值**: `Promise<boolean>`

**示例**:

```tsx
// 可以在onUpdateVirtualWall回调中使用，判断墙体是否与房间有交集
import { MapApi, VirtualWallParam } from '@ray-js/robot-map'
import React, { useState } from 'react'

function MapPage() {
  const [mapApi, setMapApi] = useState<MapApi | null>(null)

  const handleMapReady = (mapApi: MapApi) => {
    setMapApi(mapApi)
  }

  const handleUpdateVirtualWall = async (wall: VirtualWallParam) => {
    const isIntersects = await mapApi?.isWallIntersectsAnyRoom(wall.points)
    if (isIntersects) {
      console.log('墙体与房间有交集')
    } else {
      console.log('墙体与房间没有交集')
    }
  }

  return (
    <RobotMap
      onMapReady={handleMapReady}
      // ... 其他属性
      onUpdateVirtualWall={handleUpdateVirtualWall}
    />
  )
}
```

## isZoneIntersectsAnyRoom()

判断一个区域是否与任意房间有交集。

**类型**:

```ts
function isZoneIntersectsAnyRoom(points: Point[]): Promise<boolean>
```

**参数**:

- `points`: [`Point[]`](/reference/types#point) - 区域的四个顶点坐标（机器坐标系）

**返回值**: `Promise<boolean>`

**示例**:

```tsx
// 可以在onUpdateForbiddenSweepZone回调中使用，判断区域是否与房间有交集
import { MapApi, ZoneParam } from '@ray-js/robot-map'
import React, { useState } from 'react'

function MapPage() {
  const [mapApi, setMapApi] = useState<MapApi | null>(null)

  const handleMapReady = (mapApi: MapApi) => {
    setMapApi(mapApi)
  }

  const handleUpdateForbiddenSweepZone = async (zone: ZoneParam) => {
    const isIntersects = await mapApi?.isZoneIntersectsAnyRoom(zone.points)
    if (isIntersects) {
      console.log('区域与房间有交集')
    } else {
      console.log('区域与房间没有交集')
    }
  }

  return (
    <RobotMap
      onMapReady={handleMapReady}
      // ... 其他属性
      onUpdateForbiddenSweepZone={handleUpdateForbiddenSweepZone}
    />
  )
}
```

## resetPanZoom()

重置地图的平移和缩放状态到初始位置。

**类型**:

```ts
function resetPanZoom(): Promise<void>
```

**返回值**: `Promise<void>`

## snapshot()

当前地图截图。

::: tip
截图过程中会自动添加一个临时的背景层（与容器边界等大），确保禁区、地毯等半透明元素在非实底背景下能够正确显示颜色。
:::

**类型**:

```ts
import { ColorSource } from 'pixi.js'

function snapshot(options?: { backgroundColor?: ColorSource }): Promise<string>
```

**参数**:

- `options` - 截图配置选项
- `options.backgroundColor`: `ColorSource` - 指定截图时的背景颜色。若不指定，将默认使用 `config.global.backgroundColor`。支持颜色字符串（如 `'#ffffff'`、`'rgba(0,0,0,1)'`）、十六进制数值（如 `0xffffff`）或 RGB 数组。

**返回值**: [`Promise<string>`](/reference/types#string) - Base64 格式的图片数据 (Data URL)。

## snapshotByData()

根据指定的地图数据进行截图。主要用于多地图管理界面的缩略图预览。

此方法会创建一个临时的离屏渲染实例，不会影响当前正在运行的地图显示状态。

::: tip
配置（如颜色方案、图标样式等）会沿用当前地图实例的配置。
:::

**类型**:

```ts
import { ColorSource } from 'pixi.js'

function snapshotByData(
  data: {
    map: string
    path?: string
    roomProperties?: RoomProperty[]
    customElements?: CustomElementParam[]
    forbiddenSweepZones?: ZoneParam[]
    forbiddenMopZones?: ZoneParam[]
    virtualWalls?: VirtualWallParam[]
    detectedObjects?: DetectedObjectParam[]
    furnitures?: FurnitureParam[]
  },
  runtime?: DeepPartialRuntimeConfig,
  options?: { backgroundColor?: ColorSource },
): Promise<string>
```

**参数**:

- `data` - 地图数据对象
- `data.map`: `string` - 地图字符串数据 (支持结构化协议和栅格协议)
- `data.path`: `string` - 可选的路径数据
- `data.roomProperties`: `RoomProperty[]` - 可选的房间属性数据
- `data.customElements`: `CustomElementParam[]` - 可选的自定义元素数据
- `data.forbiddenSweepZones`: `ZoneParam[]` - 可选的禁扫区域数据
- `data.forbiddenMopZones`: `ZoneParam[]` - 可选的禁拖区域数据
- `data.virtualWalls`: `VirtualWallParam[]` - 可选的虚拟墙数据
- `data.detectedObjects`: `DetectedObjectParam[]` - 可选的检测物体数据
- `data.furnitures`: [`FurnitureParam[]`](/reference/types#furnitureparam) - 可选的家具数据
- `runtime` - 可选的运行时配置 (DeepPartialRuntimeConfig)
- `options` - 截图配置选项
- `options.backgroundColor`: `ColorSource` - 指定生成截图时的背景颜色。若不指定，将默认使用 `config.global.backgroundColor`。

**返回值**: [`Promise<string>`](/reference/types#string) - Base64 格式的图片数据 (Data URL)。

## forceEndGesture()

强制结束当前正在进行的手势交互。

**类型**:

```ts
function forceEndGesture(): Promise<void>
```

**返回值**: `Promise<void>`

::: tip
该方法主要用于解决小程序异层渲染导致的 `touchend` 事件丢失问题。如果小程序侧通过原生手势监听到松手，但 SDK 由于层级劫持未收到事件，可调用此方法手动终止 SDK 内部的手势状态。这会触发当前的控制元素（如禁区）执行最终的位置更新并抛出 `onUpdateXxx` 回调。
:::
