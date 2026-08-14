---
id: obs-key-metrics
priority: LOW-MEDIUM
category: Observability > Metrics
---

# 关键体验路径埋点覆盖

## Rule
关键体验路径必须埋点覆盖（页面加载耗时、关键操作耗时、错误率）。

## Bad
```js
// 页面无任何性能相关上报
Page({ onLoad() { /* ... */ } });
```
线上出问题无法定位是网络/渲染/逻辑层的耗时问题。

## Good
```js
report('page_load', { t_onLoad: t0, t_data: t1, t_firstPaint: t2, t_interactive: t3 });
```
在关键节点记录时间戳并上报：页面 onLoad → 首屏数据到达 → 首屏渲染完成 → 可交互。

## Why
没有度量就没有优化依据。关键路径埋点是发现和验证体验问题的基础设施。
