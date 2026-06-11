# VerticalPercentSlider

竖向百分比滑动条，适用于竖向调节控件。

## Knowledge

### 导入

```tsx
import LampVerticalPercentSlider from '@ray-js/lamp-vertical-percent-slider';
```

### Props

| Prop           | 类型                      | 默认值               | 必填 | 说明              |
| -------------- | ------------------------- | -------------------- | ---- | ----------------- |
| `instanceId`   | `string`                  | `-`                  | 否   | id                |
| `value`        | `number`                  | `0`                  | 否   | 数值              |
| `min`          | `number`                  | `0`                  | 否   | 最小值            |
| `max`          | `number`                  | `100`                | 否   | 最大值            |
| `disabled`     | `boolean`                 | `false`              | 否   | 禁用              |
| `className`    | `string`                  | `null`               | 否   | 类名              |
| `style`        | `CSSProperties`           | `null`               | 否   | 样式              |
| `width`        | `string`                  | `'8px'`              | 否   | 宽度              |
| `barWidth`     | `string`                  | `width`              | 否   | 滑条宽度          |
| `height`       | `string`                  | `'200px'`            | 否   | 高度              |
| `barColor`     | `string`                  | `'#fff'`             | 否   | 滑条颜色          |
| `trackColor`   | `string`                  | `rgba(0, 0, 0, 0.1)` | 否   | 滑槽颜色          |
| `trackStyle`   | `CSSProperties`           | `-`                  | 否   | 轨道样式          |
| `barStyle`     | `CSSProperties`           | `-`                  | 否   | 滑条样式          |
| `iconColor`    | `string`                  | `rgba(0,0,0,0.9)`    | 否   | 图标颜色          |
| `textColor`    | `string`                  | `rgba(0, 0, 0, 0.9)` | 否   | 字体颜色          |
| `thumbColor`   | `string`                  | `null`               | 否   | 按钮颜色          |
| `thumbShadow`  | `string`                  | `null`               | 否   | 按钮阴影          |
| `showIcon`     | `boolean`                 | `null`               | 否   | 是否展示左侧 icon |
| `showText`     | `boolean`                 | `null`               | 否   | 是否展示右侧文本  |
| `onChange`     | `(value: number) => void` | `null`               | 否   | 数值变化时回调    |
| `onTouchStart` | `(value: number) => void` | `null`               | 否   | 开始时回调        |
| `onTouchEnd`   | `(value: number) => void` | `null`               | 否   | 松手时回调        |

### 用法

```tsx
import React, { useState } from 'react';
import LampVerticalPercentSlider from '@ray-js/lamp-vertical-percent-slider';

export default () => {
  const [value, setValue] = useState(50);

  const onTouchStart = (v: number) => {
    // console.log('start', v);
  };

  const onTouchEnd = (v: number) => {
    setValue(v);
  };

  return (
    <LampVerticalPercentSlider
      barColor="red"
      trackColor="blue"
      max={1000}
      value={value}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    />
  );
};
```

## Constraints

- **Must**: 默认范围为 0 - 100，可通过 `min`/`max` 自定义范围
- **Must**: `width`/`height` 可用于控制竖向滑条的整体尺寸
- **Tip**: `onChange` 通常用于监听滑动过程中的数值变化；`onTouchEnd` 适合在松手后做最终提交（例如下发 dp）
