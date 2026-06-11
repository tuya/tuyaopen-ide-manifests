# LampCirclePickerWhite

圆形白光色温色盘组件，输出 temperature 值（0–1000）。

## Knowledge

### 导入

```tsx
import LampCirclePickerWhite from '@ray-js/lamp-circle-picker-white';
```

### Props

| Prop               | 类型                            | 默认值                                | 必填 | 说明                                |
| ------------------ | ------------------------------- | ------------------------------------- | ---- | ----------------------------------- |
| `temperature`      | `number`                        | `0`                                   | 否   | 色温（0–1000）                      |
| `thumbRadius`      | `number`                        | `15`                                  | 否   | 拖动色圈宽度                        |
| `radius`           | `number`                        | `150`                                 | 否   | 色盘宽度                            |
| `minRange`         | `number`                        | `0`                                   | 否   | 移动最小区间                        |
| `canvasId`         | `string`                        | `null`                                | 否   | 画布 ID（同页面多色盘时需保证唯一） |
| `showPercent`      | `boolean`                       | `-`                                   | 否   | 展示百分比                          |
| `textStyles`       | `CSSProperties`                 | `-`                                   | 否   | 字体样式                            |
| `bubbleTextStyles` | `CSSProperties`                 | `-`                                   | 否   | 气泡字体样式                        |
| `percentValueMap`  | `Record<string, number>`        | `-`                                   | 否   | 百分比映射                          |
| `thumbBorderWidth` | `number`                        | `-`                                   | 否   | 按钮边框宽度                        |
| `useEventChannel`  | `boolean`                       | `false`                               | 否   | 是否启用事件通道                    |
| `eventChannelName` | `string`                        | `"lampCirclePickerWhiteEventChannel"` | 否   | 事件通道名称                        |
| `onTouchStart`     | `(temperature: number) => void` | `-`                                   | 否   | 手指按下时的回调                    |
| `onTouchMove`      | `(temperature: number) => void` | `-`                                   | 否   | 手指拖动时的回调                    |
| `onTouchEnd`       | `(temperature: number) => void` | `-`                                   | 否   | 手指结束时的回调                    |

### 用法

```tsx
import React, { useState } from 'react';
import LampCirclePickerWhite from '@ray-js/lamp-circle-picker-white';

export default () => {
  const [temp, setTemp] = useState(100);

  return (
    <LampCirclePickerWhite
      thumbRadius={15}
      temperature={temp}
      radius={150}
      canvasId="white_picker_1"
      onTouchEnd={setTemp}
    />
  );
};
```

## Constraints

- **Must**: 色盘组件自带 32rpx padding（不可修改），业务侧布局需预留该内边距
- **Must**: `onTouchMove` 触发频率较高，建议业务侧按需节流
- **Must**: 为 `canvasId` 赋值并在同页面内保持唯一，避免多色盘冲突
