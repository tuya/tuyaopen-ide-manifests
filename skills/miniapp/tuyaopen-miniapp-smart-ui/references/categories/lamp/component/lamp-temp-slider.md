# LampTempSlider

照明色温 Slider，暖白<->冷白渐变，值域 0-1000。

## Knowledge

### 导入

```tsx
import LampTempSlider from '@ray-js/lamp-temp-slider';
```

### Props

| Prop           | 类型                      | 默认值     | 必填   | 说明                           |
| -------------- | ------------------------- | ---------- | ------ | ------------------------------ |
| `instanceId`   | `string`                  | `-`        | 否     | 实例 id                        |
| `value`        | `number`                  | `0`        | **是** | slider 值（通常范围 0 - 1000） |
| `disable`      | `boolean`                 | `false`    | 否     | 禁止滑动                       |
| `enableTouch`  | `boolean`                 | `true`     | 否     | 是否支持点击                   |
| `trackStyle`   | `CSSProperties`           | `{}`       | 否     | 滑动槽样式                     |
| `thumbStyle`   | `CSSProperties`           | `-`        | 否     | 手指滑块样式                   |
| `hidden`       | `boolean`                 | `false`    | 否     | 是否隐藏                       |
| `reverse`      | `boolean`                 | `false`    | 否     | 是否反向                       |
| `bgReverse`    | `boolean`                 | `false`    | 否     | 背景是否反向                   |
| `onTouchStart` | `(value: number) => void` | `() => {}` | 否     | slider 手指点击时触发          |
| `onTouchMove`  | `(value: number) => void` | `() => {}` | 否     | slider 手指拖动时触发          |
| `onTouchEnd`   | `(value: number) => void` | `() => {}` | 否     | slider 手指离开时触发          |

### 用法

```tsx
import React, { useEffect, useState } from 'react';
import LampTempSlider from '@ray-js/lamp-temp-slider';

export default () => {
  const [temp, setTemp] = useState(100);

  useEffect(() => {
    setTimeout(() => {
      setTemp(890);
    }, 1000);
  }, []);

  return (
    <LampTempSlider
      value={temp}
      onTouchEnd={val => {
        setTemp(val);
      }}
    />
  );
};
```

## Constraints

- **Must**: `value` 为色温滑块的归一化值，通常范围为 0 - 1000（具体映射由设备/业务约定决定）
- **Must**: 灯关时 `disable={true}`
- **Must**: `onTouchMove` 触发频率较高，建议业务侧按需节流
- **Must not**: 在 `onTouchMove` 中直接 setState + 下发 DP
- **Tip**: 如果需要支持"点击跳跃到指定位置"，可通过 `enableTouch` 控制
- **Tip**: `reverse`/`bgReverse` 可用于调整滑动方向与背景方向（以组件实现为准）
