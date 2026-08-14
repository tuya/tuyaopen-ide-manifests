# 地图 (map)

[AI-generated summary: 地图组件文档，用于在 Tuya MiniApp 中集成高德或 Google 地图展示地理位置信息和轨迹。支持在地图上添加交互式标记点、路线、圆形区域和多边形覆盖层。覆盖内容：longitude, latitude, scale, minScale, maxScale, markers, polyline, circles, polygons, borderWidth, borderColor, borderRadius, backgroundColor, onMarkertap, onCallouttap, onRegionchange, onInitdone, MapMarker, MapPolyline, MapCircle, MapPolygon, callout]

### Map

> [VERSION] @ray-js/ray >= 0.6.9 | 基础库 >= 2.0.12 | MapKit >= 2.2.2

#### 描述

地图组件；真机国内使用高德地图，海外使用 Google 地图。Tuya MiniApp IDE 和在线预览上是通过 WebView 模拟的与真机存在差异，请以真机效果为主。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `longitude` | `number` | 否 | - | 中心经度 |
| `latitude` | `number` | 否 | - | 中心纬度 |
| `scale` | `number` | 否 | `16` | 缩放级别，取值范围为 4-19 |
| `minScale` | `number` | 否 | `4` | 最小缩放级别 |
| `maxScale` | `number` | 否 | `19` | 最大缩放级别 |
| `markers` | `MapMarker[]` | 否 | - | 标记点 |
| `polyline` | `MapPolyline[]` | 否 | - | 路线 |
| `circles` | `MapCircle[]` | 否 | - | 圆 |
| `polygons` | `MapPolygon[]` | 否 | - | 多边形 |
| `borderWidth` | `number` | 否 | `0` | 边框的宽度，单位 px |
| `borderStyle` | `"solid" \| "dashed"` | 否 | `"solid"` | 边框的样式 |
| `borderColor` | `string` | 否 | `"#ffffff"` | 边框的颜色，必须为十六进制格式 |
| `borderRadius` | `number` | 否 | `0` | 边框的圆角，单位 px |
| `borderRadiusTopLeft` | `number` | 否 | - | 边框的左上角圆角大小，单位 px |
| `borderRadiusTopRight` | `number` | 否 | - | 边框的右上角圆角大小，单位 px |
| `borderRadiusBottomLeft` | `number` | 否 | - | 边框的左下角圆角大小，单位 px |
| `borderRadiusBottomRight` | `number` | 否 | - | 边框的右下角圆角大小，单位 px |
| `backgroundColor` | `string` | 否 | `"#ffffff"` | 背景颜色，必须为十六进制格式 |
| `onMarkertap` | `(event: MapMarkertapEvent) => void` | 否 | - | 点击标记点时触发 |
| `onCallouttap` | `(event: MapCallouttapEvent) => void` | 否 | - | 点击标记点对应的气泡时触发 |
| `onRegionchange` | `(event: MapRegionchangeEvent) => void` | 否 | - | 视野发生变化时触发 |
| `onInitdone` | `(event: MapInitdoneEvent) => void` | 否 | - | 初始化完成时触发 |

#### 示例代码

##### 基础用法

```tsx
import React from 'react';
import { Map, View } from '@ray-js/ray';
export default function () {
  return (
    <View style={{ padding: '20px' }}>
      <Map
        longitude={116.397428}
        latitude={39.90923}
        scale={16}
        style={{ width: '100%', height: '300px' }}
      />
    </View>
  );
}
```

##### 标记点与气泡

```tsx
import React from 'react';
import { Map, View, Text } from '@ray-js/ray';

export default function () {
  const markers = [
    {
      id: 1,
      longitude: 116.397428,
      latitude: 39.90923,
      title: '天安门',
      iconPath: '/images/marker.png',
      width: 30,
      height: 30,
      callout: {
        content: '天安门广场',
        color: '#333',
        fontSize: 14,
        bgColor: '#fff',
        borderRadius: 4,
        padding: 8,
        textAlign: 'center',
      },
    },
    {
      id: 2,
      longitude: 116.407428,
      latitude: 39.91523,
      title: '故宫',
      iconPath: '/images/marker.png',
      width: 30,
      height: 30,
    },
  ];

  return (
    <View style={{ padding: '20px' }}>
      <Map
        longitude={116.397428}
        latitude={39.90923}
        scale={14}
        minScale={10}
        maxScale={18}
        markers={markers}
        style={{ width: '100%', height: '300px' }}
        onMarkertap={(e) => console.log('标记点:', e.detail.markerId)}
        onCallouttap={(e) => console.log('气泡:', e.detail.markerId)}
        onInitdone={() => console.log('地图初始化完成')}
      />
    </View>
  );
}
```

##### 路线与覆盖层

```tsx
import React from 'react';
import { Map, View } from '@ray-js/ray';

export default function () {
  const polyline = [
    {
      points: [
        { latitude: 39.90923, longitude: 116.397428 },
        { latitude: 39.91523, longitude: 116.407428 },
        { latitude: 39.92023, longitude: 116.417428 },
      ],
      color: '#1890ff',
      width: 4,
      dottedLine: false,
    },
  ];

  const circles = [
    {
      latitude: 39.90923,
      longitude: 116.397428,
      radius: 500,
      color: '#1890ff80',
      fillColor: '#1890ff20',
      strokeWidth: 2,
    },
  ];

  const polygons = [
    {
      points: [
        { latitude: 39.91, longitude: 116.40 },
        { latitude: 39.92, longitude: 116.41 },
        { latitude: 39.91, longitude: 116.42 },
      ],
      strokeColor: '#ff4d4f',
      fillColor: '#ff4d4f20',
      strokeWidth: 2,
    },
  ];

  return (
    <View style={{ padding: '20px' }}>
      <Map
        longitude={116.407428}
        latitude={39.91523}
        scale={13}
        polyline={polyline}
        circles={circles}
        polygons={polygons}
        borderRadius={12}
        style={{ width: '100%', height: '300px' }}
        onRegionchange={(e) => console.log('视野变化:', e.detail.type)}
      />
    </View>
  );
}
```

### 相关链接

相关 API：[createMapContext](/cn/miniapp/develop/miniapp/api/media/map/createMapContext)。这是基于异层渲染的原生组件, 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayMap" 
  qrCodeUrl="/images/qrCode/rayMap.png" 
  lang="zh">
</DemoBlock>

### 常见问题

1. 地图组件的经纬度必填，如果不填经纬度则默认值是北京的经纬度。
2. Tuya MiniApp IDE 上是通过 WebView 模拟的与真机存在差异，请以真机效果为主。
3. 相关原理请参考 [基于异层渲染的原生组件](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
4. 请注意 [原生组件使用限制](/cn/miniapp/develop/miniapp/component/native-component/native-component)。
