---
id: anim-rjs-scroll-gesture
priority: MEDIUM
category: Animation > RJS
---

# Use RJS or Native Ray Events for Scroll and Gesture-Linked Animation

## Rule
滚动联动、手势跟随、高频绘制等交互动画优先使用 Ray 的 RJS 或组件原生能力，减少逻辑层参与。此规则不是强制阻断项：如果 `ScrollView` 等 Ray 组件已经暴露 `onScroll` / `onTouchMove`，且逻辑简单、已节流、不会在每帧写入大状态，可以直接使用组件事件。

参考：[Ray Render Script (RJS)](https://developer.tuya.com/cn/miniapp/develop/ray/framework/render)。

## Bad (Ray 小程序)
```tsx
function HeaderScroll() {
  const [opacity, setOpacity] = useState(1);

  return (
    <ScrollView
      scrollY
      onScroll={(event) => {
        setOpacity(computeOpacity(event.detail.scrollTop));
      }}
    >
      <View style={{ opacity }}>...</View>
    </ScrollView>
  );
}
```
滚动过程中每次回调都更新 React state，联动样式频繁跨逻辑层和渲染层通信。

## Good (Ray 小程序)
```tsx
function HeaderScroll() {
  const onScroll = useMemo(
    () =>
      throttle((event) => {
        updateHeaderProgress(event.detail.scrollTop);
      }, 50),
    []
  );

  return (
    <ScrollView scrollY onScroll={onScroll}>
      <View className="header">...</View>
    </ScrollView>
  );
}
```
组件已提供 `onScroll` 时，可以直接使用 Ray 事件，但需要节流并只提交必要的轻量状态。

## RJS Example
```tsx
import Render from './index.rjs';
import { usePageEvent, usePageInstance } from '@ray-js/ray';

export default function Page() {
  const page = usePageInstance();

  usePageEvent('onShow', () => {
    const nativeComp = page.selectComponent('#chart');
    const render = new Render(nativeComp);
    render.getDOMByRJS();
  });

  return <Chart id="chart" />;
}
```

```js
// index.rjs
export default Render({
  getDOMByRJS() {
    return getCanvasById('chart', this);
  },
});
```
高频绘制或渲染层计算放到 RJS 中处理，页面侧只负责初始化和必要通信。

## Why
滚动和手势事件频率高，逐帧进入逻辑层容易造成通信和 diff 压力。Ray 场景应优先使用 RJS、组件原生能力或节流后的轻量事件处理。
