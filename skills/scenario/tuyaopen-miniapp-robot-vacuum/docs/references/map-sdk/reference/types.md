# 类型定义

了解 RobotMap 支持的各种数据类型和格式。

## Point {#point}

坐标点类型。

```typescript
type Point = {
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
}
```

## Direction {#direction}

方向类型。

```typescript
type Direction = 'horizontal' | 'vertical'
```

## IconPoint {#iconpoint}

带旋转角度的坐标点类型，用于机器人和充电桩等带朝向的元素。

```typescript
type IconPoint = Point & {
  /** 旋转角度 */
  rotation?: number
}
```

## MeasurementUnit {#measurementunit}

测量单位类型。

```typescript
type MeasurementUnit = 'meter' | 'feet' | 'centimeter'
```

## BackgroundGradient {#backgroundgradient}

渐变背景配置类型。

```typescript
type BackgroundGradient = {
  /** 渐变类型 */
  type: 'linear' | 'radial'
  /** 线性渐变起点x (相对于视口宽度，0-1) */
  x0?: number
  /** 线性渐变起点y (相对于视口高度，0-1) */
  y0?: number
  /** 线性渐变终点x (相对于视口宽度，0-1) */
  x1?: number
  /** 线性渐变终点y (相对于视口高度，0-1) */
  y1?: number
  /** 径向渐变中心x (相对于视口宽度，0-1) */
  cx?: number
  /** 径向渐变中心y (相对于视口高度，0-1) */
  cy?: number
  /** 径向渐变半径 (相对于视口对角线长度，0-1) */
  r?: number
  /** 渐变色停靠点 */
  colorStops: Array<{ offset: number; color: ColorSource }>
}
```

## BackgroundImage {#backgroundimage}

图片背景配置类型。

```typescript
type BackgroundImage = {
  /** 图片URL */
  src: string
  /** 图片适应模式，默认'cover' */
  fit?: 'fill' | 'contain' | 'cover' | 'none'
  /** 图片位置（x, y为相对于视口的比例，0-1），默认居中(0.5, 0.5) */
  position?: { x: number; y: number }
  /** 是否重复平铺，默认false */
  repeat?: boolean
}
```

## MapState {#mapstate}

地图状态信息。

```typescript
type MapState = {
  /** 地图ID */
  id: number
  /** 地图状态 */
  status: boolean
  /** 分辨率 */
  resolution: number
  /** 地图宽度 */
  width: number
  /** 地图高度 */
  height: number
  /** 原点坐标 */
  origin: Point
  /** 充电桩坐标 */
  charger: Point
  /** 充电桩方向 */
  chargerDirection: number
  /** 版本号 */
  version?: number
}
```

## PathState {#pathstate}

路径状态信息。

```typescript
type PathState = {
  /** 路径ID */
  id: number
  /** 路径类型 */
  type: number
  /** 方向 */
  direction: number
  /** 计数 */
  count: number
  /** 初始化标志 */
  initFlag: number
  /** 机器人当前位置 */
  robotPosition: Point | null
}
```

## ZoneParam {#zoneparam}

区域参数类型。

```typescript
type ZoneParam = {
  /** 区域ID */
  id: string
  /** 点集合，组成区域的顶点坐标 */
  points: Point[]
  /**
   * 业务侧的自定义元数据。SDK 不会读取或校验这个字段，只会原样存储并在回调中
   * 原样返回。可用于给自定义区域实例打上业务相关的标签。
   */
  metadata?: Record<string, unknown>
}
```

## FurnitureParam {#furnitureparam}

家具参数类型。

```typescript
type FurnitureParam = {
  /** 家具ID */
  id: string
  /** 家具类型编号，匹配 config.furniture.assets 中的 type */
  furnitureType: number
  /** 四个顶点坐标 (顺时针: 左上→右上→右下→左下) */
  points: Point[]
}
```

## VirtualWallParam {#virtualwallparam}

虚拟墙参数类型。

```typescript
type VirtualWallParam = {
  /** 虚拟墙ID */
  id: string
  /** 点集合，包含起点和终点坐标 */
  points: Point[] // 长度必须为 2
}
```

## SpotParam {#spotparam}

定点清扫参数类型。

```typescript
type SpotParam = {
  /** 定点清洁ID */
  id: string
  /** 点坐标 */
  point: Point
}
```

## WayPointParam {#waypointparam}

途径点参数类型。

```typescript
type WayPointParam = {
  /** 途径点ID */
  id: string
  /** 点坐标 */
  point: Point
}
```

## RoomProperty {#roomproperty}

房间属性类型，定义房间的清洁参数和显示信息。

```typescript
type RoomProperty = {
  /** 房间ID */
  id: number
  /** 房间名称 */
  name: string
  /** 清洁次数 */
  cleanTimes: number
  /** 清洁顺序 */
  order: number
  /** 地板类型 */
  floorType: number
  /** Y字形拖地 */
  yMop: number
  /** 吸力等级 */
  suction: number
  /** 水箱等级 */
  cistern: number
  /** 清洁模式 */
  cleanMode: number
  /** 房间类型 */
  type?: number | null
  /** 自定义数据 */
  customData?: Record<string, any>
}
```

## RoomData {#roomdata}

房间显示数据类型。

```typescript
type RoomData = RoomProperty & {
  /** 房间中心点 */
  centerPoint: Point | null
  /** 索引 */
  index: number
}
```

## ImageCustomElementParam {#imagecustomelementparam}

自定义元素参数类型。

```typescript
type ImageCustomElementParam = {
  /** 元素ID */
  id: string
  /** 元素类型 */
  type: 'image'
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 图片资源路径 */
  src: string
  /** 图片宽度（必需 - 图片需要明确尺寸） */
  width: number
  /** 图片高度（必需 - 图片需要明确尺寸） */
  height: number
  /** 旋转角度 */
  rotation?: number
  /** 透明度 */
  opacity?: number
  /** 是否可交互 */
  interactive?: boolean
  /** 自定义数据 */
  customData?: Record<string, any>
  /** 尺寸是否固定 */
  sizeFixed?: boolean
  /**
   * 锚点位置
   *
   * 定义图片的锚点位置,用于控制图片相对于坐标点的对齐方式
   * - {x: 0, y: 0} 表示左上角
   * - {x: 0.5, y: 0.5} 表示中心点(默认)
   * - {x: 0.5, y: 1} 表示底部中心(适用于气泡图标)
   * - {x: 1, y: 1} 表示右下角
   */
  anchor?: Point
}
```

## GifCustomElementParam {#gifcustomelementparam}

```typescript
type GifCustomElementParam = {
  /** 元素ID */
  id: string
  /** 元素类型 */
  type: 'gif'
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** GIF资源路径 */
  src: string
  /** GIF宽度（必需 - GIF 需要明确尺寸） */
  width: number
  /** GIF高度（必需 - GIF 需要明确尺寸） */
  height: number
  /** 旋转角度 */
  rotation?: number
  /** 透明度 */
  opacity?: number
  /** 是否可交互 */
  interactive?: boolean
  /** 自定义数据 */
  customData?: Record<string, any>
  /** 尺寸是否固定 */
  sizeFixed?: boolean
  /**
   * 锚点位置
   *
   * 定义GIF的锚点位置,用于控制GIF相对于坐标点的对齐方式
   * - {x: 0, y: 0} 表示左上角
   * - {x: 0.5, y: 0.5} 表示中心点(默认)
   * - {x: 0.5, y: 1} 表示底部中心(适用于气泡图标)
   * - {x: 1, y: 1} 表示右下角
   */
  anchor?: Point
}
```

## HtmlCustomElementParam {#htmlcustomelementparam}

```typescript
type HtmlCustomElementParam = {
  /** 元素ID */
  id: string
  /** 元素类型 */
  type: 'html'
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** HTML内容 */
  htmlContent: string
  /** 旋转角度 */
  rotation?: number
  /** 透明度 */
  opacity?: number
  /** 是否可交互 */
  interactive?: boolean
  /** 自定义数据 */
  customData?: Record<string, any>
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 尺寸是否固定 */
  sizeFixed?: boolean
}
```

## CustomElementParam {#customelementparam}

```typescript
type CustomElementParam =
  | ImageCustomElementParam
  | GifCustomElementParam
  | HtmlCustomElementParam
```

## DetectedObjectParam {#detectedobjectparam}

检测物体参数类型。

```typescript
type DetectedObjectParam = {
  /** 物体ID */
  id: string
  /** 图片源 */
  src: string
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 自定义数据 */
  customData?: Record<string, any>
}
```

## CustomCarpetParam {#customcarpetparam}

自定义地毯参数类型。

```typescript
type CustomCarpetParam = {
  /** 地毯ID */
  id: string
  /** 地毯材质类型编号 */
  type: number
  /** 点集合（用于矩形和圆形地毯的顶点坐标） */
  points?: Point[]
  /** 形状 */
  shape: 'rectangle' | 'round' | 'custom'
  /** 自定义数据 */
  customData?: Record<string, any>
}
```

## HeatmapPoint {#heatmappoint}

热力图数据点类型。

```typescript
type HeatmapPoint = Point & {
  /** 信号强度 */
  signal: number
}
```
