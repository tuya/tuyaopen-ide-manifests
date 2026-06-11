# 数据

了解 RobotMap 支持的各种数据类型和格式。

## map

地图栅格数据，通常为编码后的字符串格式。

```tsx
<RobotMap
  map="<原始地图数据字符串>"
  // ... 其他属性
/>
```

**类型**: `string`

**说明**:

- 包含地图尺寸、分辨率、原点等基础信息。
- 包含障碍物、房间、地毯等图形数据。
- 通常是来源于p2p通道获取的数据，无需做任何处理，直接传入即可。

::: tip
目前地图数据协议分为两种，一种是点阵协议，一种是结构化协议。

`map` 已经兼容支持两种协议，你只需要传入原始数据字符串即可。
:::

## path

机器人路径数据，包含清扫轨迹和当前位置。

```tsx
<RobotMap
  path="<原始路径数据字符串>"
  // ... 其他属性
/>
```

**类型**: `string`

**说明**:

- 包含清扫路径、回充路径、转场路径和机器人位置等信息。

::: tip
解析得到的路径的最后一个点会被认为是机器人当前位置。
:::

## roomProperties

房间属性配置，定义每个房间的清扫参数和显示信息。

```tsx
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
    cleanMode: 0
  },
  {
    id: 2,
    name: '卧室',
    cleanTimes: 1,
    order: 2,
    floorType: 1,
    yMop: 0,
    suction: 1,
    cistern: 1
  }
]

<RobotMap roomProperties={roomProperties} />
```

**类型**: [`RoomProperty[]`](/reference/types#roomproperty)

**说明**:

- 根据地图协议的不同，`roomProperties` 的获取方式不同。
  - 点阵协议：由于房间信息实际耦合在点阵协议中，我们提供了 `decodeRoomProperties` 方法解析原始地图中的房间数据。

  ```tsx
  import { decodeRoomProperties } from '@ray-js/robot-map'

  const roomProperties = decodeRoomProperties(map)
  ```

  - 结构化协议：使用 [`requestRoomProperty`](https://developer.tuya.com/cn/miniapp/solution-panel/ability/special/robot-vacuum/ability-set/mqtt#%E8%AF%B7%E6%B1%82%E6%88%BF%E9%97%B4%E5%B1%9E%E6%80%A7) 来获取。 获取到的数据需要处理成`RoomProperty[]` 的格式。

  ```tsx
  import { useRoomProperty } from '@ray-js/robot-data-stream'
  const { devId } = useDevice((device) => device.devInfo)
  const { requestRoomProperty } = useRoomProperty(devId)

  requestRoomProperty()
    .then((response) => {
      // 这里需要将响应数据转换为 `RoomProperty[]` 类型作为 `roomProperties`
      const roomProperties = YOUR_CONVERT_FUNCTION(response)
    })
    .catch((error) => {})
  ```

## forbiddenSweepZones

禁扫区域数据，定义机器人不能进入清扫的区域。

```tsx
const forbiddenSweepZones: ZoneParam[] = [
  {
    id: 'zone1',
    points: [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 150 },
      { x: 50, y: 150 }
    ]
  }
]

<RobotMap forbiddenSweepZones={forbiddenSweepZones} />
```

**类型**: [`ZoneParam[]`](/reference/types#zoneparam)

## forbiddenMopZones

禁拖区域数据，定义机器人不能进入拖地的区域。

```tsx
const forbiddenMopZones: ZoneParam[] = [
  {
    id: 'mop_zone1',
    points: [
      { x: 200, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 300 },
      { x: 200, y: 300 }
    ]
  }
]

<RobotMap forbiddenMopZones={forbiddenMopZones} />
```

**类型**: [`ZoneParam[]`](/reference/types#zoneparam)

## cleanZones

清洁区域数据，定义需要重点清洁的区域。

```tsx
const cleanZones: ZoneParam[] = [
  {
    id: 'clean_zone1',
    points: [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 100, y: 200 }
    ]
  }
]

<RobotMap cleanZones={cleanZones} />
```

**类型**: [`ZoneParam[]`](/reference/types#zoneparam)

## virtualWalls

虚拟墙数据，定义阻挡机器人通行的虚拟障碍。

```tsx
const virtualWalls: VirtualWallParam[] = [
  {
    id: 'wall1',
    points: [
      { x: 100, y: 100 },  // 起点
      { x: 200, y: 100 }   // 终点
    ]
  },
  {
    id: 'wall2',
    points: [
      { x: 150, y: 50 },
      { x: 150, y: 150 }
    ]
  }
]

<RobotMap virtualWalls={virtualWalls} />
```

**类型**: [`VirtualWallParam[]`](/reference/types#virtualwallparam)

## spots

定点清洁数据，定义需要定点清洁的位置。

```tsx
const spots: SpotParam[] = [
  {
    id: 'spot1',
    point: { x: 120, y: 80 }
  },
  {
    id: 'spot2',
    point: { x: 200, y: 150 }
  }
]

<RobotMap spots={spots} />
```

## wayPoints

途径点数据，定义机器需要途径的位置。

```tsx
const wayPoints: WayPointParam[] = [
  {
    id: 'wayPoint1',
    point: { x: 120, y: 80 }
  }
]

<RobotMap wayPoints={wayPoints} />
```

**类型**: [`WayPointParam[]`](/reference/types#waypointparam)

## detectedObjects

AI 检测物体数据，显示机器人识别到的物体。

```tsx
const detectedObjects: DetectedObjectParam[] = [
  {
    id: 'object1',
    src: 'https://example.com/shoe-icon.png',
    x: 120,
    y: 80,
  },
  {
    id: 'object2',
    src: 'https://example.com/pet-icon.png',
    x: 200,
    y: 150
  }
]

<RobotMap detectedObjects={detectedObjects} />
```

**类型**: [`DetectedObjectParam[]`](/reference/types#detectedobjectparam)

## customElements

自定义元素数据，支持在地图上添加自定义的图像、GIF 或 HTML 元素。

```tsx
const customElements: CustomElementParam[] = [
  // 图像元素
  {
    id: 'custom-image',
    type: 'image',
    src: 'https://example.com/icon.png',
    x: 100,
    y: 200,
    width: 32,
    height: 32,
    interactive: true,
    customData: { type: 'sensor' }
  },
  // GIF 元素
  {
    id: 'custom-gif',
    type: 'gif',
    src: 'https://example.com/animation.gif',
    x: 150,
    y: 250,
    width: 48,
    height: 48,
  },
  // HTML 元素
  {
    id: 'custom-html',
    type: 'html',
    htmlContent: '<div style="background: red; padding: 4px;">提示</div>',
    x: 200,
    y: 300,
    width: 60,
    height: 20
  }
]

<RobotMap customElements={customElements} />
```

**类型**: [`CustomElementParam[]`](/reference/types#customelementparam)

## customCarpets

自定义地毯数据，定义用户自定义的地毯信息。

```tsx
const customCarpets: CustomCarpetParam[] = [
  {
    id: 'carpet1',
    type: 1,
    shape: 'rectangle',
    points: [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 100, y: 200 }
    ]
  },
  {
    id: 'carpet2',
    type: 2,
    shape: 'round',
    customData: { material: 'wool' }
  }
]

<RobotMap customCarpets={customCarpets} />
```

**类型**: [`CustomCarpetParam[]`](/reference/types#customcarpetparam)

## furnitures

家具数据，定义地图上的家具信息，支持编辑、拖拽、旋转和缩放。

```tsx
const furnitures: FurnitureParam[] = [
  {
    id: 'furniture1',
    furnitureType: 1,
    points: [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 100, y: 200 }
    ]
  }
]

<RobotMap furnitures={furnitures} />
```

**类型**: [`FurnitureParam[]`](/reference/types#furnitureparam)

**说明**:

- `furnitureType` 需要与 `config.furniture.assets` 中配置的家具类型编号匹配。
- `points` 为四个顶点坐标（顺时针: 左上→右上→右下→左下）。

## heatmap

地图热力图数据，通常为编码后的字符串格式。

```tsx
<RobotMap
  heatmap="<原始热力图数据字符串>"
  // ... 其他属性
/>
```

**类型**: `string`

**说明**:

- 包含热力图点的坐标和信号强度信息。
- 通常来源于p2p通道获取的数据，直接传入即可。
- 热力图的视觉样式可通过 `config.heatmap` 进行配置。
