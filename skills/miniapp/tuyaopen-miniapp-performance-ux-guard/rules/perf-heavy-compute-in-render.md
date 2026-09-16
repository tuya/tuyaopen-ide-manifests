---
id: perf-heavy-compute-in-render
priority: HIGH
category: Performance > Rendering
---

# 禁止渲染路径内重计算

## Rule
禁止在渲染路径或动画回调内执行复杂计算或大数据处理

## Bad
```js
// 模板 / 渲染函数内链式重算
items.filter((i) => i.on).map((i) => i.label).sort();
```
每次 setData 都重新计算

## Good
```js
// 数据变更时预计算一次，写入 state；模板只读 displayLabels
this.setData({ displayLabels: computeLabels(items) });
```
在数据变更时预计算结果缓存到 state，模板仅读取已计算结果

## Why
渲染路径中的重计算会阻塞 UI 线程，导致帧丢失和交互延迟。复杂计算应提前执行并缓存。
