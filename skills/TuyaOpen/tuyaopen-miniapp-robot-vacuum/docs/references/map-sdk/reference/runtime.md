# 运行时配置

了解 RobotMap 的运行时配置项，用于控制地图在运行过程中的动态行为和状态。

## 使用示例

运行时配置通过 `runtime` 传递，所有配置项都是可选的，你可以只覆盖需要修改的部分。

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

function MapPage() {
  return (
    <RobotMap
      runtime={{
        showPath: true,
        showChargingStation: true,
        showRoomName: true,
        showRoomProperty: true,
        showRoomOrder: true,
        showDetectedObjects: true,
        enableRoomSelection: false,
        // ... 其他运行时配置
      }}
      // ... 其他props
    />
  )
}
```

## dividingRoomId

- **类型**: `number`
- **默认值**: `-1`

正在分割的房间ID。

你可以通过将 `dividingRoomId` 设置为 `-1` 来移除分割线。

## enableRoomSelection

- **类型**: `boolean`
- **默认值**: `false`

是否启用房间选择功能

::: tip
- **当 `enableRoomSelection` 为 `false` 时**：房间使用普通展示模式的颜色（对应 `room.colors.normal`，若未定义则使用 `room.colors.active`）。
- **当 `enableRoomSelection` 为 `true` 时**：进入房间选择模式。房间颜色根据是否被选中（是否在 `selectRoomIds` 中）在 `active` 和 `inactive` 之间切换。
:::

## enableInteraction

- **类型**: `boolean`
- **默认值**: `false`

是否启用交互功能。

当 `enableInteraction` 为 `false` 时，地图不会响应任何交互事件。

## enableMapClickCapture

- **类型**: `boolean`
- **默认值**: `false`

是否启用地图点击捕获功能。

开启地图点击捕获功能后，用户点击地图时会触发 `onClickMap` 回调。

## editingForbiddenSweepZoneIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的禁扫区域ID列表。

## editingForbiddenMopZoneIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的禁拖区域ID列表。

## editingCleanZoneIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的清扫区域ID列表。

## editingCustomZoneIds

- **类型**: `Record<string, string[]>`
- **默认值**: `{}`

正在编辑的自定义区域ID列表，按自定义类型分组。key 为通过 [`config.customZoneTypes`](/reference/config#customzonetypes) 声明的类型名，value 为该类型下处于编辑态的区域 ID 列表。

::: tip
三种内置区域（forbiddenSweepZone / forbiddenMopZone / cleanZone）继续使用各自的 `editingForbiddenSweepZoneIds` / `editingForbiddenMopZoneIds` / `editingCleanZoneIds`，不会出现在这里。
:::

## editingVirtualWallIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的虚拟墙ID列表。

## editingSpotIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的定点清扫ID列表。

## editingWayPointIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的途径点ID列表。

## editingCarpetIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的地毯ID列表。

## editingFurnitureIds

- **类型**: `string[]`
- **默认值**: `[]`

正在编辑的家具ID列表。

## mapRotation

- **类型**: `number`
- **默认值**: `0`
- **单位**: `度(°)`

地图旋转角度。

## roomPropertyFoldIds

- **类型**: `number[]`
- **默认值**: `[]`

处于折叠状态的房间ID列表。

## roomSelectionMode

- **类型**: `'checkmark' | 'order'`
- **默认值**: `'checkmark'`

房间选中的指示方式。

::: tip
当 `roomSelectionMode` 为 `'checkmark'` 时，房间选中后会显示选择指示器。

当 `roomSelectionMode` 为 `'order'` 时，房间选中后会显示清扫顺序数字。
:::

## selectRoomIds

- **类型**: `number[]`
- **默认值**: `[]`

选中的房间ID列表。只有当 `enableRoomSelection` 为 `true` 时，这个值才会生效。

## selectedCarpetIds

- **类型**: `string[]`
- **默认值**: `[]`

选中的地毯ID列表。

## showRoomProperty

- **类型**: `boolean`
- **默认值**: `false`

是否显示房间属性。

## showRoomOrder

- **类型**: `boolean`
- **默认值**: `true`

是否显示房间清扫顺序。

## showRoomName

- **类型**: `boolean`
- **默认值**: `true`

是否显示房间名称。

## showRoomType

- **类型**: `boolean`
- **默认值**: `true`

是否显示房间类型图标。

## showPath

- **类型**: `boolean`
- **默认值**: `true`

是否显示机器人路径。

## showRobot

- **类型**: `boolean`
- **默认值**: `true`

是否显示扫地机器人。

## showChargingStation

- **类型**: `boolean`
- **默认值**: `true`

是否显示充电桩。

## showRoomFloorType

- **类型**: `boolean`
- **默认值**: `true`

是否显示房间地板材质。

## showCarpet

- **类型**: `boolean`
- **默认值**: `true`

是否显示地毯。

## showDetectedObjects

- **类型**: `boolean`
- **默认值**: `true`

是否显示 AI 检测物体。

## showFurnitures

- **类型**: `boolean`
- **默认值**: `true`

是否显示家具。

## showCustomCarpets

- **类型**: `boolean`
- **默认值**: `true`

是否显示自定义地毯。

## showChargingStationRing

- **类型**: `boolean`
- **默认值**: `false`

是否显示充电桩预警圈。

## showRobotRing

- **类型**: `boolean`
- **默认值**: `false`

是否显示机器人预警圈。

## showRobotSleepAnimation

- **类型**: `boolean`
- **默认值**: `false`

是否显示机器人睡眠动画。

## showRobotPulseCircle

- **类型**: `boolean`
- **默认值**: `false`

是否显示机器人脉冲圈（呼吸效果）。

::: tip
机器人脉冲圈会在机器人图标下方显示一个呼吸动画效果，可用于充电等状态的视觉提示。
:::

## unit

- **类型**: `meter | feet | centimeter`
- **默认值**: `'meter'`

尺寸标签单位。

尺寸标签的显示会根据这个单位进行转换计算。

## unitLabel

- **类型**: `string`
- **默认值**: `'m'`

尺寸标签单位显示文本。
