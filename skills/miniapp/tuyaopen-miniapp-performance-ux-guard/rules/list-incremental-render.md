---
id: list-incremental-render
priority: MEDIUM
category: List > Rendering
---

# 首屏大列表应增量渲染

## Rule
首屏列表数据量大时应采用增量渲染（分批 setData），避免一次性渲染阻塞。

## Bad
```js
this.setData({ list: allData }); // 一次性设置 100 条
```
单帧内数据与视图更新过大，阻塞渲染线程。

## Good
```js
this.setData({ list: allData.slice(0, 20) });
setTimeout(() => {
  this.setData({ list: allData.slice(0, 40) });
}, 0);
// 或使用 requestAnimationFrame 分批追加
```
先出首屏，再渐进追加，缩短可交互时间。

## Why
一次性渲染大量数据会导致长时间 JS 阻塞和白屏。分批渲染让首屏内容尽快可见，渐进展示。
