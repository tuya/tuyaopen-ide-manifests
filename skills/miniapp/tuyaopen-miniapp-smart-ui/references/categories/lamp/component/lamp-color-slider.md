# LampColorSlider

照明彩光色相滑条，彩虹渐变背景，输出 hue 值。

## Knowledge

### 导入

```tsx
import LampColorSlider from '@ray-js/lamp-color-slider';
```

### Props

| Prop                  | 类型                      | 默认值     | 必填   | 说明                                    |
| --------------------- | ------------------------- | ---------- | ------ | --------------------------------------- |
| `instanceId`          | `string`                  | `-`        | 否     | 实例 id                                 |
| `value`               | `number`                  | `0`        | **是** | slider 值                               |
| `disable`             | `boolean`                 | `false`    | 否     | 禁止滑动                                |
| `enableTouch`         | `boolean`                 | `true`     | 否     | 是否支持点击                            |
| `trackStyle`          | `CSSProperties`           | `{}`       | 否     | 滑动槽样式                              |
| `thumbStyle`          | `CSSProperties`           | `{}`       | 否     | 手指滑块样式                            |
| `hidden`              | `boolean`                 | `false`    | 否     | 是否隐藏                                |
| `startEventName`      | `string`                  | `null`     | 否     | 开始拖动时的事件名（eventChannel 可用） |
| `moveEventName`       | `string`                  | `null`     | 否     | 正在拖动时的事件名（eventChannel 可用） |
| `endEventName`        | `string`                  | `null`     | 否     | 结束拖动时的事件名（eventChannel 可用） |
| `useCustomThumbStyle` | `boolean`                 | `null`     | 否     | 使用自定义按钮样式                      |
| `useCustomTrackStyle` | `boolean`                 | `null`     | 否     | 使用自定义滑槽样式                      |
| `onTouchStart`        | `(value: number) => void` | `() => {}` | 否     | slider 手指点击时触发                   |
| `onTouchMove`         | `(value: number) => void` | `() => {}` | 否     | slider 手指拖动时触发                   |
| `onTouchEnd`          | `(value: number) => void` | `() => {}` | 否     | slider 手指离开时触发                   |

### 用法

```tsx
import React, { useEffect, useState } from 'react';
import LampColorSlider from '@ray-js/lamp-color-slider';

export default () => {
  const [hue, setHue] = useState(100);

  useEffect(() => {
    setTimeout(() => {
      setHue(321);
    }, 3000);
  }, []);

  return (
    <LampColorSlider
      value={hue}
      disable
      onTouchMove={val => {
        setHue(val);
      }}
      onTouchEnd={val => {
        setHue(val);
      }}
    />
  );
};
```

## Constraints

- **Must**: `onTouchMove` 触发频率较高，建议业务侧按需节流
- **Must**: 当只需要最终值时优先使用 `onTouchEnd`；需要实时预览时再使用 `onTouchMove`（建议节流）
- **Must**: 用 `hidden` 隐藏组件，不用条件渲染（例如能力不支持或当前模式不展示）
- **Tip**: 如需通过事件通道（eventChannel）派发不同阶段事件，可配置 `startEventName`/`moveEventName`/`endEventName`（以组件实现为准）
