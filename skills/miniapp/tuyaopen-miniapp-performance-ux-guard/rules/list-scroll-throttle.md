---
id: list-scroll-throttle
priority: HIGH
category: List > Scroll
---

# scroll-view 滚动回调必须节流

## Rule
scroll-view 的 bindscroll 回调必须节流，禁止在每次滚动事件中执行重逻辑。

## Bad

```js
function onListScroll(event) {
  const visibleRange = calculateVisibleRange(event);
  setData({ visibleRange });
}
```

每次滚动都执行计算和 setData，滚动频率越高越容易卡顿。

## Good

```js
const onListScroll = throttle((event) => {
  const visibleRange = calculateVisibleRange(event);
  setData({ visibleRange });
}, 50);

// For visual-only scroll effects, prefer render-layer handling.
```

滚动处理限频，视觉响应优先放在渲染层，降低逻辑层压力。

## Why
滚动事件触发频率极高（>60 次/秒），每次跨线程通信与 setData 会导致滚动严重卡顿。
