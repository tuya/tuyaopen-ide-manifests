---
id: launch-engine-capability
priority: MEDIUM-HIGH
category: Launch > Runtime
---

# 优先使用基础库内置引擎能力

## Rule
平台或基础库已提供的启动、预加载、缓存、图片处理等能力应优先使用，禁止在业务层重复实现高成本方案。

## Bad
```js
Page({
  onLoad() {
    this.loadImage();
    this.preloadData();
    this.buildSkeletonByBusinessCode();
  },
});
```
页面自行实现预加载和骨架逻辑，容易重复计算并阻塞首屏。

## Good
```js
ty.preDownloadMiniApp?.({ subPackages: ["package-detail"] });
```
先确认容器、基础库或 Ray 框架是否已有对应能力，再在业务层接入最小逻辑。

## Why
基础库能力通常运行在更靠近容器的层级，能更早发起或更少跨层通信。重复自研会增加 JS 包体和启动执行成本。
