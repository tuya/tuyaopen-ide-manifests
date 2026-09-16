# LampPercentSlider

通用水平百分比滑动条，适用于各类 0~100 数值控制。

## Knowledge

### 导入

```tsx
import LampPercentSlider from '@ray-js/lamp-percent-slider';
```

### Props

| Prop          | 类型                                | 默认值               | 必填 | 说明                   |
| ------------- | ----------------------------------- | -------------------- | ---- | ---------------------- |
| `instanceId`  | `string`                            | `-`                  | 否   | id                     |
| `value`       | `number`                            | `0`                  | 否   | 数值                   |
| `min`         | `number`                            | `0`                  | 否   | 最小值                 |
| `max`         | `number`                            | `100`                | 否   | 最大值                 |
| `disabled`    | `boolean`                           | `false`              | 否   | 禁用                   |
| `hidden`      | `boolean`                           | `null`               | 否   | 隐藏                   |
| `className`   | `string`                            | `null`               | 否   | 类名                   |
| `style`       | `CSSProperties`                     | `null`               | 否   | 样式                   |
| `enableTouch` | `boolean`                           | `true`               | 否   | 是否允许点击跳跃       |
| `showIcon`    | `boolean`                           | `null`               | 否   | 是否展示左侧 icon      |
| `showText`    | `boolean`                           | `null`               | 否   | 是否展示右侧文本       |
| `textColor`   | `string`                            | `rgba(0, 0, 0, 0.9)` | 否   | 字体颜色               |
| `thumbColor`  | `string`                            | `null`               | 否   | 按钮颜色               |
| `thumbShadow` | `string`                            | `null`               | 否   | 按钮阴影               |
| `thumbImage`  | `string`                            | `null`               | 否   | 使用图片渲染一个指示器 |
| `thumbStyle`  | `CSSProperties & { width: number }` | `null`               | 否   | 按钮样式               |
| `trackStyle`  | `CSSProperties`                     | `-`                  | 否   | 轨道样式               |
| `barStyle`    | `CSSProperties`                     | `-`                  | 否   | 滑条样式               |
| `onChange`    | `(value: number) => void`           | `null`               | 否   | 数值变化时回调         |
| `onTouchEnd`  | `(value: number) => void`           | `null`               | 否   | 松手时回调             |

### 用法

```tsx
import React, { useState } from 'react';
import LampPercentSlider from '@ray-js/lamp-percent-slider';

export default () => {
  const [value, onChange] = useState(30);

  return <LampPercentSlider value={value} onTouchEnd={onChange} />;
};
```

## Constraints

- **Must**: 默认范围为 0 - 100，可通过 `min`/`max` 自定义范围
- **Must**: 不需要配置 `trackStyle`，该组件默认宽度为 100%
- **Must**: 用 `onTouchEnd` 下发 DP，不用 `onChange`
- **Tip**: `onChange` 通常用于监听滑动过程中的数值变化；`onTouchEnd` 适合在松手后做最终提交（例如下发 dp）
- **Tip**: 若需要"点击跳跃到指定位置"的交互，可通过 `enableTouch` 控制是否允许点击
- **Tip**: 当不需要展示 label/icon/text 时，可通过 `showIcon`/`showText` 控制显示逻辑（以组件实现为准）
