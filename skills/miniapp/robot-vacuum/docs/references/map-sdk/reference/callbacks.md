# 地图事件回调

了解 RobotMap 的地图事件回调，用于响应地图的各种交互和状态变化。

## 使用示例

地图事件回调通过组件 props 传递，当地图发生相应的交互或状态变化时会自动触发。所有回调都是可选的，只需要传入你关心的回调函数。

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

function MapPage() {
  return (
    <RobotMap
      onMapDrawed={(mapState) => {
        console.log('地图绘制完成', mapState)
      }}
      onClickRoom={(room) => {
        console.log('点击了房间', room)
      }}
      onUpdateCleanZone={(zone) => {
        console.log('清扫区域已更新', zone)
      }}
      // ... 其他属性
    />
  )
}
```

## onMapReady

地图初始化完成回调。当地图组件初始化完成且所有 API 功能可用时触发。

**类型**:

```ts
function onMapReady(mapApi: MapApi): void
```

**参数**:

- `mapApi`: `MapApi` - 可供使用的地图 API 函数对象。在组件层中，所有方法返回 Promise。

**返回值**: `void`

::: tip
这是获取 `mapApi` 实例的唯一方式。你需要在这个回调中保存 `mapApi` 引用，后续通过它调用所有地图方法。
:::

**示例**:

```tsx
import { MapApi } from '@ray-js/robot-map'
import { useRef } from 'react'

function MapPage() {
  const mapApiRef = useRef<MapApi>(null)

  return (
    <RobotMap
      onMapReady={(api) => {
        mapApiRef.current = api
      }}
      // ... 其他属性
    />
  )
}
```

## onMapFirstDrawed

地图首次绘制完成回调。

**类型**:

```ts
function onMapFirstDrawed(mapState: MapState): void
```

**参数**:

- `mapState`: [`MapState`](/reference/types#mapstate) - 地图状态信息，包含地图尺寸、原点、充电桩等信息。

**返回值**: `void`

::: tip
只有首次绘制完成后，才会触发此回调。你可以利用它来移除 Loading 状态。
:::

## onMapDrawed

地图绘制完成回调。

**类型**:

```ts
function onMapDrawed(mapState: MapState): void
```

**参数**:

- `mapState`: [`MapState`](/reference/types#mapstate) - 地图状态信息，包含地图尺寸、原点、充电桩等信息。

**返回值**: `void`

## onPathDrawed

路径绘制完成回调。

**类型**:

```ts
function onPathDrawed(pathState: PathState): void
```

**参数**:

- `pathState`: [`PathState`](/reference/types#pathstate) - 路径状态信息，包含路径ID、类型、机器人位置等。

**返回值**: `void`

## onRoomPropertiesDrawed

房间信息绘制完成回调。

**类型**:

```ts
function onRoomPropertiesDrawed(rooms: RoomProperty[]): void
```

**参数**:

- `rooms`: [`RoomProperty[]`](/reference/types#roomproperty) - 房间属性信息数组。

**返回值**: `void`

## onClickRoom

点击房间回调。

**类型**:

```ts
function onClickRoom(room: Partial<RoomData>): void
```

**参数**:

- `room`: [`RoomData`](/reference/types#roomdata) - 被点击的房间信息。

**返回值**: `void`

## onClickRoomProperties

点击房间信息回调。

**类型**:

```ts
function onClickRoomProperties(room: RoomData): void
```

**参数**:

- `room`: [`RoomData`](/reference/types#roomdata) - 被点击的房间信息。

**返回值**: `void`

## onRemoveForbiddenSweepZone

点击禁扫区域删除按钮的回调。

**类型**:

```ts
function onRemoveForbiddenSweepZone(id: string): void
```

**参数**:

- `id`: `string` - 操作对应的禁扫区域ID。

**返回值**: `void`

## onRemoveForbiddenMopZone

点击禁拖区域删除按钮的回调。

**类型**:

```ts
function onRemoveForbiddenMopZone(id: string): void
```

**参数**:

- `id`: `string` - 操作对应的禁拖区域ID。

**返回值**: `void`

## onRemoveCleanZone

点击清扫区域删除按钮的回调。

**类型**:

```ts
function onRemoveCleanZone(id: string): void
```

**参数**:

- `id`: `string` - 操作对应的清扫区域ID。

**返回值**: `void`

## onRemoveCustomZone

点击自定义区域删除按钮的回调。仅自定义区域类型会触发此回调；三种内置区域会触发各自的 `onRemoveForbiddenSweepZone` / `onRemoveForbiddenMopZone` / `onRemoveCleanZone`。

**类型**:

```ts
function onRemoveCustomZone(type: string, id: string): void
```

**参数**:

- `type`: `string` - 自定义区域的类型名，通过 [`config.customZoneTypes`](/reference/config#customzonetypes) 声明。
- `id`: `string` - 操作对应的自定义区域ID。

**返回值**: `void`

## onRemoveVirtualWall

点击虚拟墙删除按钮的回调。

**类型**:

```ts
function onRemoveVirtualWall(id: string): void
```

**参数**:

- `id`: `string` - 操作对应的虚拟墙ID。

**返回值**: `void`

## onUpdateForbiddenSweepZone

更新禁扫区域回调。当用户操作禁扫区域（如拖拽、缩放）后触发。

**类型**:

```ts
function onUpdateForbiddenSweepZone(zone: ZoneParam): void
```

**参数**:

- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 更新后的禁扫区域数据。

**返回值**: `void`

## onUpdateForbiddenMopZone

更新禁拖区域回调。当用户操作禁拖区域（如拖拽、缩放）后触发。

**类型**:

```ts
function onUpdateForbiddenMopZone(zone: ZoneParam): void
```

**参数**:

- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 更新后的禁拖区域数据。

**返回值**: `void`

## onUpdateCleanZone

更新清扫区域回调。

**类型**:

```ts
function onUpdateCleanZone(zone: ZoneParam): void
```

**参数**:

- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 更新后的清扫区域数据。

**返回值**: `void`

## onUpdateCustomZone

更新自定义区域回调。当用户操作自定义区域（如拖拽、缩放）后触发。仅自定义区域类型会触发此回调。

**类型**:

```ts
function onUpdateCustomZone(type: string, zone: ZoneParam): void
```

**参数**:

- `type`: `string` - 自定义区域的类型名，通过 [`config.customZoneTypes`](/reference/config#customzonetypes) 声明。
- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 更新后的自定义区域数据。

**返回值**: `void`

## onUpdateVirtualWall

更新虚拟墙回调。

**类型**:

```ts
function onUpdateVirtualWall(wall: VirtualWallParam): void
```

**参数**:

- `wall`: [`VirtualWallParam`](/reference/types#virtualwallparam) - 更新后的虚拟墙数据。

**返回值**: `void`

## onUpdateSpot

更新定点清扫回调。

**类型**:

```ts
function onUpdateSpot(spot: SpotParam): void
```

**参数**:

- `spot`: [`SpotParam`](/reference/types#spotparam) - 更新后的定点清扫数据。

**返回值**: `void`

## onClickForbiddenSweepZone

点击禁扫区域回调。

**类型**:

```ts
function onClickForbiddenSweepZone(zone: ZoneParam): void
```

**参数**:

- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 被点击的禁扫区域数据。

**返回值**: `void`

## onClickForbiddenMopZone

点击禁拖区域回调。

**类型**:

```ts
function onClickForbiddenMopZone(zone: ZoneParam): void
```

**参数**:

- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 被点击的禁拖区域数据。

**返回值**: `void`

## onClickCleanZone

点击清扫区域回调。

**类型**:

```ts
function onClickCleanZone(zone: ZoneParam): void
```

**参数**:

- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 被点击的清扫区域数据。

**返回值**: `void`

## onClickCustomZone

点击自定义区域回调。仅自定义区域类型会触发此回调。通常用来把某个区域切换到编辑态。

**类型**:

```ts
function onClickCustomZone(type: string, zone: ZoneParam): void
```

**参数**:

- `type`: `string` - 自定义区域的类型名，通过 [`config.customZoneTypes`](/reference/config#customzonetypes) 声明。
- `zone`: [`ZoneParam`](/reference/types#zoneparam) - 被点击的自定义区域数据。

**返回值**: `void`

## onClickVirtualWall

点击虚拟墙回调。

**类型**:

```ts
function onClickVirtualWall(wall: VirtualWallParam): void
```

**参数**:

- `wall`: [`VirtualWallParam`](/reference/types#virtualwallparam) - 被点击的虚拟墙数据。

**返回值**: `void`

## onClickSpot

点击定点清扫回调。

**类型**:

```ts
function onClickSpot(spot: SpotParam): void
```

**参数**:

- `spot`: [`SpotParam`](/reference/types#spotparam) - 被点击的定点清扫数据。

**返回值**: `void`

## onRemoveFurniture

点击家具删除按钮的回调。

**类型**:

```ts
function onRemoveFurniture(id: string): void
```

**参数**:

- `id`: `string` - 被删除的家具ID。

**返回值**: `void`

## onUpdateFurniture

更新家具回调。当用户操作家具（拖拽、缩放、旋转）后触发。

**类型**:

```ts
function onUpdateFurniture(furniture: FurnitureParam): void
```

**参数**:

- `furniture`: [`FurnitureParam`](/reference/types#furnitureparam) - 更新后的家具数据。

**返回值**: `void`

## onClickFurniture

点击家具回调。

**类型**:

```ts
function onClickFurniture(furniture: FurnitureParam): void
```

**参数**:

- `furniture`: [`FurnitureParam`](/reference/types#furnitureparam) - 被点击的家具数据。

**返回值**: `void`

## onClickWayPoint

点击途径点回调。

**类型**:

```ts
function onClickWayPoint(wayPoint: WayPointParam): void
```

**参数**:

- `wayPoint`: [`WayPointParam`](/reference/types#waypointparam) - 被点击的途径点数据。

**返回值**: `void`

## onClickDetectedObject

点击检测物体回调。

**类型**:

```ts
function onClickDetectedObject(object: DetectedObjectParam): void
```

**参数**:

- `object`: [`DetectedObjectParam`](/reference/types#detectedobjectparam) - 被点击的检测物体数据。

**返回值**: `void`

## onClickCustomElement

点击自定义元素回调。

**类型**:

```ts
function onClickCustomElement(element: CustomElementParam): void
```

**参数**:

- `element`: [`CustomElementParam`](/reference/types#customelementparam) - 被点击的自定义元素数据。

**返回值**: `void`

## onClickCarpet

点击地毯区域回调。

**类型**:

```ts
function onClickCarpet(carpet: { id: string }): void
```

**参数**:

- `carpet`: `{ id: string }` - 被点击的地毯信息。

**返回值**: `void`

::: tip
需要启用 `config.carpet.enableEdit` 后，该回调才会被触发。
:::

## onDeleteCarpet

删除地图地毯回调。

**类型**:

```ts
function onDeleteCarpet(carpet: { id: string }): void
```

**参数**:

- `carpet`: `{ id: string }` - 被删除的地毯信息。

**返回值**: `void`

## onDeleteCustomCarpet

删除自定义地毯回调。

**类型**:

```ts
function onDeleteCustomCarpet(carpet: { id: string }): void
```

**参数**:

- `carpet`: `{ id: string }` - 被删除的自定义地毯信息。

**返回值**: `void`

## onUpdateCustomCarpet

更新自定义地毯回调。当用户编辑自定义地毯（移动、旋转、缩放）后触发。

**类型**:

```ts
function onUpdateCustomCarpet(carpet: CustomCarpetParam): void
```

**参数**:

- `carpet`: [`CustomCarpetParam`](/reference/types#customcarpetparam) - 更新后的自定义地毯数据。

**返回值**: `void`


## onUpdateDivider

更新分割线回调。

**类型**:

```ts
function onUpdateDivider(divider: Point[]): void
```

**参数**:

- `divider`: [`Point[]`](/reference/types#point) - 更新后的分割线数据。

**返回值**: `void`

## onClickMap

地图点击回调。

**类型**:

```ts
function onClickMap(point: Point): void
```

**参数**:

- `point`: [`Point`](/reference/types#point) - 点击位置的地图坐标。

**返回值**: `void`

::: tip
只有启用 `runtime.enableMapClickCapture` 后，才会触发此回调。
:::

## onGestureStart

手势交互开始回调。

**类型**:

```ts
function onGestureStart(): void
```

**返回值**: `void`

::: tip
当用户开始与地图进行交互（如平移、缩放）或操作地图上的控制元素（如禁区、虚拟墙等）时触发。该回调通常用于在小程序层动态切换组件显隐（如将 `CoverView` 切换为普通 `View`），以避免原生组件由于层级问题干扰手势捕获。
:::

## onGestureEnd

手势交互结束回调。

**类型**:

```ts
function onGestureEnd(): void
```

**返回值**: `void`

::: tip
当用户结束与地图上的控制元素的手势交互时触发。
:::

## onClickRobot

点击扫地机器人回调。

**类型**:

```ts
function onClickRobot(point: IconPoint): void
```

**参数**:

- `point`: [`IconPoint`](/reference/types#iconpoint) - 扫地机器人当前位置和朝向。

**返回值**: `void`

::: tip
只有启用 `config.interaction.enableRobotClick` 后，该回调才会被触发。
:::

## onClickChargingStation

点击充电桩回调。

**类型**:

```ts
function onClickChargingStation(point: IconPoint): void
```

**参数**:

- `point`: [`IconPoint`](/reference/types#iconpoint) - 充电桩当前位置和朝向。

**返回值**: `void`

::: tip
只有启用 `config.interaction.enableChargingStationClick` 后，该回调才会被触发。
:::
