# LampBrightSlider

照明亮度 Slider，默认范围 10~1000。

## Knowledge

### 导入

```tsx
import LampBrightSlider from '@ray-js/lamp-bright-slider';
```

### Props

| Prop                  | 类型                      | 默认值     | 必填   | 说明                           |
| --------------------- | ------------------------- | ---------- | ------ | ------------------------------ |
| `instanceId`          | `string`                  | `-`        | 否     | 实例 id                        |
| `value`               | `number`                  | `0`        | **是** | slider 值（通常范围 1 - 1000） |
| `min`                 | `number`                  | `10`       | 否     | 亮度 slider 的最小值           |
| `max`                 | `number`                  | `1000`     | 否     | 亮度 slider 的最大值           |
| `disable`             | `boolean`                 | `false`    | 否     | 禁止滑动                       |
| `enableTouch`         | `boolean`                 | `true`     | 否     | 是否支持点击                   |
| `trackStyle`          | `CSSProperties`           | `{}`       | 否     | 滑动槽样式                     |
| `thumbStyle`          | `CSSProperties`           | `-`        | 否     | 手指滑块样式                   |
| `useCustomThumbStyle` | `boolean`                 | `null`     | 否     | 使用自定义按钮样式             |
| `useCustomTrackStyle` | `boolean`                 | `null`     | 否     | 使用自定义滑槽样式             |
| `onTouchStart`        | `(value: number) => void` | `() => {}` | 否     | slider 手指点击时触发          |
| `onTouchMove`         | `(value: number) => void` | `() => {}` | 否     | slider 手指拖动时触发          |
| `onTouchEnd`          | `(value: number) => void` | `() => {}` | 否     | slider 手指离开时触发          |

### 用法

```tsx
import React, { useEffect, useState } from 'react';
import LampBrightSlider from '@ray-js/lamp-bright-slider';

export default () => {
  const [bright, setBright] = useState(100);

  useEffect(() => {
    setTimeout(() => {
      setBright(890);
    }, 1000);
  }, []);

  return (
    <LampBrightSlider
      value={bright}
      onTouchEnd={val => {
        setBright(val);
      }}
    />
  );
};
```

## Constraints

- **Must**: 灯关时 `disable={true}`
- **Must**: 可通过 `min`/`max` 配置亮度范围，默认 10 - 1000
- **Must**: 在调整滑槽样式的时候务必一同调整按钮样式，大小应当一致，否则 UI 不美观
- **Must**: slider 整体宽度由 `trackStyle` 中的 `width` 决定；使用时必须设置宽度否则不美观；未设置时默认宽度为 646rpx（屏幕宽度为 750rpx）
- **Must not**: 在 `onTouchMove` 里直接调用 `setState`（会导致滑动不流畅）
- **Must**: `onTouchMove` 触发频率较高，建议业务侧按需节流
