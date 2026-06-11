# 配置

了解 RobotMap 的配置选项，用于定制地图的视觉样式、素材资源、交互行为等。

::: tip 响应式配置

配置是**响应式**的，当你修改传入的 `config` prop 时，地图会自动更新视觉效果，无需重新初始化。这使得主题切换、颜色调整等功能的实现变得简单直接。

:::

::: tip

- 本文档部分配置项的单位与**米**相关，该配置的值会根据地图数据里的分辨率转换为像素单位。

:::

## 使用示例

### 基础配置

配置通过 `config` 传递，所有配置项都是可选的，你可以只覆盖需要修改的部分。

```tsx
import React from 'react'
import { RobotMap } from '@ray-js/robot-map'

function MapPage() {
  const config = useMemo(() => {
    return {
      global: {
        backgroundColor: 0xf6f6f6,
      },
      path: {
        commonPath: { color: '#ffffff' },
        chargePath: { color: '#800080' },
      },
      robot: {
        icon: {
          width: 24,
          height: 24,
          src: 'path/to/robot-icon.png',
        },
      },
      interaction: {
        enableDoubleTapZoom: true,
      },
    }
  }, [])

  return (
    <RobotMap
      config={config}
      // ... 其他props
    />
  )
}
```

**类型**: `DeepPartialAppConfig`

配置对象的所有属性都是可选的，你可以只覆盖需要修改的部分：

```tsx
<RobotMap
  config={{
    global: { backgroundColor: '#f6f6f6' }, // 覆盖默认值
    robot: {
      icon: { width: 12, height: 12 },
      speed: 0.3,
    },
  }}
/>
```

### 响应式配置 - 主题切换示例

配置是响应式的，修改 `config` prop 会自动更新地图视觉效果。以下是一个主题切换的示例：

```tsx
import React, { useState, useMemo } from 'react'
import { RobotMap } from '@ray-js/robot-map'

function MapPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const config = useMemo(() => {
    return theme === 'light'
      ? {
          global: { backgroundColor: '#f6f6f6' },
          map: { obstacleColor: '#999999', freeColor: '#ebebeb' },
          room: {
            colors: {
              active: ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399'],
              name: ['#2563b8', '#26966b', '#7c3fb8', '#d97706'],
            },
          },
          path: { commonPath: { color: '#ffffff' } },
        }
      : {
          global: { backgroundColor: '#1a1a1a' },
          map: { obstacleColor: '#404040', freeColor: '#2a2a2a' },
          room: {
            colors: {
              active: ['#3b5998', '#2d6a4f', '#6a1b9a', '#d97706'],
              name: ['#6b9bf7', '#4ade80', '#b794f6', '#fbbf24'],
            },
          },
          path: { commonPath: { color: '#64748b' } },
        }
  }, [theme])

  return (
    <>
      <button
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      >
        切换主题
      </button>
      <RobotMap config={config} />
    </>
  )
}
```

::: tip
当你点击按钮切换主题时，`config` 对象会根据 `theme` 状态重新计算，地图会自动响应配置变化并更新视觉效果。
:::

### 响应式配置（主题切换）

配置是响应式的，当你修改 `config` prop 时，地图会自动更新。以下是一个主题切换的示例：

```tsx
import React, { useState, useMemo } from 'react'
import { RobotMap } from '@ray-js/robot-map'

function MapPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const config = useMemo(
    () => ({
      global: {
        backgroundColor: theme === 'light' ? '#f6f6f6' : '#1a1a1a',
      },
      map: {
        obstacleColor: theme === 'light' ? '#999999' : '#404040',
        freeColor: theme === 'light' ? '#ebebeb' : '#2a2a2a',
      },
      room: {
        colors: {
          active:
            theme === 'light'
              ? ['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399']
              : ['#3b5998', '#2d6a4f', '#6a1b9a', '#d97706'],
          name:
            theme === 'light'
              ? ['#2563b8', '#26966b', '#7c3fb8', '#d97706']
              : ['#6b9bf7', '#4ade80', '#b794f6', '#fbbf24'],
        },
      },
      path: {
        commonPath: {
          color: theme === 'light' ? '#ffffff' : '#64748b',
        },
      },
    }),
    [theme],
  )

  return (
    <>
      <button
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      >
        切换到{theme === 'light' ? '暗黑' : '浅色'}主题
      </button>
      <RobotMap config={config} />
    </>
  )
}
```

::: tip 性能提示
使用 `useMemo` 包裹配置对象可以避免不必要的重新渲染。只有当依赖项（如 `theme`）变化时，配置才会重新计算，地图才会更新。
:::

## global

全局容器配置，控制地图容器的位置、尺寸和背景。

### global.containerTop

- **类型**: `string`
- **默认值**: `'0px'`

容器距离顶部的位置。支持 `px`、`%`、`vw`、`vh`、`rpx` 单位。

### global.containerLeft

- **类型**: `string`
- **默认值**: `'0px'`

容器距离左侧的位置。支持 `px`、`%`、`vw`、`vh`、`rpx` 单位。

### global.containerWidth

- **类型**: `string`
- **默认值**: `'100%'`

容器宽度。支持 `px`、`%`、`vw`、`vh`、`rpx` 单位。

### global.containerHeight

- **类型**: `string`
- **默认值**: `'100%'`

容器高度。支持 `px`、`%`、`vw`、`vh`、`rpx` 单位。

### global.backgroundColor

- **类型**: `ColorSource`
- **默认值**: `'#f6f6f6'`

地图容器纯色背景颜色。该颜色也将作为 `snapshot` 和 `snapshotByData` 方法的默认背景颜色。

::: tip 背景优先级
SDK 支持三种背景类型，按以下优先级应用：

1. **图片背景**（`backgroundImage`）- 优先级最高
2. **渐变背景**（`backgroundGradient`）- 优先级中等
3. **纯色背景**（`backgroundColor`）- 优先级最低

当同时配置多种背景时，优先级高的会覆盖优先级低的。例如，如果同时设置了 `backgroundImage` 和 `backgroundColor`，最终只会显示图片背景。
:::

### global.backgroundGradient

- **类型**: [`BackgroundGradient`](/reference/types#backgroundgradient)
- **默认值**: `undefined`

渐变背景配置，支持线性渐变和径向渐变。

#### 线性渐变示例

```typescript
{
  global: {
    backgroundGradient: {
      type: 'linear',
      x0: 0,      // 起点x（0-1，相对于视口宽度）
      y0: 0,      // 起点y（0-1，相对于视口高度）
      x1: 1,      // 终点x
      y1: 1,      // 终点y
      colorStops: [
        { offset: 0, color: '#667eea' },
        { offset: 1, color: '#764ba2' }
      ]
    }
  }
}
```

**常见渐变方向：**

- 从上到下：`x0: 0.5, y0: 0, x1: 0.5, y1: 1`
- 从左到右：`x0: 0, y0: 0.5, x1: 1, y1: 0.5`
- 对角线：`x0: 0, y0: 0, x1: 1, y1: 1`

#### 径向渐变示例

```typescript
{
  global: {
    backgroundGradient: {
      type: 'radial',
      cx: 0.5,    // 中心x（0-1，相对于视口宽度）
      cy: 0.5,    // 中心y（0-1，相对于视口高度）
      r: 0.7,     // 半径（0-1，相对于视口对角线长度）
      colorStops: [
        { offset: 0, color: '#667eea' },
        { offset: 0.5, color: '#764ba2' },
        { offset: 1, color: '#f093fb' }
      ]
    }
  }
}
```

::: warning 渐变平滑度
为了获得更平滑的渐变效果，建议：

- 添加更多中间颜色停靠点（colorStops）
- 使用色相接近的颜色
- 避免颜色对比过于强烈

当前版本的径向渐变使用线性渐变模拟，效果可能与真正的径向渐变略有不同。

**如果渐变效果不理想**，可以考虑使用图片背景来替代，图片背景可以提供更高质量和更精细的渐变效果。
:::

### global.backgroundImage

- **类型**: [`BackgroundImage`](/reference/types#backgroundimage)
- **默认值**: `undefined`

图片背景配置，支持多种图片适应模式。

```typescript
{
  global: {
    backgroundImage: {
      src: 'https://example.com/background.jpg',  // 图片URL
      fit: 'cover',      // 'fill' | 'contain' | 'cover' | 'none'
      position: {        // 可选，默认居中(0.5, 0.5)
        x: 0.5,         // 0-1，相对于视口
        y: 0.5
      },
      repeat: false     // 是否平铺（暂未实现）
    }
  }
}
```

**fit 模式说明：**

- `fill`：拉伸填充整个视口
- `contain`：完整显示图片，保持宽高比，可能有留白
- `cover`（默认）：覆盖整个视口，保持宽高比，可能裁剪
- `none`：原始尺寸显示

### global.backgroundAlpha

- **类型**: `number`
- **默认值**: `1`

地图容器背景透明度。

::: warning 注意
该配置仅对**纯色背景** (`backgroundColor`) 和**图片背景** (`backgroundImage`) 生效。

对于**渐变背景** (`backgroundGradient`)，请直接在 `colorStops` 中使用 `rgba` 颜色值（如 `'rgba(255, 255, 255, 0.5)'`）来控制透明度。
:::

### global.performanceMode

- **类型**: `boolean`
- **默认值**: `false`

是否开启高性能模式。开启后，SDK 会优化渲染性能（如强制关闭抗锯齿、共享时钟等），建议在多地图展示等对性能要求较高的场景下开启。

### global.resolution

- **类型**: `number`
- **默认值**: `window.devicePixelRatio`

渲染分辨率倍率。通常不需要手动设置，SDK 会自动获取设备的像素密度。在性能极度受限的场景下，可以手动将其设为 `1` 或 `1.5` 来降低 GPU 渲染压力。

### global.enableLogger

- **类型**: `boolean`
- **默认值**: `import.meta.env.DEV`

是否启用日志输出的旧配置项。当设置为 `true` 时，SDK 会输出内部日志（`Logger.log`、`Logger.warn`、`Logger.error`、`Logger.debug`、`Logger.success`）；当设置为 `false` 时，所有日志都不会输出。

::: tip
默认值会跟随构建环境：开发环境通常为 `true`，生产环境通常为 `false`。
建议仅在排查问题时开启此选项。

对于新接入，优先使用 `logger.enabled`。`global.enableLogger` 仅作为控制控制台日志的兼容兜底，不再负责 App 日志转发。
:::

### global.rendererPreference

- **类型**: `'webgpu' | 'webgl'`
- **默认值**: `'webgl'`

渲染器偏好，设置 PIXI.js 优先使用的渲染后端。

默认值使用 `webgl`，优先选择更稳定、兼容性更高的渲染路径。如果你需要验证
`webgpu` 的表现，可以显式传入 `global.rendererPreference: 'webgpu'`。SDK 在
初始化阶段遇到 `webgpu` 启动失败时，会自动回退到 `webgl`，并输出对应告警。

## logger

`logger` 配置用于控制 SDK 的控制台日志和可选的宿主日志转发。这一组配置不会强依赖任何业务日志库；只有当宿主层实现了 `onLogger` 回调时，日志才会被转发到 App 层。

### logger.enabled

`logger.enabled` 控制 SDK 在 webview 控制台中的日志输出。

- **类型**: `boolean`
- **默认值**: `import.meta.env.DEV`

当设置为 `true` 时，SDK 会输出内部日志到控制台；当设置为 `false` 时，控制台日志关闭。这个字段优先级高于 `global.enableLogger`。

### logger.hostSinkEnabled

`logger.hostSinkEnabled` 控制是否尝试把结构化日志转发给宿主层。

- **类型**: `boolean`
- **默认值**: `false`

当设置为 `true` 时，SDK 会在满足 `hostLevels` 过滤条件后，把日志 payload 转发给宿主层的 `onLogger` 回调。如果宿主层没有实现 `onLogger`，SDK 会静默跳过，不会报错。

### logger.hostLevels

`logger.hostLevels` 控制哪些日志级别会被转发到宿主层。

- **类型**: `Array<'warn' | 'error' | 'info' | 'debug'>`
- **默认值**: `['warn', 'error']`

默认只转发 `warn` 和 `error`。如果你需要在诊断阶段同时采集 `info` 或 `debug`，可以显式把这些级别加入数组中。

渲染链路的额外诊断日志，例如 renderer 初始化信息、地图清空告警，以及
WebGL context 丢失或恢复事件，会使用 `debug`、`warn` 或 `error` 级别输出。
如果你要排查“地图突然消失但没有恢复”这类问题，建议在临时诊断窗口里把
`debug` 加入 `hostLevels`。

### logger.tag

`logger.tag` 用于标识日志来源，方便宿主层在 App 日志里检索和过滤。

- **类型**: `string`
- **默认值**: `'ray-robot-map-sdk'`

业务侧可以直接使用这个字段作为日志前缀，也可以组合自己的 App tag 一起输出。

## interaction

交互配置，控制地图的缩放和手势操作。

### interaction.zoomRange

缩放范围配置。

#### interaction.zoomRange.min

- **类型**: `number`
- **默认值**: `0.5`

地图初始化后，支持的最小缩放倍数

#### interaction.zoomRange.max

- **类型**: `number`
- **默认值**: `8`

地图初始化后，支持的最大缩放倍数

### interaction.fitMinScale

- **类型**: `number`
- **默认值**: `1`

自适应缩放时的最小比例。限制地图缩小的最小程度。

### interaction.fitMaxScale

- **类型**: `number`
- **默认值**: `4`

自适应缩放时的最大比例。限制地图放大的最大程度。

::: tip
关于自适应缩放的完整说明，包括触发时机、计算逻辑和常见问题，请参阅 [自适应缩放](/guide/advanced-usage#自适应缩放)。
:::

### interaction.enable

- **类型**: `boolean`
- **默认值**: `true`

是否开启地图交互总控。设置为 `false` 时，将完全从底层禁用地图的缩放、平移和点击等交互事件监听，极大减少交互带来的性能开销。

### interaction.enableDoubleTapZoom

- **类型**: `boolean`
- **默认值**: `true`

是否启用双击缩放功能

### interaction.enableRobotClick

- **类型**: `boolean`
- **默认值**: `false`

是否启用扫地机器人的点击交互功能。

### interaction.enableChargingStationClick

- **类型**: `boolean`
- **默认值**: `false`

是否启用充电桩的点击交互功能。

## map

地图配置。

### map.autoPaddingHorizontalPercent

- **类型**: `number`
- **默认值**: `0.05`

地图自适应时水平方向保留的最小边距比例（相对于视口宽度）。地图完成自适应后，左右边距不小于该比例值。

### map.autoPaddingVerticalPercent

- **类型**: `number`
- **默认值**: `0.05`

地图自适应时垂直方向保留的最小边距比例（相对于视口高度）。地图完成自适应后，上下边距不小于该比例值。

::: tip
这两个配置用于计算自适应缩放时的初始缩放比例。关于自适应缩放的完整说明，请参阅 [自适应缩放](/guide/advanced-usage#自适应缩放)。
:::

### map.obstacleColor

- **类型**: `ColorSource`
- **默认值**: `'#999999'`

障碍点显示颜色。

### map.freeColor

- **类型**: `ColorSource`
- **默认值**: `'#ebebeb'`

自由区域点显示颜色。(仅结构化地图可用)

### map.autoFitOffset

- **类型**: `{ x: number; y: number }`
- **默认值**: `{ x: 0, y: 0 }`
- **单位**: `px`

地图自适应时的偏移量。

用于在地图自适应居中显示时，手动指定一个偏移值（例如为了避开底部的 Footer 组件或顶部的 Header 组件），使地图在视觉上保持在显示区域的中心。

### map.adjacencyThreshold

- **类型**: `number`
- **默认值**: `3`
- **单位**: `px`

房间相邻判定阈值。

用于判断两个房间是否相邻的算法。两个房间的边界点距离小于等于此阈值时，认为它们相邻。

### map.originChangeAutoFitThreshold

- **类型**: `number`
- **默认值**: `2`

地图原点变化自适应阈值。当地图 origin 的 x 或 y 变化超过此值时，将触发自适应缩放。

::: tip
这是触发自适应缩放的条件之一。关于自适应缩放的完整说明，请参阅 [自适应缩放](/guide/advanced-usage#自适应缩放)。
:::

### map.sizeChangeAutoFitThreshold

- **类型**: `number`
- **默认值**: `10`

地图尺寸变化自适应阈值。当地图宽度或高度变化超过此值时，将触发自适应缩放。

::: tip
这是触发自适应缩放的条件之一。关于自适应缩放的完整说明，请参阅 [自适应缩放](/guide/advanced-usage#自适应缩放)。
:::

## heatmap

热力图配置，控制信号强度热力图的渲染效果。

### heatmap.cellSize

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

热力图单元格大小。

### heatmap.maxDistance

- **类型**: `number`
- **默认值**: `14`
- **单位**: `px`

热力图影响的最大距离。

### heatmap.smoothIterations

- **类型**: `number`
- **默认值**: `10`

热力图平滑迭代次数。

### heatmap.heatmapAlpha

- **类型**: `number`
- **默认值**: `0.8`

热力图透明度 (0-1)。

### heatmap.useGradient

- **类型**: `boolean`
- **默认值**: `true`

是否启用颜色渐变。关闭后会使用统一色阶渲染。

### heatmap.colorGradients

- **类型**: `[ColorSource, ColorSource, ColorSource, ColorSource, ColorSource, ColorSource, ColorSource, ColorSource]`
- **默认值**: `['#FF3B30', '#FF7A00', '#FFA100', '#FFD700', '#99DD70', '#2EC070', '#40E0D0', '#88D0E9']`

热力图颜色渐变配置，从高强度到低强度。

## room

房间配置，控制房间的颜色、名称、属性显示等。

### room.colors

房间颜色配置对象。

::: tip 智能配色
SDK 使用**智能配色算法**，自动确保相邻房间颜色不同。

- **建议至少提供 4 种颜色**（基于[四色定理](https://zh.wikipedia.org/wiki/%E5%9B%9B%E8%89%B2%E5%AE%9A%E7%90%86)，4种颜色足以满足平面地图需求）
- 所有数组类型的颜色配置（`active`、`inactive`、`name`、`propertyTheme` 等）**建议长度一致**
- 如果有复杂的相邻房间情况，可以尝试增加更多的颜色，以确保相邻房间颜色不同

关于智能配色算法的完整说明、配色策略和实际案例，请参阅 [房间智能配色](/guide/advanced-usage#房间智能配色)。
:::

### room.colors.sortBy

- **类型**: `'index' | 'area'`
- **默认值**: `'index'`

房间颜色排序方式。

- `index`：按房间ID排序，保持颜色分配稳定。
- `area`：按房间面积排序，大房间将优先分配索引靠前的颜色。

::: warning
使用 `area` 可能会导致机器导航过程中颜色的突然变化(房间大小变化引起)，建议谨慎使用。
:::

### room.colors.strategy

- **类型**: `'priority' | 'balanced'`
- **默认值**: `'priority'`

房间颜色分配策略。

- `priority`：靠前优先，索引靠前的颜色将被优先使用。
- `balanced`：均匀分配，颜色将被尽可能均匀地使用。

#### room.colors.active

- **类型**: `string[]`
- **默认值**: `['#a8c8f5', '#9de5c7', '#d4b9f7', '#ffd399']`

房间激活状态的颜色数组。

::: tip

- **当 `enableRoomSelection: true` 时**：代表“被选中”房间的填充色。
- **当 `enableRoomSelection: false` 时**：若未定义 `room.colors.normal`，默认使用此配置。
  :::

#### room.colors.inactive

- **类型**: `string[]`
- **默认值**: `['#d6e7fc', '#d1f4e5', '#ece0fb', '#fff0d9']`

房间非激活状态的颜色数组。

::: tip
仅在 `enableRoomSelection: true` 且房间“未被选中”时生效。
:::

颜色索引与 `active` 对应，建议长度保持一致。

#### room.colors.normal

- **类型**: `string[]`
- **默认值**: `undefined`

房间在普通展示模式下的填充颜色数组。

::: tip
仅在 `enableRoomSelection: false` 时生效。若未定义，默认使用 `room.colors.active` 的配置。
:::

#### room.colors.name

- **类型**: `string[]`
- **默认值**: `['#2563b8', '#26966b', '#7c3fb8', '#d97706']`

房间名称标签的颜色数组。

::: tip

- **当 `enableRoomSelection: true` 时**：代表“被选中”房间的文字颜色。
- **当 `enableRoomSelection: false` 时**：若未定义 `room.colors.nameNormal`，默认使用此配置。
  :::

颜色索引与 `active` 对应，建议长度保持一致。

#### room.colors.nameInactive

- **类型**: `string[]`
- **默认值**: `undefined`

房间名称标签在非激活状态下的颜色数组。

::: tip
仅在 `enableRoomSelection: true` 且房间“未被选中”时生效。
:::

如果不配置，则默认使用 `room.colors.name`。

#### room.colors.nameNormal

- **类型**: `string[]`
- **默认值**: `undefined`

房间名称标签在普通展示模式下的颜色数组。

::: tip
仅在 `enableRoomSelection: false` 时生效。若未定义，默认使用 `room.colors.name` 的配置。
:::

#### room.colors.propertyTheme

- **类型**: `string[]`
- **默认值**: `['#2563b8', '#26966b', '#7c3fb8', '#d97706']`

房间属性图标主题颜色数组。

::: tip

- **当 `enableRoomSelection: true` 时**：代表“被选中”房间的图标颜色。
- **当 `enableRoomSelection: false` 时**：若未定义 `room.colors.propertyThemeNormal`，默认使用此配置。
  :::

颜色索引与 `active` 对应，建议长度保持一致。

#### room.colors.propertyThemeInactive

- **类型**: `string[]`
- **默认值**: `undefined`

房间属性图标在非激活状态下的颜色数组。

::: tip
仅在 `enableRoomSelection: true` 且房间“未被选中”时生效。
:::

如果不配置，则默认使用 `room.colors.propertyTheme`。

#### room.colors.propertyThemeNormal

- **类型**: `string[]`
- **默认值**: `undefined`

房间属性图标在普通展示模式下的主题颜色数组。

::: tip
仅在 `enableRoomSelection: false` 时生效。若未定义，默认使用 `room.colors.propertyTheme` 的配置。
:::

#### room.colors.selectionIndicatorBackground

- **类型**: `string[]`
- **默认值**: `['#2563b8', '#26966b', '#7c3fb8', '#d97706']`

选择指示器背景颜色数组。

颜色索引与 `active` 对应，建议长度保持一致。

#### room.colors.selectionIndicatorIcon

- **类型**: `string[]`
- **默认值**: `['#ffffff', '#ffffff', '#ffffff', '#ffffff']`

选择指示器图标颜色数组。

颜色索引与 `active` 对应，建议长度保持一致。

#### room.colors.NO_ROOM_DATA

- **类型**: `string`
- **默认值**: `'#ebebeb'`

无房间数据区域的颜色 (点阵协议专用)。

#### room.colors.ROOM_GAP

- **类型**: `string`
- **默认值**: `'#ebebeb'`

房间间隙的颜色 (点阵协议专用)。

#### room.colors.OBSTACLE_ROOM

- **类型**: `string`
- **默认值**: `'#ebebeb'`

障碍物房间的颜色 (点阵协议专用)。

#### room.colors.UNKNOWN_ROOM

- **类型**: `string`
- **默认值**: `'#ebebeb'`

未知房间的颜色。对于结构化协议代表 `roomId >= 255` 的房间颜色。

#### room.colors.VERSION0_ROOM

- **类型**: `string`
- **默认值**: `''`

点阵地图协议版本0的房间颜色 (点阵协议专用)。

::: tip 版本兼容说明
此配置项用于控制地图协议版本0（未支持分区的协议版本）中房间的颜色。在之前的版本中，版本0的房间和无房间数据区域都使用 `NO_ROOM_DATA` 颜色。现已将版本0的房间单独拆分为 `VERSION0_ROOM`。

默认值为空字符串，此时将自动使用 `NO_ROOM_DATA` 的颜色，以保持向后兼容。如需区分显示，可配置为不同的颜色值。
:::

### room.nameLabel

房间名称标签配置。

#### room.nameLabel.fontSize

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

房间名称字体大小。

#### room.nameLabel.fontFamily

- **类型**: `string`
- **默认值**: `'system-ui, -apple-system, sans-serif'`

房间名称字体名称。

#### room.nameLabel.fontWeight

- **类型**: `TextStyleFontWeight`
- **默认值**: `'500'`

房间名称字体粗细。

### room.type

房间类型图标配置。

#### room.type.assets

- **类型**: `string[]`
- **默认值**: `[内置资源, ...]`

房间类型图标资源数组。

数组索引对应 `RoomProperty.type` 值，即 `assets[type]` 显示该索引对应的图标。

**内置默认资源映射表：**

以下是内置默认图标与 `type` 值的对应关系：

| ID (索引) | 房间类型  |
| :-------- | :-------- |
| 0         | 通用/房间 |
| 1         | 客厅      |
| 2         | 餐厅      |
| 3         | 主卧      |
| 4         | 次卧/卧室 |
| 5         | 书房      |
| 6         | 厨房      |
| 7         | 卫生间    |
| 8         | 洗衣房    |
| 9         | 休息室    |
| 10        | 储物间    |
| 11        | 儿童房    |
| 12        | 阳光房    |
| 13        | 走廊      |
| 14        | 阳台      |
| 15        | 健身房    |
| 16        | 玄关      |

当使用内置默认资源时，索引与房间类型的对应关系详见[房间类型图标](/guide/advanced-usage#房间类型图标)。如果开发者通过此配置项自定义了数组，则映射关系完全取决于自定义数组的顺序。

::: tip
如果某个索引对应的资源为空字符串（`''`），则该类型的房间将不会显示任何图标。例如，通过设置 `assets[0] = ''` 可以隐藏 type 为 0 的房间图标。
:::

#### room.type.iconSize

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

房间类型图标大小。

#### room.type.gap

- **类型**: `number`
- **默认值**: `4`
- **单位**: `px`

图标与房间名称文字之间的间距。

#### room.type.position

- **类型**: `'left' | 'right'`
- **默认值**: `'left'`

图标相对于房间名称文字的显示位置。

#### room.type.container

房间类型图标背景容器配置。

##### room.type.container.visible

- **类型**: `boolean`
- **默认值**: `true`

是否显示背景容器。

::: tip

- **颜色逻辑**：
  - 当开启背景容器（`container.visible: true`）时，背景将填充为房间名称颜色（`room.colors.name`），图标将自动设置为白色（`tint: #ffffff`）。
  - 当禁用背景容器（`container.visible: false`）时，图标将直接使用房间名称颜色（`room.colors.name`）。
- **最佳实践**：为了实现自动换色效果，建议使用单色（通常为黑色或白色）的 SVG 资源。如果使用彩色 PNG 资源，建议将 `container.visible` 设为 `false` 以保持原色。
  :::

##### room.type.container.size

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

背景容器大小。

##### room.type.container.borderRadius

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

背景容器圆角大小。

### room.property

房间属性配置。

#### room.property.displayOrders

- **类型**: `('cleanMode' | 'suction' | 'cistern' | 'cleanTimes' | string)[]`
- **默认值**: `['cleanMode', 'suction', 'cistern', 'cleanTimes']`

房间属性显示顺序。

你也可以传入自定义的字段名，比如 `['cleanMode', 'suction', 'cistern', 'cleanTimes', 'customProperty1']`。

::: tip
如果要隐藏某个房间属性，比如 `cleanTimes`，那么清扫次数图标将不会显示。
:::

#### room.property.customAssets

- **类型**: `Record<string, string[]>`
- **默认值**: `undefined`

自定义属性图标资源配置，

你可以传入自定义的字段名和对应的图标资源数组，比如:

```ts
{
  room: {
    property: {
      displayOrders: ['cleanMode', 'suction', 'customProperty1','cistern', 'cleanTimes',  'customProperty2'],
      customAssets: {
        customProperty1: [
          'your_custom_property_asset_url_0',
          'your_custom_property_asset_url_1',
          'your_custom_property_asset_url_2',
          'your_custom_property_asset_url_3',
        ],
        customProperty2: [
          'your_custom_property_asset_url_0',
          'your_custom_property_asset_url_1',
          'your_custom_property_asset_url_2',
          'your_custom_property_asset_url_3',
        ],
      },
    },
  }
}
```

::: tip
使用图标资源时，强烈建议使用白色图标，以便 SDK 能够根据房间主题色（`room.colors.propertyTheme`）自动调整图标颜色。
:::

::: tip
自定义属性配置完成后，还需要由 `roomProperties` 的 `customData` 数据驱动显示。你可以参考[自定义属性](/guide/advanced-usage.md#自定义属性)章节。

目前自定义属性仅支持数值型的字段。
:::

#### room.property.iconWidth

- **类型**: `number`
- **默认值**: `14`
- **单位**: `px`

房间属性图标宽度。

#### room.property.iconHeight

- **类型**: `number`
- **默认值**: `14`
- **单位**: `px`

房间属性图标高度。

#### room.property.foldable

- **类型**: `boolean`
- **默认值**: `true`

房间属性是否可折叠。

#### room.property.offsetX

- **类型**: `number`
- **默认值**: `0`
- **单位**: `px`

房间属性X轴偏移。

#### room.property.offsetY

- **类型**: `number`
- **默认值**: `6`
- **单位**: `px`

房间属性Y轴偏移。

#### room.property.iconGap

- **类型**: `number`
- **默认值**: `0`
- **单位**: `px`

房间属性图标间距。

#### room.property.container

房间属性容器样式配置。

##### room.property.container.backgroundColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

房间属性容器背景颜色。

##### room.property.container.paddingVertical

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

房间属性容器垂直内边距。

##### room.property.container.paddingHorizontal

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

房间属性容器水平内边距。

##### room.property.container.borderRadius

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

房间属性容器边框圆角。

##### room.property.container.tailHeight

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

房间属性容器气泡三角形高度。

##### room.property.container.tailWidth

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

房间属性容器气泡三角形宽度。

#### room.property.suction

吸力图标配置。

##### room.property.suction.assets

- **类型**: `string[]`
- **默认值**: `[内置资源, ...]`

吸力等级图标资源数组。建议传入的图标资源数量与吸力等级数量一致。

数组索引对应 `RoomProperty.suction` 值，即 `assets[suction]` 显示对应等级的图标。

::: tip
使用图标资源时，强烈建议使用白色图标，以便 SDK 能够根据房间主题色（`room.colors.propertyTheme`）自动调整图标颜色。
:::

#### room.property.cistern

水量图标配置。

##### room.property.cistern.assets

- **类型**: `string[]`
- **默认值**: `[内置资源, ...]`

水量图标资源数组。建议传入的图标资源数量与水量等级数量一致。

数组索引对应 `RoomProperty.cistern` 值，即 `assets[cistern]` 显示对应等级的图标。

::: tip
使用图标资源时，强烈建议使用白色图标，以便 SDK 能够根据房间主题色（`room.colors.propertyTheme`）自动调整图标颜色。
:::

#### room.property.cleanMode

清扫模式图标配置。

##### room.property.cleanMode.assets

- **类型**: `string[]`
- **默认值**: `[内置资源, ...]`

清扫模式图标资源数组。建议传入的图标资源数量与清扫模式等级数量一致。

数组索引对应 `RoomProperty.cleanMode` 值，即 `assets[cleanMode]` 显示对应等级的图标。

::: tip
使用图标资源时，强烈建议使用白色图标，以便 SDK 能够根据房间主题色（`room.colors.propertyTheme`）自动调整图标颜色。
:::

#### room.property.cleanTimes

清扫次数图标配置。

##### room.property.cleanTimes.assets

- **类型**: `string[]`
- **默认值**: `[内置资源, ...]`

清扫次数图标资源数组。建议传入的图标资源数量与清扫次数等级数量一致。

数组索引对应 `RoomProperty.cleanTimes - 1` 值，即 `assets[cleanTimes - 1]` 显示对应等级的图标。

::: tip
清扫次数的图标规则相对特殊，因为实际不存在**0次**清扫，所以数组索引需要**减1**。
:::

::: tip
使用图标资源时，强烈建议使用白色图标，以便 SDK 能够根据房间主题色（`room.colors.propertyTheme`）自动调整图标颜色。
:::

#### room.property.cleanOrder

清扫顺序配置。

##### room.property.cleanOrder.color

- **类型**: `ColorSource | 'auto'`
- **默认值**: `'#ffffff'`

清扫顺序文字颜色。

**可选值：**

- **颜色值**（如 `'#ffffff'`、`'rgb(255, 255, 255)'` 等）：所有房间的清扫顺序文字使用固定的颜色
- **`'auto'`**：文字颜色自动跟随 `room.colors.active` 的主题色，实现每个房间的清扫顺序文字与房间填充色保持一致

##### room.property.cleanOrder.fontFamily

- **类型**: `string`
- **默认值**: `'system-ui, -apple-system, sans-serif'`

清扫顺序字体名称。

##### room.property.cleanOrder.fontWeight

- **类型**: `TextStyleFontWeight`
- **默认值**: `'400'`

清扫顺序字体粗细。

##### room.property.cleanOrder.fontSize

- **类型**: `number`
- **默认值**: `10`
- **单位**: `px`

清扫顺序字体大小。

##### room.property.cleanOrder.gapRight

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

清扫顺序右侧间距。

### room.selectionIndicator

房间选择指示器配置。

::: tip
`enableRoomSelection` 为 `true` 时

- 如果 `roomSelectionMode` 为 `checkmark` ，选中的房间会显示选择指示器。
- 如果 `roomSelectionMode` 为 `order` ，选中的房间会显示房间顺序。

:::

#### room.selectionIndicator.iconSrc

- **类型**: `string`
- **默认值**: `内置资源`

选择指示器图标资源路径。

#### room.selectionIndicator.iconWidth

- **类型**: `number`
- **默认值**: `14`
- **单位**: `px`

选择指示器图标宽度。

#### room.selectionIndicator.iconHeight

- **类型**: `number`
- **默认值**: `14`
- **单位**: `px`

选择指示器图标高度。

#### room.selectionIndicator.containerWidth

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

选择指示器容器宽度。

#### room.selectionIndicator.containerHeight

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

选择指示器容器高度。

#### room.selectionIndicator.strokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

选择指示器描边宽度。

#### room.selectionIndicator.strokeColor

- **类型**: `ColorSource | 'auto'`
- **默认值**: `'#ffffff'`

选择指示器描边颜色，同时控制边框和尾部箭头的颜色。

**可选值：**

- **颜色值**（如 `'#ffffff'`、`'rgb(255, 255, 255)'` 等）：所有选择指示器使用固定的描边颜色
- **`'auto'`**：描边颜色自动跟随 `room.colors.selectionIndicatorBackground` 的主题色，实现每个房间的选择指示器边框与背景色保持一致

#### room.selectionIndicator.borderRadius

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

选择指示器边框圆角。

#### room.selectionIndicator.offsetX

- **类型**: `number`
- **默认值**: `0`
- **单位**: `px`

选择指示器X轴偏移。

#### room.selectionIndicator.offsetY

- **类型**: `number`
- **默认值**: `4`
- **单位**: `px`

选择指示器Y轴偏移。

#### room.selectionIndicator.tailHeight

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

选择指示器气泡三角形高度。

#### room.selectionIndicator.tailWidth

- **类型**: `number`
- **默认值**: `6`
- **单位**: `px`

选择指示器气泡三角形宽度。

### room.floorType

地板材质配置。

#### room.floorType.assets

- **类型**: `string[]`
- **默认值**: `['', '内置瓷砖资源', '内置木地板(横向)资源', '内置木地板(纵向)资源']`

地板材质图标资源数组。建议传入的图标资源数量与地板材质等级数量一致。

数组索引对应 `RoomProperty.floorType` 值，即 `assets[floorType]` 显示对应等级的图标。

::: tip

- 强烈建议使用材质的最小重复单元的图片资源以提升性能。
- 通常 `floorType` 值为**0**时，表示无地板材质。这种情况下 `assets[0]` 可以设置为空字符串。
  :::

#### room.floorType.opacity

- **类型**: `number`
- **默认值**: `0.1`

地板材质透明度。

#### room.floorType.scale

- **类型**: `number`
- **默认值**: `0.2`

地板材质缩放系数。

### room.enableElasticScale

- **类型**: `boolean`
- **默认值**: `false`

是否启用 RoomInfo 弹性缩放。

### room.elasticMinScale

- **类型**: `number`
- **默认值**: `0.6`

RoomInfo 最小弹性缩放倍数。

当地图缩小到一定程度时，RoomInfo 会缩小到此倍数。

### room.elasticMaxScale

- **类型**: `number`
- **默认值**: `1.5`

RoomInfo 最大弹性缩放倍数。

当地图放大到一定程度时，RoomInfo 会放大到此倍数。

## path

路径配置。

### path.lineWidthFixed

- **类型**: `boolean`
- **默认值**: `false`

路径线条宽度是否固定（不跟随地图缩放变化）

### path.incrementalThreshold

- **类型**: `number`
- **默认值**: `5`

路径增量绘制检测阈值。

::: tip
地图组件默认会开启路径增量绘制以提升性能。

当传入的路径相比上一次绘制的路径点数量变化不超过 `incrementalThreshold` 时，使用增量绘制 (仅绘制新增的部分)，否则使用全量绘制 (重新绘制整条路径)。

设置为**0**时将关闭路径增量绘制。
:::

### path.commonPath

清扫路径配置。

#### path.commonPath.visible

- **类型**: `boolean`
- **默认值**: `true`

清扫路径是否可见

#### path.commonPath.color

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

清扫路径颜色

#### path.commonPath.width

- **类型**: `number`
- **默认值**: `0.5`
- **单位**: `px`

清扫路径宽度

### path.transitionPath

转场路径配置。

#### path.transitionPath.visible

- **类型**: `boolean`
- **默认值**: `false`

转场路径是否可见

#### path.transitionPath.color

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

转场路径颜色

#### path.transitionPath.width

- **类型**: `number`
- **默认值**: `0.5`
- **单位**: `px`

转场路径宽度

### path.chargePath

回充路径配置。

#### path.chargePath.visible

- **类型**: `boolean`
- **默认值**: `false`

回充路径是否可见

#### path.chargePath.color

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

回充路径颜色

#### path.chargePath.width

- **类型**: `number`
- **默认值**: `0.5`
- **单位**: `px`

回充路径宽度

### path.mopPath

拖地路径配置。

#### path.mopPath.lineVisible

- **类型**: `boolean`
- **默认值**: `true`

拖地核心线是否可见。

#### path.mopPath.lineColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

拖地核心线颜色。

#### path.mopPath.lineWidth

- **类型**: `number`
- **默认值**: `0.5`
- **单位**: `px`

拖地核心线宽度。

#### path.mopPath.trackVisible

- **类型**: `boolean`
- **默认值**: `true`

拖地轨迹（宽度涂抹区域）是否可见。

#### path.mopPath.trackColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

拖地轨迹颜色。

#### path.mopPath.trackAlpha

- **类型**: `number`
- **默认值**: `0.4`

拖地轨迹透明度。

#### path.mopPath.trackWidth

- **类型**: `number`
- **默认值**: `4`
- **单位**: `px`

拖地轨迹宽度。

## carpet

地毯配置，控制地毯区域的显示效果。

### carpet.src

- **类型**: `string`
- **默认值**: `内置资源`

地毯资源路径

::: tip
强烈建议传入最小重复单元的图片资源以提升性能。
:::

### carpet.opacity

- **类型**: `number`
- **默认值**: `0.5`

地毯透明度

### carpet.scale

- **类型**: `number`
- **默认值**: `0.2`

地毯缩放系数

### carpet.material

- **类型**: `{ type: number; src: string; opacity: number; scale: number }[]`
- **默认值**: `undefined`

地毯材质配置，用于按不同 `type` 指定不同的材质资源与渲染参数。

::: tip
当配置 `material` 时，优先级高于 `carpet.src`。
:::

### carpet.enableEdit

- **类型**: `boolean`
- **默认值**: `undefined`（未传时按 `false` 处理）

是否启用地毯编辑能力。非必要不建议开启，以避免额外性能开销。

## furniture

家具配置，控制地图上家具元素的显示和编辑行为。家具是基于图片的地图元素，支持拖拽、缩放和点击旋转操作。

### furniture.assets

- **类型**: `FurnitureAsset[]`
- **默认值**: `[{ type: 1, src: 内置双人床资源, width: 1.8, height: 2.0 }]`

家具素材列表。每个素材定义了一种家具类型的图片资源和默认尺寸。

```typescript
type FurnitureAsset = {
  type: number // 家具类型编号，匹配 FurnitureParam.furnitureType
  src: string // 图片 URL
  width: number // 默认宽度（米）
  height: number // 默认高度（米）
}
```

::: tip
`width` 和 `height` 的单位是米，用于 `getFurniturePointsByViewportCenter()` 生成初始矩形时确定家具的实际尺寸。SDK 内部会根据地图的 `resolution` 自动将米转换为像素坐标。

例如双人床默认 `width: 1.8`（1.8 米）、`height: 2.0`（2.0 米）。
:::

### furniture.opacity

- **类型**: `number`
- **默认值**: `1`

家具图片的全局透明度 (0-1)。

### furniture.iconWrapperFillColor

- **类型**: `ColorSource`
- **默认值**: `'#26a69a'`

编辑按钮（删除、旋转、缩放、移动）图标容器的填充颜色。

### furniture.outlineOffset

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

编辑轮廓相对于家具边界的偏移距离。

### furniture.outlineStrokeColor

- **类型**: `ColorSource`
- **默认值**: `'#26a69a'`

编辑轮廓描边颜色。

### furniture.outlineStrokeWidth

- **类型**: `number`
- **默认值**: `1.5`
- **单位**: `px`

编辑轮廓描边宽度。

### furniture.outlineFillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(38, 166, 154, 0.05)'`

编辑轮廓填充颜色。

### furniture.outlineDashed

- **类型**: `boolean`
- **默认值**: `true`

编辑轮廓是否为虚线。

### furniture.outlineDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`
- **单位**: `px`

编辑轮廓虚线样式 [实线长度, 间隙长度]。

### furniture.showSizeText

- **类型**: `boolean`
- **默认值**: `true`

是否在编辑状态下显示家具的尺寸文本。

### furniture.textColor

- **类型**: `ColorSource`
- **默认值**: `'#26a69a'`

尺寸文本颜色。

### furniture.textPosition

- **类型**: `'top' | 'right' | 'bottom' | 'left'`
- **默认值**: `'bottom'`

尺寸文本显示位置。

### furniture.textOffset

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

尺寸文本距离轮廓的偏移。

### furniture.minScaleRatio

- **类型**: `number`
- **默认值**: `0.5`

缩放按钮允许的最小缩放倍数（相对于初始尺寸）。设为 `0` 表示不限制最小缩放。

### furniture.maxScaleRatio

- **类型**: `number`
- **默认值**: `2`

缩放按钮允许的最大缩放倍数（相对于初始尺寸）。设为 `Infinity` 表示不限制最大缩放。

### furniture.rotateDirection

- **类型**: `'cw' | 'ccw'`
- **默认值**: `'cw'`

点击旋转按钮时的旋转方向。

- `'cw'`：顺时针旋转 90 度
- `'ccw'`：逆时针旋转 90 度

::: tip
旋转后，编辑按钮（删除、旋转、缩放、移动）会保持在各自的视觉位置不变，用户可以连续点击旋转按钮。
:::

### furniture.lockAspectRatio

- **类型**: `boolean`
- **默认值**: `false`

缩放时是否锁定宽高比。启用后，拖拽缩放手柄时宽度和高度将等比例缩放，保持家具原始的宽高比例不变。

## robot

机器人配置，控制机器人图标、动画和预警圈的显示。

### robot.icon

机器人图标配置。

#### robot.icon.sizeFixed

- **类型**: `boolean`
- **默认值**: `false`

机器人图标尺寸是否固定（不跟随地图缩放变化）。

#### robot.icon.width

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

机器人图标宽度。

#### robot.icon.height

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

机器人图标高度。

#### robot.icon.src

- **类型**: `string`
- **默认值**: `内置资源`

机器人图标资源路径。

### robot.speed

- **类型**: `number`
- **默认值**: `0`
- **单位**: `米/秒`

机器人移动速度，用于路径动画。

路径数据变化时，机器人和增量路径会按照 `speed` 配置的速度进行动画。

::: tip
`speed` 设置为**0**可以关闭路径动画，机器人会直接绘制到目标位置。
:::

### robot.rotationCorrection

- **类型**: `number`
- **默认值**: `0`
- **单位**: `度`

机器人图标角度校正，用于校正图标默认朝向。

0度表示图标朝右，角度值按顺时针方向递增。

### robot.sleepAnimation

机器人睡眠动画配置。

#### robot.sleepAnimation.jsonSrc

- **类型**: `string`
- **默认值**: `内置资源`

睡眠动画JSON资源路径，使用[**TexturePacker**](https://www.texturepacker.com/)生成的JSON文件

#### robot.sleepAnimation.imageSrc

- **类型**: `string`
- **默认值**: `内置资源`

睡眠动画图片资源路径，使用[**TexturePacker**](https://www.texturepacker.com/)生成的图片资源。

#### robot.sleepAnimation.imageSrc

- **类型**: `string`
- **默认值**: `内置资源`

睡眠动画图片资源路径，使用[**TexturePacker**](https://www.texturepacker.com/)生成的图片资源。

#### robot.sleepAnimation.framePrefix

- **类型**: `string`
- **默认值**: `'sleep_'`

动画帧名称前缀。

#### robot.sleepAnimation.width

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

睡眠动画宽度。

#### robot.sleepAnimation.height

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

睡眠动画高度。

#### robot.sleepAnimation.sizeFixed

- **类型**: `boolean`
- **默认值**: `false`

睡眠动画尺寸是否固定。

#### robot.sleepAnimation.frameCount

- **类型**: `number`
- **默认值**: `96`

动画总帧数。

#### robot.sleepAnimation.offsetX

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

睡眠动画X轴偏移。

#### robot.sleepAnimation.offsetY

- **类型**: `number`
- **默认值**: `-8`
- **单位**: `px`

睡眠动画Y轴偏移。

### robot.ring

机器人预警圈配置。

#### robot.ring.size

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

预警圈大小。

#### robot.ring.color

- **类型**: `ColorSource`
- **默认值**: `'rgba(255, 68, 68, 0.2)'`

预警圈填充颜色。

#### robot.ring.strokeWidth

- **类型**: `number`
- **默认值**: `1`
- **单位**: `px`

预警圈描边宽度。

#### robot.ring.strokeColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

预警圈描边颜色。

#### robot.ring.strokeDashed

- **类型**: `boolean`
- **默认值**: `true`

预警圈描边是否为虚线。

#### robot.ring.strokeDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 4]`
- **单位**: `px`

预警圈虚线样式 [实线长度, 间隙长度]。

### robot.pulseCircle

机器人脉冲圈配置，控制呼吸动画效果。

#### robot.pulseCircle.size

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

脉冲圈的大小（直径）。

#### robot.pulseCircle.color

- **类型**: `ColorSource`
- **默认值**: `'#4cd964'`

脉冲圈填充颜色。

#### robot.pulseCircle.strokeWidth

- **类型**: `number`
- **默认值**: `0`
- **单位**: `px`

脉冲圈描边宽度。

#### robot.pulseCircle.strokeColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

脉冲圈描边颜色。

#### robot.pulseCircle.duration

- **类型**: `number`
- **默认值**: `1000`
- **单位**: `毫秒`

脉冲圈呼吸动画的持续时间（一个完整的呼吸周期）。

#### robot.pulseCircle.sizeFixed

- **类型**: `boolean`
- **默认值**: `false`

脉冲圈尺寸是否固定（不跟随地图缩放变化）。

#### robot.pulseCircle.minScale

- **类型**: `number`
- **默认值**: `0.5`

呼吸动画的最小缩放比例。

#### robot.pulseCircle.maxScale

- **类型**: `number`
- **默认值**: `1`

呼吸动画的最大缩放比例。

#### robot.pulseCircle.minAlpha

- **类型**: `number`
- **默认值**: `0.5`

呼吸动画的最小透明度（0-1 之间）。

#### robot.pulseCircle.maxAlpha

- **类型**: `number`
- **默认值**: `1`

呼吸动画的最大透明度（0-1 之间）。

::: tip
通过调整 `minScale/maxScale` 和 `minAlpha/maxAlpha` 可以自定义呼吸效果的幅度和透明度变化。
例如，更大的缩放范围（如 0.4 到 1.2）会产生更明显的呼吸效果。
:::

## chargingStation

充电桩配置，控制充电桩图标和预警圈的显示。

### chargingStation.icon

充电桩图标配置。

#### chargingStation.icon.sizeFixed

- **类型**: `boolean`
- **默认值**: `false`

充电桩图标尺寸是否固定。

#### chargingStation.icon.width

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

充电桩图标宽度。

#### chargingStation.icon.height

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

充电桩图标高度。

#### chargingStation.icon.src

- **类型**: `string`
- **默认值**: `内置资源`

充电桩图标资源路径。

### chargingStation.rotationCorrection

- **类型**: `number`
- **默认值**: `0`
- **单位**: `度`

充电桩图标角度校正，用于校正图标默认朝向。

0度表示图标朝右，角度值按顺时针方向递增。

### chargingStation.ring

充电桩预警圈配置。

#### chargingStation.ring.size

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

预警圈大小。

#### chargingStation.ring.color

- **类型**: `ColorSource`
- **默认值**: `'rgba(255, 68, 68, 0.2)'`

预警圈填充颜色。

#### chargingStation.ring.strokeWidth

- **类型**: `number`
- **默认值**: `1`
- **单位**: `px`

预警圈描边宽度。

#### chargingStation.ring.strokeColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

预警圈描边颜色。

#### chargingStation.ring.strokeDashed

- **类型**: `boolean`
- **默认值**: `true`

预警圈描边是否为虚线。

#### chargingStation.ring.strokeDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 4]`
- **单位**: `px`

预警圈虚线样式 [实线长度, 间隙长度]。

## controls

控制元素配置，包括各种编辑工具的样式和行为设置。

### controls.iconWrapperWidth

- **类型**: `number`
- **默认值**: `24`
- **单位**: `px`

操作按钮图标容器宽度

### controls.iconWrapperHeight

- **类型**: `number`
- **默认值**: `24`
- **单位**: `px`

操作按钮图标容器高度

### controls.iconWrapperBorderRadius

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

操作按钮图标容器边框圆角

### controls.iconWidth

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

操作按钮图标宽度

### controls.iconHeight

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

操作按钮图标高度

### controls.deleteIconSrc

- **类型**: `string`
- **默认值**: `内置资源`

删除按钮图标资源路径

### controls.rotateIconSrc

- **类型**: `string`
- **默认值**: `内置资源`

旋转按钮图标资源路径

### controls.scaleIconSrc

- **类型**: `string`
- **默认值**: `内置资源`

缩放按钮图标资源路径

### controls.moveIconSrc

- **类型**: `string`
- **默认值**: `内置资源`

移动按钮图标资源路径

### controls.horizontalScaleIconSrc

- **类型**: `string`
- **默认值**: `内置资源`

横向缩放按钮图标资源路径。

### controls.verticalScaleIconSrc

- **类型**: `string`
- **默认值**: `内置资源`

纵向缩放按钮图标资源路径。

### controls.moveButtonOffset

- **类型**: `number`
- **默认值**: `30`
- **单位**: `px`

移动按钮偏移距离

### controls.textFontSize

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

尺寸标签文本字体大小

### controls.textFontFamily

- **类型**: `string`
- **默认值**: `'system-ui, -apple-system, sans-serif'`

尺寸标签文本字体名称

### controls.textFontWeight

- **类型**: `TextStyleFontWeight`
- **默认值**: `'400'`

尺寸标签文本字体粗细

### controls.renderOrder

- **类型**: `ControlRenderItem[]`
- **默认值**: `['forbiddenSweepZone', 'forbiddenMopZone', 'cleanZone', 'virtualWall', 'spot', 'wayPoint', 'divider']`

控制层内元素渲染顺序配置，数组从下到上生效（后面的元素显示在更上层）。

**可选值：**

- `'forbiddenSweepZone'`
- `'forbiddenMopZone'`
- `'cleanZone'`
- `'virtualWall'`
- `'spot'`
- `'wayPoint'`
- `'divider'`
- 任意通过 [`customZoneTypes`](#customzonetypes) 声明的自定义区域类型名

配置说明：

- 你可以通过调整数组顺序来控制不同控制元素的覆盖关系。
- 如果配置中缺少某些内置元素，SDK 会自动按默认顺序补齐（自定义类型不会被自动补齐）。
- 如果配置中存在重复元素，SDK 仅保留首次出现的位置。
- 未写入 `renderOrder` 的自定义类型会渲染在所有已声明元素之下，且它们之间的相对层级由创建顺序决定；建议把所有需要严格排序的自定义类型都显式写入 `renderOrder`。

示例：让禁扫区域显示在禁拖区域上方

```ts
const app = new MapApplication()

app.initialize({
  config: {
    controls: {
      renderOrder: [
        'forbiddenMopZone',
        'forbiddenSweepZone',
        'cleanZone',
        'virtualWall',
        'spot',
        'wayPoint',
        'divider',
      ],
    },
  },
})
```

### controls.forbiddenSweepZone

禁扫区域配置。

#### controls.forbiddenSweepZone.minSize

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

禁扫区域最小尺寸

#### controls.forbiddenSweepZone.maxSize

- **类型**: `number | undefined`
- **默认值**: `undefined`
- **单位**: `米`

禁扫区域最大尺寸（可选）。缺省、NaN、非正数或 ≤ minSize 时视为不限制，并会在控制台输出一次警告。

#### controls.forbiddenSweepZone.iconWrapperFillColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

图标容器填充颜色

#### controls.forbiddenSweepZone.strokeColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

禁扫区域描边颜色

#### controls.forbiddenSweepZone.strokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

禁扫区域描边宽度

#### controls.forbiddenSweepZone.fillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(255, 68, 68, 0.1)'`

禁扫区域填充颜色

#### controls.forbiddenSweepZone.outlineOffset

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

禁扫区域编辑轮廓偏移

#### controls.forbiddenSweepZone.outlineStrokeColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

禁扫区域编辑轮廓描边颜色

#### controls.forbiddenSweepZone.outlineStrokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

禁扫区域编辑轮廓描边宽度

#### controls.forbiddenSweepZone.outlineDashed

- **类型**: `boolean`
- **默认值**: `true`

禁扫区域编辑轮廓是否为虚线

#### controls.forbiddenSweepZone.outlineDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`
- **单位**: `px`

禁扫区域编辑轮廓虚线样式

#### controls.forbiddenSweepZone.outlineFillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(255, 68, 68, 0.05)'`

禁扫区域编辑轮廓填充颜色

#### controls.forbiddenSweepZone.showRotateButton

- **类型**: `boolean`
- **默认值**: `true`

是否显示旋转按钮

#### controls.forbiddenSweepZone.textColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

禁扫区域尺寸标签文本颜色

#### controls.forbiddenSweepZone.textPosition

- **类型**: `'top' | 'right' | 'bottom' | 'left'`
- **默认值**: `'bottom'`

禁扫区域尺寸标签文本位置

#### controls.forbiddenSweepZone.textOffset

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

禁扫区域尺寸标签文本偏移

#### controls.forbiddenSweepZone.editing

区域框编辑模式样式配置。

##### controls.forbiddenSweepZone.editing.isDashed

- **类型**: `boolean`
- **默认值**: `false`

编辑模式下禁扫区域框是否显示为虚线

##### controls.forbiddenSweepZone.editing.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`
- **单位**: `px`

编辑模式下禁扫区域框虚线样式

#### controls.forbiddenSweepZone.normal

区域框普通模式样式配置。

##### controls.forbiddenSweepZone.normal.isDashed

- **类型**: `boolean`
- **默认值**: `false`

普通模式下禁扫区域框是否显示为虚线

##### controls.forbiddenSweepZone.normal.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`
- **单位**: `px`

普通模式下禁扫区域框虚线样式

### controls.forbiddenMopZone

禁拖区域配置。

#### controls.forbiddenMopZone.minSize

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

禁拖区域最小尺寸

#### controls.forbiddenMopZone.maxSize

- **类型**: `number | undefined`
- **默认值**: `undefined`
- **单位**: `米`

禁拖区域最大尺寸（可选）。缺省、NaN、非正数或 ≤ minSize 时视为不限制，并会在控制台输出一次警告。

#### controls.forbiddenMopZone.iconWrapperFillColor

- **类型**: `ColorSource`
- **默认值**: `'#fe8a07'`

图标容器填充颜色

#### controls.forbiddenMopZone.strokeColor

- **类型**: `ColorSource`
- **默认值**: `'#fe8a07'`

禁拖区域描边颜色

#### controls.forbiddenMopZone.strokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

禁拖区域描边宽度

#### controls.forbiddenMopZone.fillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(254, 138, 7, 0.1)'`

禁拖区域填充颜色

#### controls.forbiddenMopZone.outlineOffset

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

禁拖区域轮廓偏移

#### controls.forbiddenMopZone.outlineStrokeColor

- **类型**: `ColorSource`
- **默认值**: `'#fe8a07'`

禁拖区域轮廓描边颜色

#### controls.forbiddenMopZone.outlineStrokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

禁拖区域轮廓描边宽度

#### controls.forbiddenMopZone.outlineDashed

- **类型**: `boolean`
- **默认值**: `true`

禁拖区域轮廓是否为虚线

#### controls.forbiddenMopZone.outlineDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`
- **单位**: `px`

禁拖区域轮廓虚线样式

#### controls.forbiddenMopZone.outlineFillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(254, 138, 7, 0.05)'`

禁拖区域轮廓填充颜色

#### controls.forbiddenMopZone.showRotateButton

- **类型**: `boolean`
- **默认值**: `true`

是否显示旋转按钮

#### controls.forbiddenMopZone.textColor

- **类型**: `ColorSource`
- **默认值**: `'#fe8a07'`

禁拖区域文本颜色

#### controls.forbiddenMopZone.textPosition

- **类型**: `'top' | 'right' | 'bottom' | 'left'`
- **默认值**: `'bottom'`

禁拖区域文本位置

#### controls.forbiddenMopZone.textOffset

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

禁拖区域文本偏移

#### controls.forbiddenMopZone.editing

区域框编辑模式样式配置。

##### controls.forbiddenMopZone.editing.isDashed

- **类型**: `boolean`
- **默认值**: `false`

编辑模式下禁拖区域框是否显示为虚线

##### controls.forbiddenMopZone.editing.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`
- **单位**: `px`

编辑模式下禁拖区域框虚线样式

#### controls.forbiddenMopZone.normal

区域框普通模式样式配置。

##### controls.forbiddenMopZone.normal.isDashed

- **类型**: `boolean`
- **默认值**: `false`

普通模式下禁拖区域框是否显示为虚线

##### controls.forbiddenMopZone.normal.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`
- **单位**: `px`

普通模式下禁拖区域框虚线样式

### controls.carpet

自定义地毯编辑配置。

#### controls.carpet.minSize

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

自定义地毯最小尺寸。

#### controls.carpet.maxSize

- **类型**: `number | undefined`
- **默认值**: `undefined`
- **单位**: `米`

地毯最大尺寸（可选）。缺省、NaN、非正数或 ≤ minSize 时视为不限制，并会在控制台输出一次警告。

#### controls.carpet.iconWrapperFillColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

图标容器填充颜色，会作用于旋转、缩放、移动以及横向/纵向辅助缩放按钮。

#### controls.carpet.deleteIconWrapperFillColor

- **类型**: `ColorSource | undefined`
- **默认值**: `'#ff4444'`

地毯删除按钮的图标容器填充颜色。未设置时回退到
`controls.carpet.iconWrapperFillColor`。

#### controls.carpet.rotateMode

- **类型**: `'step' | 'free'`
- **默认值**: `'step'`

地毯旋转按钮交互模式。`step` 表示点击后顺时针旋转 90 度，`free` 表示按住拖动连续旋转。

#### controls.carpet.scaleMode

- **类型**: `'free' | 'ratioLocked'`
- **默认值**: `'ratioLocked'`

地毯右下角缩放按钮交互模式。`ratioLocked` 表示等比缩放，同时显示横向和纵向辅助缩放按钮；`free` 表示宽高独立缩放，并隐藏辅助缩放按钮。

#### controls.carpet.fillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(93, 104, 254, 0.1)'`

地毯填充颜色。

#### controls.carpet.outlineOffset

- **类型**: `number`
- **默认值**: `30`
- **单位**: `px`

编辑轮廓偏移。

#### controls.carpet.outlineStrokeColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(0, 0, 0, 0.7)'`

编辑轮廓描边颜色。

#### controls.carpet.outlineStrokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

编辑轮廓描边宽度。

#### controls.carpet.outlineDashed

- **类型**: `boolean`
- **默认值**: `true`

编辑轮廓是否虚线。

#### controls.carpet.outlineDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`
- **单位**: `px`

编辑轮廓虚线样式。

#### controls.carpet.outlineFillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(93, 104, 254, 0.05)'`

编辑轮廓填充颜色。

#### controls.carpet.showRotateButton

- **类型**: `boolean`
- **默认值**: `true`

是否显示旋转按钮。

#### controls.carpet.textColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

尺寸文本颜色。

#### controls.carpet.textPosition

- **类型**: `'top' | 'right' | 'bottom' | 'left'`
- **默认值**: `'bottom'`

尺寸文本位置。

#### controls.carpet.textOffset

- **类型**: `number`
- **默认值**: `20`
- **单位**: `px`

尺寸文本偏移。

#### controls.carpet.editing

##### controls.carpet.editing.isDashed

- **类型**: `boolean`
- **默认值**: `true`

编辑模式是否虚线。

##### controls.carpet.editing.dashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`

编辑模式虚线样式。

#### controls.carpet.normal

##### controls.carpet.normal.isDashed

- **类型**: `boolean`
- **默认值**: `false`

普通模式是否虚线。

##### controls.carpet.normal.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`

普通模式虚线样式。

### cleanZone

清扫区域配置。

#### controls.cleanZone.minSize

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

清扫区域最小尺寸

#### controls.cleanZone.maxSize

- **类型**: `number | undefined`
- **默认值**: `undefined`
- **单位**: `米`

清扫区域最大尺寸（可选）。缺省、NaN、非正数或 ≤ minSize 时视为不限制，并会在控制台输出一次警告。

#### controls.cleanZone.iconWrapperFillColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

清扫区域图标容器填充颜色

#### controls.cleanZone.strokeColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

清扫区域描边颜色

#### controls.cleanZone.strokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

清扫区域描边宽度

#### controls.cleanZone.fillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(93, 104, 254, 0.1)'`

清扫区域填充颜色

#### controls.cleanZone.outlineOffset

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

清扫区域轮廓偏移

#### controls.cleanZone.outlineStrokeColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

清扫区域轮廓描边颜色

#### controls.cleanZone.outlineStrokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

清扫区域轮廓描边宽度

#### controls.cleanZone.outlineDashed

- **类型**: `boolean`
- **默认值**: `true`

清扫区域轮廓是否为虚线

#### controls.cleanZone.outlineDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`
- **单位**: `px`

清扫区域轮廓虚线样式

#### controls.cleanZone.outlineFillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(93, 104, 254, 0.05)'`

清扫区域轮廓填充颜色

#### controls.cleanZone.showRotateButton

- **类型**: `boolean`
- **默认值**: `true`

是否显示旋转按钮

#### controls.cleanZone.textColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

清扫区域文本颜色

#### controls.cleanZone.textPosition

- **类型**: `'top' | 'right' | 'bottom' | 'left'`
- **默认值**: `'bottom'`

清扫区域文本位置

#### controls.cleanZone.textOffset

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

清扫区域文本偏移

#### controls.cleanZone.editing

区域框编辑模式样式配置。

##### controls.cleanZone.editing.isDashed

- **类型**: `boolean`
- **默认值**: `false`

编辑模式下清扫区域框是否显示为虚线

##### controls.cleanZone.editing.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`
- **单位**: `px`

编辑模式下清扫区域框虚线样式

#### controls.cleanZone.normal

区域框普通模式样式配置。

##### controls.cleanZone.normal.isDashed

- **类型**: `boolean`
- **默认值**: `false`

普通模式下清扫区域框是否显示为虚线

##### controls.cleanZone.normal.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`
- **单位**: `px`

普通模式下清扫区域框虚线样式

### controls.virtualWall

虚拟墙配置。

#### controls.virtualWall.iconWrapperFillColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

虚拟墙图标容器填充颜色

#### controls.virtualWall.lineWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

虚拟墙线条宽度

#### controls.virtualWall.lineColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

虚拟墙线条颜色

#### controls.virtualWall.hitAreaThickness

- **类型**: `number`
- **默认值**: `30`
- **单位**: `px`

虚拟墙热区厚度

#### controls.virtualWall.outlineOffset

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

虚拟墙轮廓偏移

#### controls.virtualWall.outlineStrokeColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

虚拟墙轮廓描边颜色

#### controls.virtualWall.outlineStrokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

虚拟墙轮廓描边宽度

#### controls.virtualWall.outlineDashed

- **类型**: `boolean`
- **默认值**: `true`

虚拟墙轮廓是否为虚线

#### controls.virtualWall.outlineDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`
- **单位**: `px`

虚拟墙轮廓虚线样式

#### controls.virtualWall.outlineFillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(255, 68, 68, 0.05)'`

虚拟墙轮廓填充颜色

#### controls.virtualWall.minWidth

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

虚拟墙最小宽度

#### controls.virtualWall.maxWidth

- **类型**: `number | undefined`
- **默认值**: `undefined`
- **单位**: `米`

虚拟墙最大宽度（可选）。缺省、NaN、非正数或 ≤ minWidth 时视为不限制，并会在控制台输出一次警告。

#### controls.virtualWall.textColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

虚拟墙文本颜色

#### controls.virtualWall.textOffset

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

虚拟墙文本偏移

#### controls.virtualWall.editing

虚拟墙编辑模式样式配置。

##### controls.virtualWall.editing.isDashed

- **类型**: `boolean`
- **默认值**: `false`

编辑模式下是否使用虚线。

##### controls.virtualWall.editing.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`

编辑模式虚线样式。

#### controls.virtualWall.normal

虚拟墙普通模式样式配置。

##### controls.virtualWall.normal.isDashed

- **类型**: `boolean`
- **默认值**: `false`

普通模式下是否使用虚线。

##### controls.virtualWall.normal.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`

普通模式虚线样式。

### controls.spot

定点清扫配置。

#### controls.spot.iconSrc

- **类型**: `string`
- **默认值**: `内置资源`

定点清扫图标资源路径

#### controls.spot.iconSize

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

定点清扫图标大小

#### controls.spot.iconSizeFixed

- **类型**: `boolean`
- **默认值**: `false`

定点清扫图标尺寸是否固定（不跟随地图缩放）

#### controls.spot.size

- **类型**: `number`
- **默认值**: `1`
- **单位**: `米`

定点清扫区域尺寸

#### controls.spot.strokeColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

定点清扫描边颜色

#### controls.spot.strokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

定点清扫描边宽度

#### controls.spot.fillColor

- **类型**: `ColorSource`
- **默认值**: `'rgba(93, 104, 254, 0.1)'`

定点清扫填充颜色

#### controls.spot.showText

- **类型**: `boolean`
- **默认值**: `true`

是否显示定点清扫文本（米数）

#### controls.spot.textColor

- **类型**: `ColorSource`
- **默认值**: `'#5d68fe'`

定点清扫文本颜色

#### controls.spot.textPosition

- **类型**: `'top' | 'right' | 'bottom' | 'left'`
- **默认值**: `'bottom'`

定点清扫文本位置

#### controls.spot.textOffset

- **类型**: `number`
- **默认值**: `8`
- **单位**: `px`

定点清扫文本偏移

#### controls.spot.editing

定点清扫编辑模式样式配置。

##### controls.spot.editing.isDashed

- **类型**: `boolean`
- **默认值**: `false`

是否使用虚线边框。

##### controls.spot.editing.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`

虚线边框的间距配置。

##### controls.spot.editing.showIcon

- **类型**: `boolean`
- **默认值**: `true`

编辑模式下是否显示中心图标。

##### controls.spot.editing.showFrame

- **类型**: `boolean`
- **默认值**: `true`

编辑模式下是否显示框体（填充和边框）。

#### controls.spot.normal

定点清扫普通模式样式配置。

##### controls.spot.normal.isDashed

- **类型**: `boolean`
- **默认值**: `false`

是否使用虚线边框。

##### controls.spot.normal.dashArray

- **类型**: `[number, number]`
- **默认值**: `[0, 0]`

虚线边框的间距配置。

##### controls.spot.normal.showIcon

- **类型**: `boolean`
- **默认值**: `false`

普通模式下是否显示中心图标。

##### controls.spot.normal.showFrame

- **类型**: `boolean`
- **默认值**: `true`

普通模式下是否显示框体（填充和边框）。

### controls.wayPoint

途径点配置。

#### controls.wayPoint.showOrder

- **类型**: `boolean`
- **默认值**: `true`

是否显示途径点序号。

#### controls.wayPoint.normal

途径点普通模式样式配置。

##### controls.wayPoint.normal.iconSrc

- **类型**: `string`
- **默认值**: `内置资源`

普通模式下途径点图标资源路径。

##### controls.wayPoint.normal.iconSize

- **类型**: `number`
- **默认值**: `32`
- **单位**: `px`

普通模式下途径点图标大小（固定屏幕像素）。

##### controls.wayPoint.normal.orderText

普通模式下序号文本样式配置。

###### controls.wayPoint.normal.orderText.fontSize

- **类型**: `number`
- **默认值**: `10`
- **单位**: `px`

序号文本字体大小。

###### controls.wayPoint.normal.orderText.fontFamily

- **类型**: `string`
- **默认值**: `'system-ui, -apple-system, sans-serif'`

序号文本字体。

###### controls.wayPoint.normal.orderText.fontWeight

- **类型**: `TextStyleFontWeight`
- **默认值**: `'600'`

序号文本字体粗细。

###### controls.wayPoint.normal.orderText.color

- **类型**: `ColorSource`
- **默认值**: `'#8a8a8a'`

序号文本颜色。

##### controls.wayPoint.normal.orderContainer

普通模式下序号容器样式配置。

###### controls.wayPoint.normal.orderContainer.size

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

序号容器大小（圆形直径）。

###### controls.wayPoint.normal.orderContainer.backgroundColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

序号容器背景颜色。

###### controls.wayPoint.normal.orderContainer.offsetY

- **类型**: `number`
- **默认值**: `20`
- **单位**: `px`

序号容器垂直偏移量。基准值为图标底部中心。

###### controls.wayPoint.normal.orderContainer.offsetX

- **类型**: `number`
- **默认值**: `0`
- **单位**: `px`

序号容器水平偏移量。基准值为图标底部中心。

#### controls.wayPoint.editing

途径点编辑模式样式配置。结构与 `normal` 相同，但可以设置不同的图标、尺寸和序号样式。

##### controls.wayPoint.editing.iconSrc

- **类型**: `string`
- **默认值**: `内置资源`

编辑模式下途径点图标资源路径。

##### controls.wayPoint.editing.iconSize

- **类型**: `number`
- **默认值**: `38`
- **单位**: `px`

编辑模式下途径点图标大小。

##### controls.wayPoint.editing.orderText

编辑模式下序号文本样式配置。

###### controls.wayPoint.editing.orderText.fontSize

- **类型**: `number`
- **默认值**: `14`
- **单位**: `px`

编辑模式序号文本字体大小。

###### controls.wayPoint.editing.orderText.fontFamily

- **类型**: `string`
- **默认值**: `'system-ui, -apple-system, sans-serif'`

编辑模式序号文本字体。

###### controls.wayPoint.editing.orderText.fontWeight

- **类型**: `TextStyleFontWeight`
- **默认值**: `'600'`

编辑模式序号文本字体粗细。

###### controls.wayPoint.editing.orderText.color

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

编辑模式序号文本颜色。

##### controls.wayPoint.editing.orderContainer

编辑模式下序号容器样式配置。

###### controls.wayPoint.editing.orderContainer.size

- **类型**: `number`
- **默认值**: `16`
- **单位**: `px`

编辑模式序号容器大小（圆形直径）。

###### controls.wayPoint.editing.orderContainer.backgroundColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

编辑模式序号容器背景颜色。

###### controls.wayPoint.editing.orderContainer.offsetY

- **类型**: `number`
- **默认值**: `23`
- **单位**: `px`

编辑模式序号容器垂直偏移量。

###### controls.wayPoint.editing.orderContainer.offsetX

- **类型**: `number`
- **默认值**: `0`
- **单位**: `px`

编辑模式序号容器水平偏移量。

## customZoneTypes

- **类型**: `Record<string, Partial<ZoneTypeDefinition>> | undefined`
- **默认值**: `undefined`

自定义矩形区域类型声明。key 为自定义类型的名称（会作为 `customZones` prop 的分组 key、[`runtime.editingCustomZoneIds`](/reference/runtime#editingcustomzoneids) 的分组 key、以及 [`onClickCustomZone`](/reference/callbacks#onclickcustomzone) 等回调的 `type` 参数），value 为该类型的样式配置。

::: warning

- key **不得**与三种内置区域类型（`forbiddenSweepZone` / `forbiddenMopZone` / `cleanZone`）重名；重名会被 SDK 忽略并打印告警。
- 内置区域继续使用 [`controls.forbiddenSweepZone`](#controls-forbiddensweepzone) 等独立的配置节点，不在此声明。

:::

每个自定义类型的 value 支持的字段与 [`controls.forbiddenSweepZone`](#controls-forbiddensweepzone) 一致：`minSize` / `maxSize` / `strokeColor` / `strokeWidth` / `fillColor` / `iconWrapperFillColor` / `outlineOffset` / `outlineStrokeColor` / `outlineStrokeWidth` / `outlineDashed` / `outlineDashArray` / `outlineFillColor` / `showRotateButton` / `textColor` / `textPosition` / `textOffset` / `editing` / `normal` 等。未显式声明的字段会回退到 SDK 默认值。

**示例**：声明一个"宠物清洁区"类型

```tsx
<RobotMap
  config={{
    customZoneTypes: {
      petCleanZone: {
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
  customZones={{
    petCleanZone: [
      /* ZoneParam[] */
    ],
  }}
  onClickCustomZone={(type, zone) => {
    /* ... */
  }}
/>
```

更多用法参见 [进阶使用 · 自定义区域](/guide/advanced-usage#自定义区域)。

## divider

分割线配置，控制房间分割线的样式和行为。

### divider.lineColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

分割线颜色。

### divider.dashLineWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

分割线宽度。

### divider.dashLineDashArray

- **类型**: `[number, number]`
- **默认值**: `[4, 3]`
- **单位**: `px`

分割线样式。

### divider.solidLineWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

分割线有效部分宽度。

### divider.endPointSize

- **类型**: `number`
- **默认值**: `12`
- **单位**: `px`

分割线端点大小。

### divider.endPointColor

- **类型**: `ColorSource`
- **默认值**: `'#ff4444'`

分割线端点颜色。

### divider.endPointStrokeColor

- **类型**: `ColorSource`
- **默认值**: `'#ffffff'`

分割线端点描边颜色。

### divider.endPointStrokeWidth

- **类型**: `number`
- **默认值**: `2`
- **单位**: `px`

分割线端点描边宽度。

### divider.hitAreaThickness

- **类型**: `number`
- **默认值**: `30`
- **单位**: `px`

分割线热区厚度。

### divider.resetDividerWhenOutOfRoom

- **类型**: `boolean`
- **默认值**: `false`

当操作分割线到房间包围盒外时是否重置分割线到初始位置。

### divider.defaultExtension

- **类型**: `number`
- **默认值**: `20`
- **单位**: `px`

初始分割线端点超出房间包围盒的像素值。

### divider.defaultDirection

- **类型**: `'horizontal' | 'vertical'`
- **默认值**: `'horizontal'`

初始分割线方向。

## detectedObject

AI检测物体配置。

### detectedObject.height

- **类型**: `number`
- **默认值**: `43`
- **单位**: `px`

检测物体高度。

### detectedObject.width

- **类型**: `number`
- **默认值**: `38`
- **单位**: `px`

检测物体宽度。

### detectedObject.interactive

- **类型**: `boolean`
- **默认值**: `false`

检测物体是否可交互。

### detectedObject.anchor

- **类型**: `Point`
- **默认值**: `{ x: 0.5, y: 0.5 }`

检测物体图标的锚点位置,用于控制图标相对于坐标点的对齐方式。

锚点坐标系说明:

- `{x: 0, y: 0}` 表示左上角
- `{x: 0.5, y: 0.5}` 表示中心点(默认)
- `{x: 0.5, y: 1}` 表示底部中心(适用于气泡形状的图标)
- `{x: 1, y: 1}` 表示右下角

**注意**: 所有 DetectedObject 统一使用此配置中的锚点值,以确保图标规范统一。

**示例**:

```typescript
const mapInstance = new MapApplication({
  config: {
    detectedObject: {
      anchor: { x: 0.5, y: 1.0 }, // 所有检测物体都使用底部中心作为锚点
    },
  },
})
```

## snapshot

截图配置。

### snapshot.format

- **类型**: `'png' | 'jpg' | 'webp'`
- **默认值**: `'png'`

截图输出格式。

### snapshot.quality

- **类型**: `number`
- **默认值**: `1`

截图质量 (0-1)。

### snapshot.antialias

- **类型**: `boolean`
- **默认值**: `true`

截图是否开启抗锯齿。

### snapshot.resolution

- **类型**: `number`
- **默认值**: `4`

截图分辨率倍数。
