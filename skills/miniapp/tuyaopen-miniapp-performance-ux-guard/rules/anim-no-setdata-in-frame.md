---
id: anim-no-setdata-in-frame
priority: MEDIUM
category: Animation > Performance
---

# Avoid High-Frequency State Updates During Animation

## Rule
动画进行中应避免高频、视觉型或可延后的状态更新打断动画节点布局；必要的业务状态更新不应为了动画规则而被阻塞。优先合并更新、节流滚动/手势回调，或将非关键 UI 更新延后到 `transitionend` / `animationend`。

## Bad (Ray 小程序)
```tsx
function onDragMove(offset: number) {
  setHeaderStyle({
    opacity: computeOpacity(offset),
    height: computeHeight(offset),
  });
}
```
拖拽或动画帧内持续写入 React state，会让 Ray 频繁跨逻辑层和渲染层同步，容易出现掉帧。

## Good (Ray 小程序)
```tsx
function onDragMove(offset: number) {
  updateVisualByRjs(offset);
}

function onDragEnd(offset: number) {
  setHeaderCollapsed(offset > collapseThreshold);
}
```
动画跟手部分交给 RJS 或原生组件能力处理，只在手势结束时提交必要业务状态。

## Why
动画期间频繁触发状态更新会带来 diff、布局和跨线程通信成本，表现为卡顿或闪烁。但这条规则是性能建议，不是业务正确性的硬性阻断；订单状态、任务进度、错误态等必要状态仍应及时更新。
