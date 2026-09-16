# 画布 (canvas)

[AI-generated summary: 本文档介绍Ray框架中的Canvas画布组件，支持2D和WebGL渲染方式，提供RJS绘制和createCanvasContext API两种使用方法，适用于绘制图表、动画和各种图形效果。覆盖内容：Canvas组件、type属性、canvasId属性、disableScroll属性、onError事件、RJS绘制、getContext方法、createCanvasContext API、绘制图形方法（arc、fillRect、strokeRect、beginPath等）、draw方法、clearRect方法、混合开发、性能优化]

### Canvas

> [VERSION] @ray-js/ray >= 0.5.10

#### 描述

画布组件。

#### 属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `type` | `"2d" \| "webgl" \| string` | 否 | `"2d"` | 指定 canvas 类型，有效值为 2d、webgl |
| `canvasId` | `string` | 否 | `""` | canvas 组件的唯一标识符；若指定了 type 为 2d/webgl 可不再指定 |
| `disableScroll` | `boolean` | 否 | `false` | 在 canvas 中移动且绑定了手势事件时，是否禁止页面滚动与下拉刷新 |
| `onError` | `(event: CanvasErrorEvent) => void` | 否 | - | 当发生错误时触发，detail 含 errMsg |

#### 示例代码

##### 使用 RJS 进行绘制（推荐）

```tsx
// index.tsx
import React, { useRef, useEffect } from 'react';
import { Canvas, View, Text, usePageEvent } from '@ray-js/ray';
import Render from './render.rjs';

export default function () {
  const canvasRef = useRef(null);

  usePageEvent('onShow', () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const render = new Render(canvas, canvas.width, canvas.height);
      render.start();
    }
  });

  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ marginBottom: '10px', fontSize: '16px' }}>Canvas RJS 绘制示例</Text>
      <Canvas
        ref={canvasRef}
        type="2d"
        canvasId="rjsCanvas"
        style={{ width: '100%', height: '300px', backgroundColor: '#f5f5f5' }}
      />
    </View>
  );
}
```

```javascript
// render.rjs
export default class Render {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.ctx = canvas.getContext('2d');
  }

  start() {
    this.drawBackground();
    this.drawCircle();
    this.drawRect();
    this.drawText();
  }

  drawBackground() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawCircle() {
    this.ctx.beginPath();
    this.ctx.arc(100, 100, 50, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.fill();
    this.ctx.strokeStyle = '#c92a2a';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  drawRect() {
    this.ctx.fillStyle = '#4dabf7';
    this.ctx.fillRect(200, 50, 100, 100);
    this.ctx.strokeStyle = '#1971c2';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(200, 50, 100, 100);
  }

  drawText() {
    this.ctx.font = '20px sans-serif';
    this.ctx.fillStyle = '#333';
    this.ctx.fillText('RJS Canvas', 120, 200);
  }
}
```

##### 使用 createCanvasContext API 绘制

```tsx
import React, { useEffect } from 'react';
import { Canvas, View, Button, createCanvasContext } from '@ray-js/ray';

export default function () {
  const drawSmile = () => {
    const context = createCanvasContext('apiCanvas');
    context.setStrokeStyle('#ff0000');
    context.setLineWidth(2);
    context.arc(100, 100, 60, 0, 2 * Math.PI, true);
    context.stroke();
    context.beginPath();
    context.arc(100, 100, 40, 0, Math.PI, false);
    context.stroke();
    context.beginPath();
    context.arc(80, 80, 5, 0, 2 * Math.PI, true);
    context.fill();
    context.beginPath();
    context.arc(120, 80, 5, 0, 2 * Math.PI, true);
    context.fill();
    context.draw();
  };

  const drawRect = () => {
    const context = createCanvasContext('apiCanvas');
    context.setFillStyle('rgb(200, 0, 0)');
    context.fillRect(10, 10, 55, 50);
    context.setFillStyle('rgba(0, 0, 200, 0.5)');
    context.fillRect(30, 30, 55, 50);
    context.draw();
  };

  const clearCanvas = () => {
    const context = createCanvasContext('apiCanvas');
    context.clearRect(0, 0, 300, 200);
    context.draw();
  };

  useEffect(() => {
    drawSmile();
  }, []);

  return (
    <View style={{ padding: '20px' }}>
      <Canvas
        canvasId="apiCanvas"
        type="2d"
        style={{ width: '100%', height: '200px', border: '1px solid #eee' }}
        onTouchStart={(e) => console.log('触摸开始:', e.touches[0]?.x, e.touches[0]?.y)}
      />
      <View style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap' }}>
        <Button size="mini" onClick={drawSmile}>绘制笑脸</Button>
        <Button size="mini" onClick={drawRect}>绘制矩形</Button>
        <Button size="mini" onClick={clearCanvas}>清空画布</Button>
      </View>
    </View>
  );
}
```

### 使用方法

> 在 Ray 中使用 canvas 进行[混合开发](/cn/miniapp/develop/ray/framework/mixed-development)

- 方法一: 使用 [RJS](/cn/miniapp/develop/ray/framework/render) 进行绘制，可以获取到 canvas 节点，可以绘制图表、动画和各种图形等。

- 方法二: 在逻辑层 js 中配合 [createCanvasContext](/cn/miniapp/develop/miniapp/api/canvas/CanvasContext/createCanvasContext) API 使用，此方法获取不到 canvas node 节点。

```js
import { createCanvasContext } from '@ray-js/ray';

const context = createCanvasContext('***');
```

> 推荐使用方法一 [RJS](/cn/miniapp/develop/ray/framework/render) 进行绘制，性能更好。

### 相关链接

相关 API: [createCanvasContext](/cn/miniapp/develop/miniapp/api/canvas/CanvasContext/createCanvasContext)。

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayRjsPlugin" 
  qrCodeUrl="/images/qrCode/rayRjsPlugin.png" 
  lang="zh">
</DemoBlock>
