# 快速开始

Tuya Robot Map 提供了开箱即用的 React 组件，专为扫地机器人应用设计。

## 安装

::: code-group

```bash [yarn]
yarn add @ray-js/robot-map
```

```bash [npm]
npm install @ray-js/robot-map
```

:::

## 数据传入

仅需传入几个基本的数据props，即可完成地图的呈现。

::: code-group

```tsx [点阵协议地图数据]
import React, { useMemo } from 'react'
import { RobotMap } from '@ray-js/robot-map'
import { decodeRoomProperties } from '@ray-js/robot-map'

function MapPage() {
  /** 地图原始数据（通常是来自p2p通道的数据） */
  const mapData = 'your_map_data_string'
  /** 路径原始数据（通常是来自p2p通道的数据） */
  const pathData = 'your_path_data_string'
  /** 房间数据（需要从地图数据中解析，我们提供了解析方法） */
  const roomProperties = useMemo(() => {
    return decodeRoomProperties(mapData)
  }, [mapData])
  /** 假设有一个虚拟墙 */
  const virtualWalls: VirtualWallParam[] = [
    {
      id: 'virtualWall1',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
    },
  ]

  return (
    <RobotMap
      map={mapData}
      path={pathData}
      roomProperties={roomProperties}
      virtualWalls={virtualWalls}
      // ... 其他props
    />
  )
}
```

```tsx [结构化协议地图数据]
import React, { useMemo } from 'react'
import { RobotMap, VirtualWallParam } from '@ray-js/robot-map'

function MapPage() {
  /** 地图原始数据（通常是来自p2p通道的数据） */
  const mapData = 'your_map_data_string'
  /** 路径原始数据（通常是来自p2p通道的数据） */
  const pathData = 'your_path_data_string'
  /** 房间数据（通常是来自mqtt通道的数据) */
  const roomProperties: RoomProperty[] = [
    {
      id: 1,
      name: '客厅',
      cleanTimes: 2,
      order: 1,
      floorType: 0,
      yMop: 1,
      suction: 0,
      cistern: 0,
      cleanMode: 0,
    },
  ]
  /** 假设有一个虚拟墙 */
  const virtualWalls: VirtualWallParam[] = [
    {
      id: 'virtualWall1',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
    },
  ]

  return (
    <RobotMap
      map={mapData}
      path={pathData}
      roomProperties={roomProperties}
      virtualWalls={virtualWalls}
      // ... 其他props
    />
  )
}
```

:::

::: tip

- `map` 是渲染的核心，只有 `map` 是必传的，其他数据都是可选的。

- 地图组件的数据是纯受控的，你传入什么样的数据，地图就会按什么样的数据进行渲染。
  :::

## 地图配置

你可以通过 `config` 设置地图的视觉样式、素材资源、交互行为等配置项。我们内置了一套默认配置，你可以根据需要覆盖其中的部分或全部配置。

::: tip 响应式配置
配置是**响应式**的，当你修改传入的 `config` prop 时，地图会自动更新视觉效果。这使得主题切换、颜色调整等功能变得简单易实现。详见[配置](/reference/config)。
:::

查看[配置](/reference/config)了解更多配置项。

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

## 运行时状态

运行时状态用于控制地图的动态状态，如显示切换、选择状态、编辑状态等。

运行时状态是纯受控的，你可以通过 `runtime` 动态更新地图的状态，它会即时反馈到地图上。

查看[运行时](/reference/runtime)了解更多配置。

```tsx
import { View, Button } from '@ray-js/ray'
import React, { useState } from 'react'
import { RobotMap } from '@ray-js/robot-map'

function MapPage() {
  const [showPath, setShowPath] = useState(true)
  const [enableRoomSelection, setEnableRoomSelection] = useState(false)
  const [selectRoomIds, setSelectRoomIds] = useState([])

  // 比如你要切换路径的显示
  const handleShowPath = () => {
    setShowPath(!showPath)
  }

  // 比如你要将地图切换到选区模式
  const handleEnableRoomSelection = () => {
    setEnableRoomSelection(true)

    setSelectRoomIds([1, 2, 3])
  }

  return (
    <View>
      <RobotMap
        runtime={{
          showPath,
          enableRoomSelection,
          selectRoomIds,
          // ... 其他运行时配置
        }}
        // ... 其他props
      />

      <Button onClick={handleShowPath}>切换路径显示</Button>
      <Button onClick={handleEnableRoomSelection}>选区模式</Button>
    </View>
  )
}
```

## 地图事件回调

地图事件回调通过组件 props 传递，当地图发生相应的交互或状态变化时会自动触发。所有回调都是可选的，只需要传入你关心的回调函数。

查看[地图事件回调](/reference/callbacks)了解更多事件回调。

```tsx
import React from 'react'
import { RobotMap, MapState, RoomData } from '@ray-js/robot-map'

const MapPage = () => {
  // 地图准备就绪回调
  const handleMapReady = (mapApi: MapApi) => {
    console.log('地图已准备就绪')
  }

  // 地图绘制回调
  const handleMapDrawed = (mapState: MapState) => {
    console.log('地图绘制完成', mapState)
  }

  // 点击房间回调
  const handleClickRoom = (room: Partial<RoomData>) => {
    console.log('点击了房间', room)
  }

  return (
    <RobotMap
      map={mapData}
      path={pathData}
      roomProperties={roomProperties}
      onMapReady={handleMapReady}
      onMapDrawed={handleMapDrawed}
      onClickRoom={handleClickRoom}
      // ... 其他事件回调
    />
  )
}
```

## 地图方法

在地图实例准备就绪后，你可以通过 `mapApi` 调用地图方法。

查看[地图方法](/reference/methods)了解更多 API 。

```tsx
import React, { useState } from 'react'
import { RobotMap, MapApi } from '@ray-js/robot-map'

const MapPage = () => {
  const [mapApi, setMapApi] = useState<MapApi>(null)

  const handleMapReady = (mapApi: MapApi) => {
    // 可以将 MapApi 保存到 state 或 ref 中，以便后续调用
    setMapApi(mapApi)

    // 或者把 MapApi 存储到全局状态管理中（如 Redux、Zustand 等），以便在任意组件中调用地图方法
    dispatch(setMapApi(mapApi))
  }

  const handleResetMapView = () => {
    mapApi?.resetPanZoom()
  }

  const handleGetCleanZones = async () => {
    const zones = await mapApi?.getCleanZones()
    console.log('当前清扫区域:', zones)
  }

  return (
    <View>
      <RobotMap
        map={mapData}
        path={pathData}
        roomProperties={roomProperties}
        onMapReady={handleMapReady}
      />

      <Button onClick={handleResetMapView}>重置视图</Button>
      <Button onClick={handleGetCleanZones}>获取清扫区域</Button>
    </View>
  )
}
```

::: tip
注意所有地图方法都是异步的Promise，需要使用 `await` 或 `then` 来获取结果。
:::
