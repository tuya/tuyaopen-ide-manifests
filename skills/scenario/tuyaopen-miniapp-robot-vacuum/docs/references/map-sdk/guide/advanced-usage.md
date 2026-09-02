# 进阶使用

Tuya Robot Map 的进阶使用，包含了我们认为的最佳实践。

## 自适应缩放

自适应缩放是地图 SDK 的核心功能之一，它会自动调整地图的缩放比例和位置，确保地图能够以合适的大小居中显示在视口中。

### 什么是 scale？

`scale` 表示地图的缩放比例。**`scale = 1` 表示地图按照真实像素尺寸显示**。

例如，如果你的地图数据是 300×300 的尺寸：

- `scale = 1` 时，地图会用 300×300 像素显示
- `scale = 2` 时，地图会放大到 600×600 像素
- `scale = 0.5` 时，地图会缩小到 150×150 像素

### 自适应缩放的触发时机

自适应缩放会在以下情况自动触发：

1. **地图首次绘制**：当地图第一次加载时
2. **地图 ID 变化**：切换到不同的地图时
3. **地图状态变化**：地图的 `status` 字段变化时（例如从建图中变为建图完成）
4. **地图原点变化**：地图的 `origin` 坐标变化超过阈值时
5. **地图尺寸变化**：地图的 `size` (宽度或高度) 变化超过阈值时
6. **地图旋转**：通过 `runtime.mapRotation` 旋转地图后

### 自适应缩放的计算逻辑

当触发自适应缩放时，SDK 会按照以下步骤计算最终的缩放比例：

#### 1. 计算初始缩放比例

SDK 会根据 [`map.autoPaddingHorizontalPercent`](/reference/config#map-autopaddinghorizontalpercent) 和 [`map.autoPaddingVerticalPercent`](/reference/config#map-autopaddingverticalpercent) 计算出一个初始的缩放比例，确保地图能够完整显示并保留指定的边距。

例如，如果视口宽度是 375px，`autoPaddingHorizontalPercent` 是 0.05（默认值），那么：

- 水平方向的可用空间 = 375 × (1 - 0.05 × 2) = 337.5px
- 如果地图实际宽度是 300px，则计算出的 scale = 337.5 / 300 ≈ 1.125
- 如果地图实际宽度是 600px，则计算出的 scale = 337.5 / 600 ≈ 0.5625

#### 2. 应用缩放比例限制

计算出的初始缩放比例会受到 [`interaction.fitMinScale`](/reference/config#interaction-fitminscale) 和 [`interaction.fitMaxScale`](/reference/config#interaction-fitmaxscale) 的限制：

```
最终 scale = Math.max(fitMinScale, Math.min(初始 scale, fitMaxScale))
```

### 常见问题与解决方案

#### 问题 1：超大地图显示不全

**现象**：地图很大，但只能看到部分内容，无法看到完整地图。

**原因**：当地图尺寸超过视口时，SDK 计算出的缩放比例可能小于 1（需要缩小地图）。但是 `fitMinScale` 的默认值是 1，会限制地图不能缩小到小于原始尺寸，导致地图无法完整显示。

**解决方案**：将 `fitMinScale` 设置为小于 1 的值，允许地图缩小。

```tsx
<RobotMap
  config={{
    interaction: {
      // 允许地图缩小到原始尺寸的 50%
      fitMinScale: 0.5,
    },
  }}
/>
```

#### 问题 2：超小地图被放大得过大

**现象**：地图很小，显示时被过度放大，体验不佳。

**原因**：当地图尺寸很小时，SDK 计算出的缩放比例可能很大。虽然 `fitMaxScale` 默认值是 4，但对于某些超小地图来说可能还是太大了。

**解决方案**：减小 `fitMaxScale` 的值，限制最大放大倍数。

```tsx
<RobotMap
  config={{
    interaction: {
      // 最多放大到原始尺寸的 2 倍
      fitMaxScale: 2,
    },
  }}
/>
```

### 相关配置项

以下配置项共同控制自适应缩放的行为：

| 配置项                                                                                   | 默认值 | 说明                         |
| ---------------------------------------------------------------------------------------- | ------ | ---------------------------- |
| [`interaction.fitMinScale`](/reference/config#interaction-fitminscale)                   | 1      | 自适应缩放时的最小比例       |
| [`interaction.fitMaxScale`](/reference/config#interaction-fitmaxscale)                   | 4      | 自适应缩放时的最大比例       |
| [`map.autoPaddingHorizontalPercent`](/reference/config#map-autopaddinghorizontalpercent) | 0.05   | 水平方向保留的最小边距比例   |
| [`map.autoPaddingVerticalPercent`](/reference/config#map-autopaddingverticalpercent)     | 0.05   | 垂直方向保留的最小边距比例   |
| [`map.originChangeAutoFitThreshold`](/reference/config#map-originchangeautofitthreshold) | 2      | 地图原点变化触发自适应的阈值 |
| [`map.sizeChangeAutoFitThreshold`](/reference/config#map-sizechangeautofitthreshold)     | 10     | 地图尺寸变化触发自适应的阈值 |

### 手动触发自适应缩放

除了自动触发，你也可以通过 API 手动触发自适应缩放：

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const [mapApi, setMapApi] = useState<MapApi | null>(null)

  const handleMapReady = (api: MapApi) => {
    setMapApi(api)
  }

  const handleResetView = () => {
    // 手动触发自适应缩放
    mapApi?.resetPanZoom()
  }

  return (
    <>
      <RobotMap onMapReady={handleMapReady} />
      <Button onClick={handleResetView}>重置视图</Button>
    </>
  )
}
```

## 房间智能配色

地图 SDK 会自动为房间分配颜色，确保相邻的房间始终使用不同的颜色，让地图更清晰易读。

### 核心特性

- **自动避免冲突**：相邻的房间永远不会使用相同的颜色
- **灵活的配色策略**：可以选择让某些颜色更突出，或让所有颜色均匀分布
- **稳定的配色结果**：地图更新时颜色分配保持一致，避免用户困惑

::: tip
根据**四色定理**（[Four Color Theorem](https://zh.wikipedia.org/wiki/%E5%9B%9B%E8%89%B2%E5%AE%9A%E7%90%86)），理论上 4 种颜色就足以为任何平面地图着色。因此，建议至少提供 4 种颜色。
:::

### 颜色分配策略

SDK 提供两种颜色分配策略，可通过 [`room.colors.strategy`](/reference/config#room-colors-strategy) 配置：

#### priority（加权优先）

优先使用数组中靠前的颜色，但会保持一定的多样性，不会让某个颜色过度集中。

**适用场景**：

- 你的颜色数组是精心设计的，希望主要使用前几种颜色
- 产品设计中有主题色，希望这些颜色出现的频率更高

```tsx
<RobotMap
  config={{
    room: {
      colors: {
        strategy: 'priority', // 默认值
        active: ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399'],
        // 蓝色会被最多使用，其次是绿色、紫色、橙色
      },
    },
  }}
/>
```

#### balanced（均匀分配）

让所有颜色的使用频率尽可能接近，呈现均衡的色彩分布。

**适用场景**：

- 颜色数组中的所有颜色都同等重要
- 希望地图整体看起来色彩更加丰富多样
- 不希望某种颜色过度出现

```tsx
<RobotMap
  config={{
    room: {
      colors: {
        strategy: 'balanced',
        active: ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399'],
        // 4 种颜色会被尽可能均匀地使用
      },
    },
  }}
/>
```

### 房间排序方式

在进行颜色分配前，SDK 会先对房间进行排序。排序方式可通过 [`room.colors.sortBy`](/reference/config#room-colors-sortby) 配置：

#### index（按 ID 排序）

**特点**：按房间 ID 从小到大排序，颜色分配结果稳定。

**适用场景**：

- 希望颜色分配结果在地图更新时保持稳定
- 房间 ID 本身具有业务意义（如按清扫顺序编号）

```tsx
<RobotMap
  config={{
    room: {
      colors: {
        sortBy: 'index', // 默认值
      },
    },
  }}
/>
```

::: tip
这是**推荐的默认选项**，可以确保即使机器在清扫过程中房间面积略有变化，颜色分配也不会突然改变，避免用户困惑。
:::

#### area（按面积排序）

**特点**：按房间面积从大到小排序，大房间会优先获得数组中靠前的颜色。

**适用场景**：

- 希望大房间使用主题色或更醒目的颜色
- 配合 `priority` 策略使用，让大房间更突出

```tsx
<RobotMap
  config={{
    room: {
      colors: {
        sortBy: 'area',
        strategy: 'priority',
        active: ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399'],
        // 面积最大的房间会优先使用蓝色
      },
    },
  }}
/>
```

::: warning 注意
使用 `area` 排序时，如果机器在清扫过程中房间面积发生变化（例如从建图中到建图完成），可能导致房间颜色突然改变，建议谨慎使用。
:::

### 配色建议

#### 颜色数量

**建议至少提供 4 种颜色**。根据四色定理，4 种颜色在理论上足以为任何平面地图着色。

```tsx
<RobotMap
  config={{
    room: {
      colors: {
        // ✅ 推荐：至少 4 种颜色
        active: ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399'],
      },
    },
  }}
/>
```

**什么时候需要更多颜色？**

- 如果你的地图中有特别复杂的相邻关系（某个房间与 4 个以上的房间相邻）
- 使用 `balanced` 策略希望获得更丰富的视觉效果
- 你可以尝试提供 5-6 种颜色，但通常 4 种已经足够

#### 颜色数组一致性

**强烈建议**所有与房间相关的颜色数组保持相同长度：

```tsx
<RobotMap
  config={{
    room: {
      colors: {
        // ✅ 推荐：所有数组长度一致
        active: ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399'],
        inactive: ['#d6e7fc', '#d1f4e5', '#ece0fb', '#fff0d9'],
        normal: ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399'], // 普通模式背景
        name: ['#2563b8', '#26966b', '#7c3fb8', '#d97706'],
        nameNormal: ['#2563b8', '#26966b', '#7c3fb8', '#d97706'], // 普通模式文字
        propertyTheme: ['#2563b8', '#26966b', '#7c3fb8', '#d97706'],
        propertyThemeNormal: ['#2563b8', '#26966b', '#7c3fb8', '#d97706'], // 普通模式图标
        selectionIndicatorBackground: [
          '#2563b8',
          '#26966b',
          '#7c3fb8',
          '#d97706',
        ],
      },
    },
  }}
/>
```

这样可以确保房间的所有视觉元素（填充色、名称、属性图标等）都使用一致的配色主题。

#### 颜色对比度

选择颜色时要考虑：

- **相邻房间的区分度**：相邻房间的颜色应该有足够的对比，便于用户区分
- **文字可读性**：房间名称、属性图标等文字元素的颜色要与背景色有足够对比
- **无障碍访问**：考虑色盲用户，避免仅依靠红绿色进行区分

### 相关配置项

以下配置项与房间智能配色相关：

| 配置项                                                                     | 默认值       | 说明                                     |
| -------------------------------------------------------------------------- | ------------ | ---------------------------------------- |
| [`room.colors.strategy`](/reference/config#room-colors-strategy)           | `'balanced'` | 颜色分配策略（`priority` 或 `balanced`） |
| [`room.colors.sortBy`](/reference/config#room-colors-sortby)               | `'index'`    | 房间排序方式（`index` 或 `area`）        |
| [`room.colors.active`](/reference/config#room-colors-active)               | 4 种颜色     | `enableRoomSelection: true` 时选中房间的填充色 |
| [`room.colors.inactive`](/reference/config#room-colors-inactive)           | 4 种颜色     | `enableRoomSelection: true` 时未选中房间的填充色 |
| [`room.colors.normal`](/reference/config#room-colors-normal)               | `undefined`  | `enableRoomSelection: false` 时的填充色（若未定义则使用 `active`） |
| [`room.colors.name`](/reference/config#room-colors-name)                   | 4 种颜色     | `enableRoomSelection: true` 时选中房间的文字颜色 |
| [`room.colors.nameNormal`](/reference/config#room-colors-namenormal)       | `undefined`  | `enableRoomSelection: false` 时的文字颜色（若未定义则使用 `name`） |
| [`room.colors.propertyTheme`](/reference/config#room-colors-propertytheme) | 4 种颜色     | `enableRoomSelection: true` 时选中房间的图标颜色 |
| [`room.colors.propertyThemeNormal`](/reference/config#room-colors-propertythemenormal) | `undefined`  | `enableRoomSelection: false` 时的图标颜色（若未定义则使用 `propertyTheme`） |
| [`map.adjacencyThreshold`](/reference/config#map-adjacencythreshold)       | `3`          | 房间相邻判定阈值（单位：像素）           |

## 选择房间

用于选区清扫、定时预约、房间分割等业务场景。

::: tip
选择房间是完全受控的，取决于你传入的 `enableRoomSelection` 和 `selectRoomIds`。点击房间的时候组件内部并不会做任何事，只是抛出 `onClickRoom` 事件。
:::

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const [mapApi, setMapApi] = useState<MapApi | null>(null)
  const [enableRoomSelection, setEnableRoomSelection] = useState(true)
  const [selectRoomIds, setSelectRoomIds] = useState<number[]>([])

  // 地图准备就绪时触发
  const handleMapReady = () => {
    setMapApi(mapApi)
  }

  // 点击房间时触发
  const handleClickRoom = (room: RoomProperty) => {
    if (selectRoomIds.includes(room.id)) {
      setSelectRoomIds(selectRoomIds.filter((id) => id !== room.id))
    } else {
      setSelectRoomIds([...selectRoomIds, room.id])
    }
  }

  return (
    <RobotMap
      config={{
        room: {
          colors: {
             /**
             * 房间颜色数组（建议至少 4 种颜色）
             * 使用四色定理算法自动分配，确保相邻房间颜色不同
             * - 当 enableRoomSelection 为 true 时：代表“选中”房间的颜色
             * - 当 enableRoomSelection 为 false 时：代表房间的默认展示颜色（若未配置 normal 则使用此项）
             */
            active: YOUR_ACTIVE_COLORS,
            /**
             * 非激活状态的房间颜色数组（建议与 active 长度一致）
             * 仅在 enableRoomSelection 为 true 且房间“未选中”时生效
             */
            inactive: YOUR_INACTIVE_COLORS,
            /**
             * 普通展示模式下的颜色数组（可选）
             * 仅在 enableRoomSelection 为 false 时生效，若不配置则默认使用 active 颜色
             */
            normal: YOUR_NORMAL_COLORS,
          },
          // 选择指示器配置
          selectionIndicator: {
            /**
             * 描边颜色
             * - 设置为固定颜色值如 '#ffffff' 时，所有选择指示器的描边和尾部箭头都使用该颜色
             * - 设置为 'auto' 时，描边和尾部箭头颜色将自动跟随 selectionIndicatorBackground 的主题色
             */
            strokeColor: '#ffffff', // 或 'auto'
          },
        },
      }}
      runtime={{
        enableRoomSelection,
        selectRoomIds,
        // 选中的房间上显示✅标记
        roomSelectionMode: 'checkmark',
      }}
      onMapReady={handleMapReady}
      onClickRoom={handleClickRoom}
    />
  )
}
```

## 房间分割

通过分割线将一个房间分割成多个房间。

::: tip
我们建议搭配选择房间的功能一起使用。
:::

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const [mapApi, setMapApi] = useState<MapApi | null>(null)
  const [enableRoomSelection, setEnableRoomSelection] = useState(true)
  const [selectRoomIds, setSelectRoomIds] = useState<number[]>([])
  const [dividingRoomId, setDividingRoomId] = useState<number>(-1)

  // 地图准备就绪时触发
  const handleMapReady = () => {
    setMapApi(mapApi)
  }

  // 点击房间时触发
  const handleClickRoom = (room: RoomProperty) => {
    // 该房间进入分割状态，会出现分割线
    setDividingRoomId(room.id)
    // (建议) 选中该房间让它处于高亮状态
    setSelectRoomIds([room.id])
  }

  const handleSaveDividing = async () => {
    // 获取分割线数据
    const points = await mapApi?.getEffectiveDividerPoints()

    yourSaveDividingFunction(points)
  }

  return (
    <RobotMap
      config={{
        divider: {
          lineColor: '#ff4444',
          dashLineWidth: 2,
        },
      }}
      runtime={{
        dividingRoomId,
        enableRoomSelection,
        selectRoomIds,
      }}
      onMapReady={handleMapReady}
      onClickRoom={handleClickRoom}
    />
  )
}
```

## 地图控制元素

包含虚拟墙、禁扫区域、禁拖区域、清扫划区、定点框等与扫地机设备进行交互的元素。

::: tip
地图控制元素是纯受控的，取决于你传入的prop数据
:::

::: warning
每个地图控制元素都需要有唯一的**id**，你可以自行定义或通过 `nanoid` 等库生成。重复的**id**可能会导致地图控制元素无法正常工作。
:::

### 虚拟墙

虚拟墙是由两个端点坐标构成的线段。

```tsx
import React from 'react'
import { RobotMap, VirtualWallParam } from '@ray-js/robot-map'

const MapPage = () => {
  // 将设备上报的虚拟墙数据绘制到地图上
  const [virtualWalls, setVirtualWalls] = useState<VirtualWallParam[]>([
    {
      id: 'wall1',
      points: [
        { x: 0, y: 0 },
        { x: 20, y: 20 },
      ],
    },
    {
      id: 'wall2',
      points: [
        { x: -10, y: 0 },
        { x: -10, y: 10 },
      ],
    },
  ])

  const [editingVirtualWallIds, setEditingVirtualWallIds] = useState<string[]>(
    [],
  )

  // 点击虚拟墙的删除按钮时触发
  const handleRemoveVirtualWall = (id: string) => {
    setVirtualWalls(virtualWalls.filter((wall) => wall.id !== id))
  }

  // 手势操作虚拟墙后触发
  const handleUpdateVirtualWall = (wall: VirtualWallParam) => {
    // 强烈建议在onUpdate回调中更新业务侧的数据
    setVirtualWalls(
      virtualWalls.map((item) => (item.id === wall.id ? wall : item)),
    )
  }

  // 点击虚拟墙时触发
  const handleClickVirtualWall = (wall: VirtualWallParam) => {
    // 切换到编辑状态
    setEditingVirtualWallIds([wall.id])
  }

  const handleSaveVirtualWall = () => {
    // 保存下发虚拟墙数据
    yourSaveVirtualWallFunction(virtualWalls)
  }

  return (
    <RobotMap
      config={{
        controls: {
          virtualWall: {
            lineColor: '#ff4444',
            lineWidth: 2,
            // ... 其他配置
          },
        },
      }}
      runtime={{
        editingVirtualWallIds,
      }}
      virtualWalls={virtualWalls}
      onRemoveVirtualWall={handleRemoveVirtualWall}
      onUpdateVirtualWall={handleUpdateVirtualWall}
      onClickVirtualWall={handleClickVirtualWall}
    />
  )
}
```

### 禁扫区域/禁拖区域/清扫划区

禁扫区域、禁拖区域和清扫划区都是由四个顶点坐标构成的矩形区域，各自具有独立的配置、参数和方法。

```tsx
// 以禁扫区域为例
import React from 'react'
import { RobotMap, ZoneParam } from '@ray-js/robot-map'

const MapPage = () => {
  const [forbiddenSweepZones, setForbiddenSweepZones] = useState<ZoneParam[]>([
    {
      id: 'forbiddenSweepZone',
      points: [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 20 },
        { x: 0, y: 20 },
      ],
    },
  ])
  const [editingForbiddenSweepZoneIds, setEditingForbiddenSweepZoneIds] =
    useState<string[]>([])

  // 点击禁扫区域的删除按钮时触发
  const handleRemoveForbiddenSweepZone = (id: string) => {
    setForbiddenSweepZones(forbiddenSweepZones.filter((zone) => zone.id !== id))
  }

  // 手势操作禁扫区域后触发
  const handleUpdateForbiddenSweepZone = (zone: ZoneParam) => {
    setForbiddenSweepZones(
      forbiddenSweepZones.map((item) => (item.id === zone.id ? zone : item)),
    )
  }

  // 点击禁扫区域时触发
  const handleClickForbiddenSweepZone = (zone: ZoneParam) => {
    // 切换到编辑状态
    setEditingForbiddenSweepZoneIds([zone.id])
  }

  const handleSaveForbiddenSweepZone = () => {
    // 保存下发禁扫区域数据
    yourSaveForbiddenSweepZoneFunction(forbiddenSweepZones)
  }

  return (
    <RobotMap
      config={{
        controls: {
          forbiddenSweepZone: {
            strokeColor: '#ff4444',
            strokeWidth: 2,
            fillColor: 'rgba(255, 68, 68, 0.1)',
            // ... 其他配置
          },
        },
      }}
      runtime={{
        editingForbiddenSweepZoneIds,
      }}
      forbiddenSweepZones={forbiddenSweepZones}
      onRemoveForbiddenSweepZone={handleRemoveForbiddenSweepZone}
      onUpdateForbiddenSweepZone={handleUpdateForbiddenSweepZone}
      onClickForbiddenSweepZone={handleClickForbiddenSweepZone}
    />
  )
}
```

### 自定义区域

除了内置的禁扫区域、禁拖区域和清扫划区之外，如果业务上还需要其他类型的矩形区域（例如"宠物清洁区"、"重点清扫区"等），可以通过**自定义区域**能力来扩展，避免借用内置区域带来的语义混淆。

自定义区域在使用方式上与内置区域保持一致（矩形、四个顶点、支持编辑/旋转/缩放），但走一条独立的通用 API 通道：

- 类型声明放在 `config.customZoneTypes` 下，key 为你自定义的类型名
- 数据通过 `customZones` prop 按类型分组传入，形如 `Record<type, ZoneParam[]>`
- 编辑态通过 `runtime.editingCustomZoneIds` 按类型分组传入，形如 `Record<type, string[]>`
- 事件通过 `onClickCustomZone / onUpdateCustomZone / onRemoveCustomZone` 触发，回调的第一个参数是类型名，第二个参数是区域数据

::: tip

- 内置的三种区域继续沿用各自的 `config.controls.*`、`onRemove/Update/ClickXxxZone` 等专属 API，不受影响。
- 自定义区域与内置区域的 **id 空间是各自独立的**，只要在同一类型内唯一即可。

:::

以"宠物清洁区域"为例：

```tsx
import React, { useState } from 'react'
import { RobotMap, ZoneParam } from '@ray-js/robot-map'

const PET_CLEAN = 'petCleanZone'

const MapPage = () => {
  const [petCleanZones, setPetCleanZones] = useState<ZoneParam[]>([
    {
      id: 'petClean-1',
      points: [
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 30 },
        { x: 0, y: 30 },
      ],
      // 可以挂载业务侧的元数据，SDK 会原样透传
      metadata: { priority: 'high' },
    },
  ])
  const [editingPetCleanIds, setEditingPetCleanIds] = useState<string[]>([])

  // 点击自定义区域时触发，第一个参数是类型名
  const handleClickCustomZone = (type: string, zone: ZoneParam) => {
    if (type !== PET_CLEAN) return
    // 切换到编辑状态
    setEditingPetCleanIds([zone.id])
  }

  // 手势操作后触发
  const handleUpdateCustomZone = (type: string, zone: ZoneParam) => {
    if (type !== PET_CLEAN) return
    setPetCleanZones((prev) =>
      prev.map((item) => (item.id === zone.id ? zone : item)),
    )
  }

  // 点击删除按钮时触发
  const handleRemoveCustomZone = (type: string, id: string) => {
    if (type !== PET_CLEAN) return
    setPetCleanZones((prev) => prev.filter((zone) => zone.id !== id))
  }

  return (
    <RobotMap
      config={{
        customZoneTypes: {
          [PET_CLEAN]: {
            minSize: 1,
            strokeColor: '#7c3aed',
            strokeWidth: 2,
            fillColor: 'rgba(124, 58, 237, 0.15)',
            outlineStrokeColor: '#7c3aed',
            outlineFillColor: 'rgba(124, 58, 237, 0.05)',
            textColor: '#7c3aed',
            iconWrapperFillColor: '#7c3aed',
          },
        },
      }}
      runtime={{
        editingCustomZoneIds: {
          [PET_CLEAN]: editingPetCleanIds,
        },
      }}
      customZones={{
        [PET_CLEAN]: petCleanZones,
      }}
      onClickCustomZone={handleClickCustomZone}
      onUpdateCustomZone={handleUpdateCustomZone}
      onRemoveCustomZone={handleRemoveCustomZone}
    />
  )
}
```

::: tip 和内置区域的关系

自定义类型的样式字段和 `controls.forbiddenSweepZone` 等内置区域一致（`strokeColor` / `fillColor` / `minSize` / `maxSize` / `editing` / `normal` 等），未声明的字段会回退到 SDK 默认值。

:::

### 定点框

定点框是由一个中心点坐标和固定尺寸参数构成的矩形区域。

```tsx
import React from 'react'
import { RobotMap, SpotParam } from '@ray-js/robot-map'

const MapPage = () => {
  const [spots, setSpots] = useState<SpotParam[]>([
    {
      id: 'spot',
      point: { x: 0, y: 0 },
    },
  ])
  const [editingSpotIds, setEditingSpotIds] = useState<string[]>([])

  // 手势操作定点框后触发
  const handleUpdateSpot = (spot: SpotParam) => {
    setSpots(spots.map((item) => (item.id === spot.id ? spot : item)))
  }

  // 点击定点框时触发
  const handleClickSpot = (spot: SpotParam) => {
    // 切换到编辑状态
    setEditingSpotIds([spot.id])
  }

  return (
    <RobotMap
      config={{
        controls: {
          spot: {
            // 这里的单位是米
            size: 1,
            strokeColor: '#5d68fe',
            strokeWidth: 2,
            fillColor: 'rgba(93, 104, 254, 0.1)',
          },
        },
      }}
      runtime={{
        editingSpotIds,
      }}
      spots={spots}
      onUpdateSpot={handleUpdateSpot}
      onClickSpot={handleClickSpot}
    />
  )
}
```

::: tip

- 虽然在设计上是纯受控的，但地图控制元素在手势操作时会先在内部实时进行更新，并在手势结束后通过 `onUpdate` 回调抛出最新的数据。

- 为保证一致性，我们强烈建议始终在 `onUpdate` 回调更新业务侧的数据。这个更新不会产生额外的渲染，你无需担心。
  :::

## 新增地图控制元素

借助受控的设计，新增一个地图控制元素非常简单，以虚拟墙为例：

::: tip
新增其他地图控制元素的方式也是类似的，重点在于如何维护好数据和运行时状态。
:::

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const [virtualWalls, setVirtualWalls] = useState<VirtualWallParam[]>([])

  return (
    <View>
      <RobotMap virtualWalls={virtualWalls} />
      <Button
        onClick={() => {
          setVirtualWalls([
            ...virtualWalls,
            {
              id: 'newVirtualWall',
              points: [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
              ],
            },
          ])
        }}
      >
        新增虚拟墙
      </Button>
    </View>
  )
}
```

但通常你会基于视口中心来新增地图控制元素，我们提供了对应的API：

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const [virtualWalls, setVirtualWalls] = useState<VirtualWallParam[]>([])
  const [editingVirtualWallIds, setEditingVirtualWallIds] = useState<string[]>(
    [],
  )

  const handleAddVirtualWall = () => {
    // 获取基于视口中心的虚拟墙端点坐标
    const wallPoints = mapApi.getWallPointsByViewportCenter({
      // 这里的单位是米
      width: 2,
      direction: 'horizontal',
    })
    setVirtualWalls([
      ...virtualWalls,
      { id: 'newVirtualWall', points: wallPoints },
    ])
    // 通常新增的元素会被立刻设置为编辑状态
    setEditingVirtualWallIds(['newVirtualWall'])
  }

  return (
    <View>
      <RobotMap
        runtime={{
          editingVirtualWallIds,
        }}
        virtualWalls={virtualWalls}
      />
      <Button onClick={handleAddVirtualWall}>新增虚拟墙</Button>
    </View>
  )
}
```

### 基于任意中心点生成矩形顶点

除了 `*ByViewportCenter` 家族默认使用视口中心外，SDK 还提供通用方法 `getRectPointsByCenter`：调用方显式传入中心点，返回矩形的四个顶点坐标。适用于围绕机器人当前位置、已保存的锚点、或回放数据中的坐标来生成禁扫区域、清扫划区、自定义区域等。

```tsx
const robot = mapApi.snapshot().robot
const points = mapApi.getRectPointsByCenter({
  center: { x: robot.x, y: robot.y }, // 机器人位置，地图坐标系
  width: 2,                            // 米
  height: 1.5,                         // 米
  // applyMapRotation 默认 true，矩形在屏幕上视觉保持正放；
  // 如果你只需要地图坐标系下的轴对齐矩形，传 false。
})

setCustomZones([
  ...customZones,
  { id: 'newZone', type: 'custom', points },
])
```

## 房间信息

### 数据处理

房间信息的展示完全受控于你传入的 `roomProperties` 数据。

```ts
// 房间属性类型
export type RoomProperty = {
  /** 房间唯一标识符 */
  id: number
  /** 房间名称 */
  name: string
  /** 清洁次数 */
  cleanTimes: number
  /** 清洁顺序 */
  order: number
  /** 地面类型 */
  floorType: number
  /** 拖地模式 */
  yMop: number
  /** 吸力 */
  suction?: number | null
  /** 水量 */
  cistern?: number | null
  /** 清洁模式 */
  cleanMode?: number | null
  /** 房间类型 */
  type?: number | null
  /** 自定义属性 */
  customData?: Record<string, any>
}
```

对于不同的扫地机协议 `roomProperties` 的获取方式不同。

- 点阵协议：可以通过 `decodeRoomProperties` 方法解析原始地图数据获取

```ts
import { decodeRoomProperties } from '@ray-js/robot-map'

const mapData = 'your_map_data_string'
const roomProperties = decodeRoomProperties(mapData)
```

- 结构化协议：使用 [`requestRoomProperty`](https://developer.tuya.com/cn/miniapp/solution-panel/ability/special/robot-vacuum/ability-set/mqtt#%E8%AF%B7%E6%B1%82%E6%88%BF%E9%97%B4%E5%B1%9E%E6%80%A7) 来获取

```ts
import { useRoomProperty } from '@ray-js/robot-data-stream'
const { devId } = useDevice((device) => device.devInfo)
const { requestRoomProperty } = useRoomProperty(devId)

requestRoomProperty()
  .then((response) => {
    console.log('房间属性数据:', response)

    // 这里需要将响应数据转换为 `RoomProperty[]` 类型作为 `roomProperties`
  })
  .catch((error) => {
    console.error('请求失败:', error)
  })
```

### 房间类型图标

SDK 支持在房间名称旁边显示预设的房间类型图标（如客厅、卧室、厨房等）。

#### 配置图标资源

你可以通过 `config.room.type` 配置图标的大小、位置以及自定义图标资源：

```tsx
<RobotMap
  config={{
    room: {
      type: {
        // 图标显示在文字左侧
        position: 'left',
        // 图标与文字间距
        gap: 6,
        // 图标大小
        iconSize: 16,
        // 背景容器配置
        container: {
          visible: true,
          size: 24,
          borderRadius: 4,
        },
      }
    }
  }}
/>
```

#### 使用图标

在传入的 `roomProperties` 数据中包含 `type` 字段（数值类型），SDK 会自动根据索引从内置图标库或自定义资源中加载图标。

**示例代码：**

```tsx
const roomProperties = [
  {
    id: 1,
    name: '客厅',
    type: 1 // 对应内置图标：客厅
  },
  {
    id: 2,
    name: '主卧',
    type: 3 // 对应内置图标：主卧
  }
]
```

#### 动态控制显示

通过 `runtime.showRoomType` 可以全局控制类型图标的显示与隐藏：

```tsx
<RobotMap
  runtime={{
    showRoomType: true // 开启显示
  }}
/>
```

### 自定义属性

如果需要在房间气泡中显示自定义属性，可以这样：

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const roomProperties: RoomProperty[] = [
    {
      /** 其他房间属性 */
      customData: {
        customProperty1: 1,
      },
    },
    {
      /** 其他房间属性 */
      customData: {
        customProperty2: 2,
      },
    },
  ]
  return (
    <RobotMap
      config={{
        room: {
          property: {
            displayOrders: [
              'cleanMode',
              'suction',
              'cistern',
              'cleanTimes',
              // 自定义属性的字段，需要和customData里的字段一致 (自定义属性目前仅支持数值型字段)
              'customProperty1',
            ],
          },
          customAssets: {
            // 自定义属性的图标资源，其索引和customData.customProperty1的值对应
            customProperty1: [
              'your_custom_property_asset_url_0',
              'your_custom_property_asset_url_1',
              'your_custom_property_asset_url_2',
              'your_custom_property_asset_url_3',
            ],
          },
        },
      }}
      roomProperties={roomProperties}
    />
  )
}
```

如果当前使用的地图数据是点阵协议的，一般通过 [`decodeRoomProperties`](/reference/utils#decoderoomproperties) 方法解析地图数据获取 `roomProperties` 数据。

如果想通过协议里的预留字段来添加自定义属性，可以这样：

```ts
import { decodeRoomProperties } from '@ray-js/robot-map'

const mapData = 'your_map_data_string'

const handleReservedStr = (reservedStr: string) => {
  // reservedStr 为协议里的字节型预留字段
  // 解析预留字段，返回自定义属性
  return {
    customData: yourDecodeCustomDataFunction(reservedStr),
  }
}

// 通过handleReservedStr函数解析得到的对象会被合并到roomProperties中
const roomProperties = decodeRoomProperties(mapData, handleReservedStr)
```

## 设置清扫顺序

房间清扫顺序的显示完全受控于 `roomProperties` 中的 `order` 字段。借助这个设计，你可以灵活地在业务侧实现设置清扫顺序的功能。

```tsx
import React, { useMemo, useState } from 'react'
import { RobotMap, RoomData, RoomProperty } from '@ray-js/robot-map'

const MapPage = () => {
  const roomProperties = YOUR_ROOM_PROPERTIES
  // 临时的清扫顺序状态
  const [tempCleaningOrder, setTempCleaningOrder] = useState<
    Record<number, number>
  >({})

  // 合并原始数据和临时的清扫顺序状态
  const finalRoomProperties = useMemo(() => {
    return roomProperties.map((room) => ({
      ...room,
      order: tempCleaningOrder[room.id] ?? room.order ?? 0,
    }))
  }, [roomProperties, tempCleaningOrder])

  // (可选) 有顺序的房间设置为选中状态
  const selectRoomIds = useMemo(() => {
    return finalRoomProperties
      .filter((room) => room.order > 0)
      .map((room) => room.id)
  }, [finalRoomProperties])

  const handleClickRoom = (room: RoomData) => {
    const currentOrder =
      finalRoomProperties.find((r) => r.id === room.id)?.order || 0

    setTempCleaningOrder((prev) => {
      if (currentOrder > 0) {
        // 取消顺序，其他房间顺序递减
        const updates = { ...prev, [room.id]: 0 }
        finalRoomProperties.forEach((r) => {
          if (r.order > currentOrder) {
            const originalOrder =
              roomProperties.find((orig) => orig.id === r.id)?.order || 0
            updates[r.id] = (prev[r.id] ?? originalOrder) - 1
          }
        })
        return updates
      }

      // 设置新顺序
      const maxOrder = Math.max(0, ...finalRoomProperties.map((r) => r.order))
      return { ...prev, [room.id]: maxOrder + 1 }
    })
  }

  return (
    <RobotMap
      runtime={{
        enableRoomSelection: true,
        roomSelectionMode: 'order',
        selectRoomIds,
        showRoomOrder: true,
      }}
      // 传入合并后的房间数据
      roomProperties={finalRoomProperties}
      onClickRoom={handleClickRoom}
    />
  )
}
```

如果你的产品偏好从头开始设置，可以这样初始化 `tempCleaningOrder`。

```tsx
// 初始返回一个所有房间order为0的对象即可
const [tempCleaningOrder, setTempCleaningOrder] = useState<
  Record<number, number>
>(() =>
  roomProperties.reduce((acc, room) => {
    acc[room.id] = 0
    return acc
  }, {}),
)
```

::: tip

这体现了 `Tuya Robot Map` 纯受控设计的优势，你可以自由主导地图的状态。

:::

## 途径点

途径点用于定义机器需要途径的位置，移动机器人产品可以依据途径点进行定点巡航。

```tsx
import React, { useState } from 'react'
import { RobotMap, WayPointParam } from '@ray-js/robot-map'

const MapPage = () => {
  const [wayPoints, setWayPoints] = useState<WayPointParam[]>([])
  const [editingWayPointIds, setEditingWayPointIds] = useState<string[]>([])

  // 通过点击地图获取的坐标来新增途径点
  const handleClickMap = (point: Point) => {
    const id = nanoid()
    setWayPoints([...wayPoints, { id, point }])
    setEditingWayPointIds([id])
  }

  // 更新途径点坐标
  const handleUpdateWayPoint = (wayPoint: WayPointParam) => {
    setWayPoints(
      wayPoints.map((item) => (item.id === wayPoint.id ? wayPoint : item)),
    )
  }

  // 点击途径点时切换到编辑状态
  const handleClickWayPoint = (wayPoint: WayPointParam) => {
    setEditingWayPointIds([wayPoint.id])
  }

  return (
    <RobotMap
      runtime={{
        // 启用地图点击捕获，点击地图时会触发onClickMap回调
        enableMapClickCapture: true,
        // 正在编辑的途径点ID列表
        editingWayPointIds,
      }}
      wayPoints={wayPoints}
      onClickMap={handleClickMap}
      onUpdateWayPoint={handleUpdateWayPoint}
      onClickWayPoint={handleClickWayPoint}
    />
  )
}
```

## 检测物体

将扫地机识别到的物体显示在地图上。

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const [detectedObjects, setDetectedObjects] = useState<DetectedObjectParam[]>(
    [
      {
        id: 'detectedObject',
        x: 0,
        y: 0,
        src: 'xxx',
      },
    ],
  )

  const handleClickDetectedObject = (object: DetectedObjectParam) => {
    console.log('点击了检测物体:', object.id)
    console.log('物体位置:', object.x, object.y)
    console.log('物体图标:', object.src)
  }

  return (
    <RobotMap
      config={{
        detectedObject: {
          height: 24,
          width: 24,
          // 是否可点击
          interactive: true,
        },
      }}
      detectedObjects={detectedObjects}
      onClickDetectedObject={handleClickDetectedObject}
    />
  )
}
```

## 家具

家具功能用于在地图上放置和编辑家具图片（如床、沙发、桌子等）。家具使用和禁区相同的四点坐标结构，但以图片方式渲染，并支持点击式旋转（每次旋转 90 度）。

### 基本用法

通过 `furnitures` prop 传入家具数据，并通过 `runtime.editingFurnitureIds` 控制哪些家具处于编辑状态。

```tsx
import React, { useState } from 'react'
import { RobotMap, FurnitureParam } from '@ray-js/robot-map'

const MapPage = () => {
  const [furnitures, setFurnitures] = useState<FurnitureParam[]>([])
  const [editingFurnitureIds, setEditingFurnitureIds] = useState<string[]>([])

  const handleAddFurniture = async () => {
    const points = await mapApi.getFurniturePointsByViewportCenter({
      furnitureType: 1,
    })
    const id = nanoid()
    setFurnitures([...furnitures, { id, furnitureType: 1, points }])
    setEditingFurnitureIds([id])
  }

  const handleUpdateFurniture = (furniture: FurnitureParam) => {
    setFurnitures(
      furnitures.map((item) =>
        item.id === furniture.id ? furniture : item,
      ),
    )
  }

  const handleRemoveFurniture = (id: string) => {
    setFurnitures(furnitures.filter((item) => item.id !== id))
  }

  const handleClickFurniture = (furniture: FurnitureParam) => {
    setEditingFurnitureIds([furniture.id])
  }

  return (
    <RobotMap
      config={{
        furniture: {
          assets: [
            {
              type: 1,
              src: 'path/to/bed-image.png',
              width: 1.8,
              height: 2.0,
            },
          ],
        },
      }}
      runtime={{
        editingFurnitureIds,
      }}
      furnitures={furnitures}
      onUpdateFurniture={handleUpdateFurniture}
      onRemoveFurniture={handleRemoveFurniture}
      onClickFurniture={handleClickFurniture}
    />
  )
}
```

### 自定义家具素材

通过 `config.furniture.assets` 配置多种家具类型：

```tsx
<RobotMap
  config={{
    furniture: {
      assets: [
        { type: 1, src: '/assets/bed.png', width: 1.8, height: 2.0 },
        { type: 2, src: '/assets/sofa.png', width: 2.0, height: 0.8 },
        { type: 3, src: '/assets/table.png', width: 1.2, height: 1.2 },
      ],
    },
  }}
/>
```

每个素材的 `type` 字段与 `FurnitureParam.furnitureType` 对应，SDK 会根据类型自动加载匹配的图片资源。`width`/`height` 单位为米，用于确定通过 `getFurniturePointsByViewportCenter()` 新增家具时的初始尺寸，SDK 内部会根据地图 `resolution` 自动转换为像素坐标。

### 旋转方向

默认情况下，点击旋转按钮会顺时针旋转 90 度。你可以通过 `config.furniture.rotateDirection` 切换为逆时针：

```tsx
<RobotMap
  config={{
    furniture: {
      rotateDirection: 'ccw',
    },
  }}
/>
```

### 缩放限制

通过 `minScaleRatio` 和 `maxScaleRatio` 可以限制家具的缩放范围：

```tsx
<RobotMap
  config={{
    furniture: {
      minScaleRatio: 0.5, // 最小缩小到 50%
      maxScaleRatio: 2,   // 最大放大到 200%
    },
  }}
/>
```

设置 `minScaleRatio: 0` 表示不限制最小缩放，设置 `maxScaleRatio: Infinity` 表示不限制最大缩放。

### 相关配置项

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| [`furniture.assets`](/reference/config#furniture-assets) | `[内置双人床]` | 家具素材列表 |
| [`furniture.opacity`](/reference/config#furniture-opacity) | `1` | 家具图片透明度 |
| [`furniture.rotateDirection`](/reference/config#furniture-rotatedirection) | `'cw'` | 旋转方向 |
| [`furniture.minScaleRatio`](/reference/config#furniture-minscaleratio) | `0.5` | 最小缩放倍数 |
| [`furniture.maxScaleRatio`](/reference/config#furniture-maxscaleratio) | `2` | 最大缩放倍数 |
| [`furniture.iconWrapperFillColor`](/reference/config#furniture-iconwrapperfillcolor) | `'#26a69a'` | 编辑按钮颜色 |

## 自定义地毯

自定义地毯允许用户在地图上放置和编辑地毯区域。与地图协议中内置的地毯数据不同，自定义地毯是用户定义的叠加层，支持完整的增删改操作。

### 地图地毯 vs 自定义地毯

| 特性 | 地图地毯 | 自定义地毯 |
|------|----------|------------|
| **来源** | 协议数据（来自机器人） | 用户定义 |
| **交互** | 仅查看 | 支持拖拽、旋转、缩放、删除 |
| **可见性** | `runtime.showCarpet` | `runtime.showCarpet` + `editingCarpetIds` / `selectedCarpetIds` |

### 基本用法

通过 `customCarpets` prop 传入地毯数据。支持三种形状：`rectangle`（矩形）、`round`（圆形/椭圆形）、`custom`（自定义多边形）。

```tsx
import React, { useState } from 'react'
import { RobotMap, CustomCarpetParam } from '@ray-js/robot-map'

const MapPage = () => {
  const [customCarpets, setCustomCarpets] = useState<CustomCarpetParam[]>([
    {
      id: 'carpet1',
      type: 1,
      shape: 'rectangle',
      points: [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 250 },
        { x: 100, y: 250 },
      ],
    },
    {
      id: 'carpet2',
      type: 2,
      shape: 'round',
      points: [
        { x: 400, y: 100 },
        { x: 600, y: 100 },
        { x: 600, y: 300 },
        { x: 400, y: 300 },
      ],
    },
  ])

  return (
    <RobotMap
      customCarpets={customCarpets}
      config={{
        carpet: {
          enableEdit: true,
          opacity: 0.5,
          scale: 0.2,
        },
      }}
      // ... 其他属性
    />
  )
}
```

### 在视口中心创建地毯

你可以通过 `getCustomCarpetPointsByViewportCenter()` 生成一组四点坐标，
再由业务层自己补 `id`、`type` 和 `shape`。同一组 `points` 既可以用于
矩形地毯，也可以用于圆形或椭圆形地毯。

```tsx
const handleAddCarpet = (shape: 'rectangle' | 'round') => {
  const points = mapApi.getCustomCarpetPointsByViewportCenter({
    width: 2,
    height: 1.2,
    offsetX: 20,
  })

  setCustomCarpets((prev) => [
    ...prev,
    {
      id: `carpet-${prev.length + 1}`,
      type: selectedMaterialType,
      shape,
      points,
    },
  ])
}
```

`shape: 'custom'` 仍然需要业务层自行提供多边形顶点，这个 helper 不会
生成自定义轮廓。

### 编辑地毯

通过 `runtime.editingCarpetIds` 控制哪些地毯处于编辑状态。编辑模式下，地毯会显示删除、旋转和缩放控制按钮，用户可以通过手势进行拖拽移动。`controls.carpet.rotateMode` 用于切换点击旋转 90 度和按住拖动连续旋转；`controls.carpet.scaleMode` 用于切换自由缩放和等比缩放。

```tsx
const MapPage = () => {
  const [customCarpets, setCustomCarpets] = useState<CustomCarpetParam[]>([
    // ...
  ])

  const handleUpdateCustomCarpet = (carpet: CustomCarpetParam) => {
    setCustomCarpets((prev) =>
      prev.map((c) => (c.id === carpet.id ? carpet : c))
    )
  }

  const handleDeleteCustomCarpet = (carpet: { id: string }) => {
    setCustomCarpets((prev) => prev.filter((c) => c.id !== carpet.id))
  }

  return (
    <RobotMap
      customCarpets={customCarpets}
      runtime={{
        editingCarpetIds: ['carpet1'],
      }}
      config={{
        carpet: { enableEdit: true },
      }}
      onUpdateCustomCarpet={handleUpdateCustomCarpet}
      onDeleteCustomCarpet={handleDeleteCustomCarpet}
    />
  )
}
```

### 选中状态

通过 `runtime.selectedCarpetIds` 可以设置地毯的选中高亮状态（仅显示边框，不显示编辑按钮）。适用于用户选择了某个地毯但尚未进入编辑模式的场景。

```tsx
<RobotMap
  customCarpets={customCarpets}
  runtime={{
    selectedCarpetIds: ['carpet1'],
  }}
  onClickCarpet={(carpet) => {
    // 用户点击了地毯，可以进入选中或编辑状态
    console.log('点击了地毯:', carpet.id)
  }}
/>
```

### 材质贴图

通过 `config.carpet.material` 可以为不同 `type` 的地毯配置不同的贴图素材。如果未配置 `material`，则所有地毯使用 `config.carpet.src` 作为默认贴图。

```tsx
<RobotMap
  config={{
    carpet: {
      enableEdit: true,
      material: [
        { type: 1, src: 'path/to/wool-texture.png' },
        { type: 2, src: 'path/to/silk-texture.png' },
      ],
    },
  }}
  customCarpets={[
    { id: 'c1', type: 1, shape: 'rectangle', points: [...] },
    { id: 'c2', type: 2, shape: 'round', points: [...] },
  ]}
/>
```

::: tip
- `rectangle` 和 `round` 形状支持旋转和缩放；`custom`（自定义多边形）仅显示删除按钮，旋转、缩放、移动和辅助缩放按钮都会隐藏。
- 地毯尺寸由 [`controls.carpet.minSize`](/reference/config#controls-carpet-minsize)（默认 1 米）和可选的 [`controls.carpet.maxSize`](/reference/config#controls-carpet-maxsize)（默认不限制）控制。
- 编辑模式需要同时设置 `config.carpet.enableEdit: true` 和 `runtime.editingCarpetIds`。
- [`controls.carpet.rotateMode`](/reference/config#controls-carpet-rotatemode) 默认为 `step`；设置为 `free` 后，旋转按钮改为按住拖动连续旋转。
- [`controls.carpet.scaleMode`](/reference/config#controls-carpet-scalemode) 默认为 `ratioLocked`；设置为 `free` 后，右下角按钮改为自由缩放，并隐藏横向、纵向辅助缩放按钮。
:::

### 相关配置

| 配置 | 默认值 | 说明 |
|------|--------|------|
| [`carpet.src`](/reference/config#carpet-src) | 内置资源 | 默认地毯贴图 |
| [`carpet.opacity`](/reference/config#carpet-opacity) | `0.5` | 贴图透明度 |
| [`carpet.scale`](/reference/config#carpet-scale) | `0.2` | 贴图缩放比例 |
| [`carpet.material`](/reference/config#carpet-material) | - | 按类型配置不同贴图素材 |
| [`carpet.enableEdit`](/reference/config#carpet-enableedit) | `false` | 是否启用编辑功能 |
| [`controls.carpet.minSize`](/reference/config#controls-carpet-minsize) | `1` | 最小尺寸（米） |
| [`controls.carpet.maxSize`](/reference/config#controls-carpet-maxsize) | `undefined` | 最大尺寸（米，可选） |
| [`controls.carpet.iconWrapperFillColor`](/reference/config#controls-carpet-iconwrapperfillcolor) | `'#5d68fe'` | 非删除按钮背景色 |
| [`controls.carpet.deleteIconWrapperFillColor`](/reference/config#controls-carpet-deleteiconwrapperfillcolor) | `'#ff4444'` | 删除按钮背景色 |
| [`controls.carpet.rotateMode`](/reference/config#controls-carpet-rotatemode) | `'step'` | 旋转按钮交互模式 |
| [`controls.carpet.scaleMode`](/reference/config#controls-carpet-scalemode) | `'ratioLocked'` | 右下角缩放按钮交互模式 |
| [`controls.carpet.fillColor`](/reference/config#controls-carpet-fillcolor) | `rgba(93,104,254,0.1)` | 编辑区域填充色 |

## 自定义元素

你可以在地图上显示自定义的元素，它们完全受控于 `customElements` 中的数据。

目前支持自定义的元素有：

- 图片
- GIF
- HTML

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const handleClickCustomElement = (element: CustomElementParam) => {
    console.log('点击了自定义元素:', element.id)
    console.log('元素类型:', element.type)
    console.log('自定义数据:', element.customData)
  }

  return (
    <RobotMap
      customElements={[
        {
          id: 'customImage',
          type: 'image',
          src: 'xxx',
          x: 30,
          y: 30,
          width: 32,
          height: 32,
          interactive: true,
          customData: {
            value: 'xxx',
          },
        },
        {
          id: 'customGif',
          type: 'gif',
          src: 'xxx',
          x: -60,
          y: -60,
          width: 32,
          height: 32,
        },
        {
          id: 'customHtml',
          type: 'html',
          htmlContent: 'xxx',
          x: 0,
          y: 0,
        },
      ]}
      onClickCustomElement={handleClickCustomElement}
      // ... 其他属性
    />
  )
}
```

::: tip
自定义元素的 `sizeFixed` 默认值为 `true`，表示元素的尺寸不会跟随地图缩放。
:::

::: warning
注意，如果将自定义 **html** 元素的 `sizeFixed` 设置为 `false`，请不要传入 `width` 和 `height` 属性，否则可能导致问题。
:::

## 截图

### 为当前地图截图

你可以调用 `snapshot` 方法为当前地图截图。截图时会自动添加一个临时的背景层以保证颜色渲染正确。

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const handleMapReady = async (mapApi) => {
    // 默认使用 config.global.backgroundColor 作为背景
    const base64 = await mapApi.snapshot()

    // 或者指定截图时的背景颜色
    // const base64 = await mapApi.snapshot({ backgroundColor: '#ffffff' })

    console.log('截图成功:', base64)
  }
  return <RobotMap onMapReady={handleMapReady} />
}
```

### 使用其他地图数据进行截图

你可以调用 `snapshotByData` 方法使用其他地图数据进行截图。这对于在多地图管理页面生成缩略图非常有用。

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const handleMapReady = async (mapApi) => {
    const base64 = await mapApi.snapshotByData(
      {
        map: 'your_map_data_string',
        path: 'your_path_data_string',
        roomProperties: your_room_properties_data,
        customElements: your_custom_elements_data,
      },
      {
        showPath: false,
        showRoomProperty: true,
      },
      {
        backgroundColor: '#000000', // 指定截图背景色
      },
    )
    console.log('截图成功:', base64)
  }

  return <RobotMap onMapReady={handleMapReady} />
}
```

::: tip
使用其他地图数据进行截图时，`config` 会沿用当前地图实例的配置，但你可以通过第二个参数自由决定它的 `runtime` 状态，以及通过第三个参数指定 `backgroundColor`。
:::

## 地图旋转

控制地图旋转非常简单，只需要设置 `runtime.mapRotation` 即可。在地图旋转后，组件会自动对地图做一次自适应居中。

::: tip
房间信息 / 检测物体 / 自定义元素 会始终保持水平方向，不受地图旋转影响。

:::

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  return <RobotMap runtime={{ mapRotation: 90 }} />
}
```

## 在弹窗里使用 RjsRobotMap

通常在弹窗里需要展示地图的时候会使用 `RjsRobotMap` 组件。

当需要在弹窗（Popup）组件中使用 `RjsRobotMap` 时，需要特别注意组件的初始化时机。由于弹窗组件在未打开之前通常不会渲染 DOM，如果此时 `RjsRobotMap` 已经开始初始化，可能会因为无法获取到容器 DOM 的尺寸而导致地图加载异常。

正确的做法是通过弹窗的 `onAfterEnter` 回调来确保弹窗 DOM 渲染完成后再初始化地图组件。

同时，建议为 `RjsRobotMap` 包装一个带有明确宽高的容器，无需在 `config` 中设置 `containerHeight` 和 `containerWidth`。

```tsx
import React, { useState } from 'react'
import { View } from '@ray-js/ray'
import { Popup } from '@ray-js/smart-ui'
import { RjsRobotMap } from '@ray-js/robot-map'

const MapPage = () => {
  const [show, setShow] = useState(false)
  const [isReady, setIsReady] = useState(false)

  return (
    <Popup
      show={show}
      position="bottom"
      round
      onAfterEnter={() => {
        // 弹窗 DOM 渲染完成后，设置 isReady 为 true
        setIsReady(true)
      }}
      onAfterLeave={() => {
        // 弹窗关闭时，重置 isReady 状态
        setIsReady(false)
      }}
    >
      <View
        className={styles.container}
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: '560rpx',
          width: '654rpx',
        }}
      >
        {/* 只有当 isReady 为 true 时才渲染地图组件 */}
        {isReady && (
          <RjsRobotMap runtime={{ showPath: false, showRoomProperty: true }} />
        )}
      </View>
    </Popup>
  )
}
```

## 小程序异层渲染手势优化

在小程序环境（Ray 框架）中使用地图 SDK 时，由于小程序采用**异层渲染（Heterogeneous Rendering）**架构，原生组件（如 `CoverView`）与 WebView 之间的层级和事件传递逻辑存在特殊性。

### 问题场景

最典型的场景是**禁区拖拽**：

在小程序地图页中，通常会有底部的操作栏（如“添加禁区”、“保存”等功能按钮，通常使用 `CoverView` 实现）。当用户在 WebView 中拖拽一个禁区（ForbiddenZone）时：

1. **事件劫持**：如果手指滑动到了底部 `CoverView` 区域，由于原生组件的层级高于 WebView，触摸事件会被原生层劫持。
2. **事件丢失**：当用户在 `CoverView` 之上松开手指时，WebView 无法接收到 `pointerup` 事件。
3. **状态异常**：由于丢失了关键的松手信号，SDK 内部无法正常闭合交互流程，导致本该在松手时触发的 `onUpdateForbiddenSweepZone`（或其他控制元素回调）无法执行。这会造成数据同步中断，表现为禁区无法保存位置或“卡死”在拖拽状态。

### 最佳实践：动态切换组件

解决该问题的推荐方案是：**在手势开始时，将底部的原生组件（CoverView）动态切换为普通组件（View），在手势结束时再恢复。**

由于普通 `View` 在小程序中由 WebView 渲染，它不会劫持手势事件，从而保证了 Web 侧能收到完整的事件链路。

```tsx
const MapEditPage = () => {
  const [isGesturing, setIsGesturing] = useState(false)

  // 在手势进行中切换为 View，静止时恢复为 CoverView 以保证层级覆盖
  const BottomWrapper = isGesturing ? View : CoverView

  return (
    <View>
      <RobotMap
        // 关键回调：手势开始（包括平移、缩放、拖拽控制元素）
        onGestureStart={() => setIsGesturing(true)}
        // 关键回调：手势结束（手指全部抬起或异常中断）
        onGestureEnd={() => setIsGesturing(false)}
      />

      <BottomWrapper className="bottom-bar">{/* 内容 */}</BottomWrapper>
    </View>
  )
}
```

### 进阶容错：forceEndGesture

在某些极端情况下，如果你在小程序侧通过原生能力检测到了用户松手，可以作为“双保险”调用 API 强制结束。

```tsx
const handleTouchEndAtNative = () => {
  if (mapApi) {
    mapApi.forceEndGesture()
  }
}
```

::: tip 提示
地图 SDK 内部已针对双指缩放时的快速松手做了防抖缓冲处理，搭配上述方案可获得最佳手势体验。
:::
