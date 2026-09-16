---
id: launch-skeleton-screen
priority: HIGH
category: Launch > First Screen
---

# 使用容器级骨架屏

## Rule
使用容器级骨架屏方案，不在业务层自行绘制骨架

## Bad
```js
<View>
  {isLoading ? <SkeletonPlaceholder /> : <RealContent data={data} />}
</View>
```
业务组件内维护 isLoading + 自绘骨架 UI — 增加首屏渲染复杂度。

## Good
```json
{
  "enableSkeleton": true
}
```
使用小程序容器提供的骨架屏能力（IDE 自动生成），在数据到达前由容器展示。

## Why
容器骨架屏在页面 JS 执行前就能展示，比业务自绘骨架更早可见，用户感知等待时间更短。
