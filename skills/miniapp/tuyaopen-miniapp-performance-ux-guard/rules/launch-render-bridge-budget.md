---
id: launch-render-bridge-budget
priority: HIGH
category: Launch > Render
---

# 控制逻辑层与渲染层通信数据量

## Rule
启动和首屏渲染阶段必须控制逻辑层到渲染层的数据量，禁止一次性下发大对象、大列表或未裁剪的接口响应。

## Bad
```js
Page({
  async onLoad() {
    const res = await ty.request({ url: "/api/home/full-config" });
    this.setData({ pageConfig: res.data });
  },
});
```
接口全量响应直接传给渲染层，序列化、diff 与跨线程通信都会拖慢首屏。

## Good
```js
Page({
  async onLoad() {
    const res = await ty.request({ url: "/api/home/full-config" });
    this.setData({
      "hero.title": res.data.hero.title,
      "hero.image": res.data.hero.image,
      "cards": res.data.cards.slice(0, 6),
    });
  },
});
```
只传首屏可见字段和首批数据，二屏内容在用户滚动或空闲时再补齐。

## Why
小程序跨线程通信需要序列化数据。启动阶段的数据量越大，首屏可见时间越晚，低端设备上尤其明显。
