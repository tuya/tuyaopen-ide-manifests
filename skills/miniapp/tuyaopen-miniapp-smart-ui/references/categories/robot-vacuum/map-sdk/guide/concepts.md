# 基本概念

了解 Tuya Robot Map 的核心概念。

## 核心组件

后续文档中，我们会使用 `RobotMap` 组件作为示例，你可以根据实际需求选择使用 `RobotMap` 或 `RjsRobotMap` 组件。

### RobotMap 组件

React 地图组件，提供完整的地图渲染和交互功能：

```tsx
<RobotMap />
```

::: tip

- `RobotMap` 组件是基于 [WebView](https://developer.tuya.com/cn/miniapp/develop/ray/component/open/web-view) 开发的，开发前请详细阅读[原生组件说明](https://developer.tuya.com/cn/miniapp/develop/miniapp/component/native-component/native-component)。

- `RobotMap` 默认铺满全屏，适用于**首页实时地图**等场景，一个页面只能有一个 `RobotMap` 组件。

- 需要在小程序`global.config.ts`中配置`webviewRoot`让小程序能够正确加载`RobotMap`的资源。

```json
{
  "webviewRoot": "node_modules/@ray-js/robot-map-sdk/dist-app"
}
```

:::

### RjsRobotMap 组件

基于Rjs开发的地图组件，它拥有和 `RobotMap` 组件相同的Props。

```tsx
<RjsRobotMap />
```

::: tip
`RjsRobotMap` 基于 [Rjs](https://developer.tuya.com/cn/miniapp/develop/ray/framework/render) 开发，它没有原生组件的限制，一个页面可以有多个 `RjsRobotMap` 组件。适用于**多地图**、**弹窗里的地图** 等场景。
:::

::: warning
引入 `RjsRobotMap` 对页面加载速度有一定影响。如无必要场景，我们建议始终使用 `RobotMap` 组件。
:::

## 坐标系统

### 地图原点坐标

地图原点是扫地机器人运行过程中确定的参考点，地图上的元素都是基于这个原点计算的相对位置。

::: tip
地图原点本身是相对于地图左上角来定位的。例如在一张100 x 100(宽 x 高)的 地图中，如果原点坐标是(20, 80)，表示原点位于相对于地图左上角(20, 80)的位置。
:::

### 地图坐标系

地图坐标系是本 SDK 实际使用的坐标系，用于在地图上渲染和显示各种元素。地图坐标系以地图原点为中心(0, 0)：

- X轴：向右为正方向
- Y轴：向下为正方向

#### 与机器坐标系的不同

需要注意的是，本 SDK 使用的地图坐标系与扫地机器人设备本身使用的机器坐标系在 Y 轴方向上相反：

- **机器坐标系**（设备使用的坐标系）：
  - X轴：向右为正方向
  - Y轴：向上为正方向

- **地图坐标系**（本 SDK 使用的坐标系）：
  - X轴：向右为正方向（与机器坐标系一致）
  - Y轴：向下为正方向（与机器坐标系相反）

SDK 采用标准的屏幕坐标系（Screen Coordinate System）进行渲染，因此 Y 轴方向与机器坐标系相反。在 SDK 中，如果原点在(0, 0)，坐标为(1, 1)的点会渲染在原点的右下方。

例如，以下元素的坐标均使用地图坐标系：

- 充电桩
- 清扫路径 (含机器人位置)
- 虚拟墙
- 禁区
- 清扫区域
- 分割线
- 其他自定义元素
- ...

::: tip
本文档中，如果未特别说明，涉及到的坐标均指地图坐标系（X向右，Y向下）。
:::
