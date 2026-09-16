# LampCirclePicker

圆环通用色盘，支持自定义渐变色列表，输出归一化数值。

## Knowledge

### 导入

```tsx
import LampCirclePicker from '@ray-js/lamp-circle-picker';
```

### Props

| Prop                     | 类型                                  | 默认值                           | 必填   | 说明                                   |
| ------------------------ | ------------------------------------- | -------------------------------- | ------ | -------------------------------------- |
| `value`                  | `number`                              | `-`                              | **是** | 当前数值                               |
| `colorList`              | `{ offset: number; color: string }[]` | `[]`                             | 否     | 色盘渐变颜色列表                       |
| `hideThumb`              | `boolean`                             | `false`                          | 否     | 是否隐藏拖拽圆环                       |
| `temperature`            | `number`                              | `null`                           | 否     | 色温                                   |
| `innerRingRadius`        | `number`                              | `80`                             | 否     | 内部色环宽度                           |
| `radius`                 | `number`                              | `140`                            | 否     | 色盘宽度                               |
| `showInnerCircle`        | `boolean`                             | `true`                           | 否     | 展示数值圆环                           |
| `inactive`               | `boolean`                             | `false`                          | 否     | 关闭状态                               |
| `maskVisible`            | `boolean`                             | `false`                          | 否     | 是否显示遮罩                           |
| `lineCap`                | `'butt' \| 'round'`                   | `'round'`                        | 否     | 圆环末端样式                           |
| `titleStyle`             | `CSSProperties`                       | `{}`                             | 否     | 标题样式                               |
| `descText`               | `string`                              | `-`                              | 否     | 色环内部文字                           |
| `descStyle`              | `CSSProperties`                       | `{}`                             | 否     | 描述样式                               |
| `style`                  | `CSSProperties`                       | `{}`                             | 否     | 样式                                   |
| `innerBorderStyle`       | `{ color: string; width: number }`    | `null`                           | 否     | 内部圆环描边                           |
| `touchCircleStrokeStyle` | `string`                              | `''`                             | 否     | 触摸圆环描边颜色（同 ctx.shadowColor） |
| `touchCircleLineWidth`   | `number`                              | `0`                              | 否     | 触摸圆环描边宽度（同 ctx.shadowBlur）  |
| `useEventChannel`        | `boolean`                             | `false`                          | 否     | 是否启用事件通道                       |
| `eventChannelName`       | `string`                              | `"lampCirclePickerEventChannel"` | 否     | 事件名                                 |
| `onTouchStart`           | `(value: number) => void`             | `() => null`                     | 否     | 手指按下时的回调                       |
| `onTouchMove`            | `(value: number) => void`             | `() => null`                     | 否     | 手指拖动时的回调                       |
| `onTouchEnd`             | `(value: number) => void`             | `() => null`                     | 否     | 手指结束时的回调                       |

### 用法

```tsx
import React, { useState } from 'react';
import LampCirclePicker from '@ray-js/lamp-circle-picker';

export default () => {
  const [value, setValue] = useState(20);

  return (
    <LampCirclePicker
      value={value}
      innerRingRadius={80}
      colorList={[
        { offset: 0, color: '#ff0000' },
        { offset: 0.5, color: '#00ff00' },
        { offset: 1, color: '#0000ff' },
      ]}
      onTouchEnd={v => setValue(v)}
    />
  );
};
```

## Constraints

- **Must**: `onTouchMove` 触发频率较高，建议按需节流
- **Tip**: 可通过 `colorList` 自定义渐变色盘的颜色分布（offset 范围 0–1）
- **Tip**: `hideThumb` 可隐藏拖拽圆环，仅展示色盘与内圈信息
