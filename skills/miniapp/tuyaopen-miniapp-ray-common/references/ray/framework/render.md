# Render Script (RJS)

## 介绍

- 我们都知道，在智能小程序中，RJS 用来处理高频的绘图需求。开发面板小程序的时，我们通常使用 `Ray` 框架进行开发。
- [智能小程序 RJS](/cn/miniapp/develop/miniapp/framework/api/render#render-script)文章中介绍了 `RJS`的运行环境 API、实例方法和注意事项等。这些运行环境 API、实例方法和注意事项同样适用于在 `Ray` 框架中进行 `RJS` 开发。

## 示例代码

```js
// page/index.tsx
import React from 'react';
import Chart from '@/components/chart';
import { usePageInstance, usePageEvent } from '@ray-js/ray';

import Render from './index.rjs';

export default () => {
  const ctx = usePageInstance();
  usePageEvent('onShow', function () {
    /**
     * 微信端使用 rjs 注意事项
     * 一. 页面中使用 rjs
     * ray中使用的组件是 react 组件，即使是混合开发的原生组件，也被看成 react 组件，
     * 因微信小程序本身限制，页面无法直接获取到小程序原生组件的节点，
     * 所以页面中使用rjs，需要先获取原生组件的实例。
     */
    const compInst = ctx.selectComponent('#xx'); // 通过页面实例的 `selectComponent` 获取原生组件实例
    const render = new Render(compInst);
    setTimeout(() => {
      render.getDOMByRJS().then(() => {
        render.getDocument();
      });
    }, 500);
  });

  return <Chart title="rjs demo from rjs" id="xx" type="2d" />;
};
```

```js
// page/index.rjs
// render js 只能获取 canvas 节点
const LOG_PREFIX = '页面中的rjs: ';

export default Render({
  // module.exports = Render({
  document: null,
  x: 111,
  getDOMByRJS() {
    return getCanvasById('chart', this).then((chart) => {
      console.log(LOG_PREFIX, 'getDOMByRJS 1', chart);
    });
  },
  getDocument() {
    console.log(LOG_PREFIX, 'getDocument', this.document);
  },
});
```

- 以下是 chart 组件

```js
// @/components/chart/index.js
import Render from './index.rjs';
Component({
  lifetimes: {
    attached() {
      this.rjs = new Render(this);
    },
    ready: function () {
      this.rjs.getDOMByRJS();
    },
  },
  methods: {
    myFn: function (args) {
      console.log('this my function', args);
    },
  },
});
```

```js
// @/components/chart/index.rjs

export default Render({
  // module.exports = Render({
  getDOMByRJS() {
    getCanvasById('chart', this).then((res) => {
      console.log('组件中的rjs: getDOMByRJS', res);
    });
  },
});
```

```js
// @/components/chart/index.tyml
<canvas canvas-id="chart" id="chart" type="2d" />
```

```js
// @/components/chart/index.wxml
<canvas canvas-id="chart" id="chart" type="2d" />
```

```js
// @/components/chart/index.json
{
  "component": true
}

```

## 注意事项

- 以上写法可以同时运行在微信和智能小程序端，需要注意，如果运行在微信端，Ray 版本需要大于等于 `0.7.12`。
- 在微信运行 `getCanvasById` 时需要将组件或页面实例通过第二个参数传入。
- 因微信小程序本身限制，页面无法直接获取到小程序原生组件的节点，所以页面中使用 rjs，需要先通过 `usePageInstance` 获取页面实例，再通过 `selectComponent` 获取原生组件实例。
