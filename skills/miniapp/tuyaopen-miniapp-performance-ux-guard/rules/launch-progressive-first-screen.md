---
id: launch-progressive-first-screen
priority: HIGH
category: Launch > First Screen
---

# 精简首屏数据与组件

## Rule
首屏只加载可见区域必需的数据、组件和状态，二屏及低优先级模块应延后或渐进渲染。

## Bad

```js
Page({
  async onLoad() {
    const [primary, secondary, optional] = await Promise.all([
      fetchPrimaryData(),
      fetchSecondaryData(),
      fetchOptionalData(),
    ]);

    setData({ primary, secondary, optional });
  },
});
```

首屏等待全部数据，低优先级内容阻塞关键内容展示。

## Good

```js
Page({
  async onLoad() {
    const primary = await fetchPrimaryData();
    setData({ primary });

    scheduleAfterFirstPaint(() => {
      Promise.all([fetchSecondaryData(), fetchOptionalData()]).then(([secondary, optional]) => {
        setData({ secondary, optional });
      });
    });
  },
});
```

先渲染首屏关键内容，再延后加载次要内容。
`scheduleAfterFirstPaint` 可用项目内已有的首屏完成回调、容器事件或延后调度工具实现。

## Why
首屏性能的核心是让关键内容尽快可见。精简首屏依赖能降低 JS 执行、网络等待和渲染初始化成本。
