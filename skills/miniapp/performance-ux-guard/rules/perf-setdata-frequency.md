---
id: perf-setdata-frequency
priority: CRITICAL
category: Performance > State Update
---

# 高频回调中避免直接 setData

## Rule
避免在高频回调（scroll/input/touchmove）中直接调用 setData，必须节流或合并

## Bad

```js
function onHighFrequencyEvent(event) {
  setData({ position: event.position });
}
```

高频事件每次触发都跨逻辑层和渲染层通信。

## Good

```js
const onHighFrequencyEvent = throttle((event) => {
  setData({ position: event.position });
}, 50);

// Better for purely visual response:
// handle visual state in the render layer without setData.
```

节流、合并或渲染层处理，避免每帧触发 setData。

## Why
高频 setData 会造成逻辑层-渲染层通信拥堵，表现为滚动卡顿、输入延迟。建议 ≤16ms 内最多一次通信。
