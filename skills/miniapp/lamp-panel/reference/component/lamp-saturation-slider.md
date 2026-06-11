# LampSaturationSlider

照明饱和度滑条，输出 saturation 值（1–1000），需传入 hue 渲染滑槽颜色。

## Knowledge

### 导入

```tsx
import LampSaturationSlider from '@ray-js/lamp-saturation-slider';
```

### Props

| Prop                  | 类型                      | 默认值     | 必填   | 说明                                        |
| --------------------- | ------------------------- | ---------- | ------ | ------------------------------------------- |
| `value`               | `number`                  | `0`        | **是** | slider 值（HSV 的 saturation，范围 1–1000） |
| `hue`                 | `number`                  | `0`        | **是** | slider 展示的颜色值（HSV 的 hue，0–359）    |
| `instanceId`          | `string`                  | `-`        | 否     | 实例 id                                     |
| `disable`             | `boolean`                 | `false`    | 否     | 禁止滑动                                    |
| `enableTouch`         | `boolean`                 | `true`     | 否     | 是否支持点击                                |
| `max`                 | `100 \| 1000`             | `1000`     | 否     | 最大值                                      |
| `trackStyle`          | `CSSProperties`           | `{}`       | 否     | 滑动槽样式                                  |
| `thumbStyle`          | `CSSProperties`           | `-`        | 否     | 手指滑块样式                                |
| `useCustomThumbStyle` | `boolean`                 | `null`     | 否     | 使用自定义按钮样式                          |
| `useCustomTrackStyle` | `boolean`                 | `null`     | 否     | 使用自定义滑槽样式                          |
| `onTouchStart`        | `(value: number) => void` | `() => {}` | 否     | slider 手指点击时触发                       |
| `onTouchMove`         | `(value: number) => void` | `() => {}` | 否     | slider 手指拖动时触发                       |
| `onTouchEnd`          | `(value: number) => void` | `() => {}` | 否     | slider 手指离开时触发                       |

### 用法

```tsx
import React, { useState } from 'react';
import LampSaturationSlider from '@ray-js/lamp-saturation-slider';

export default () => {
  const [saturation, setSaturation] = useState(500);

  return (
    <LampSaturationSlider hue={100} value={saturation} onTouchEnd={val => setSaturation(val)} />
  );
};
```

## Constraints

- **Must**: `onTouchMove` 触发频率较高，建议业务侧按需节流
- **Must**: 当只需要最终值时优先使用 `onTouchEnd`
- **Tip**: 需配合 `hue` 值来渲染对应颜色的饱和度滑槽
