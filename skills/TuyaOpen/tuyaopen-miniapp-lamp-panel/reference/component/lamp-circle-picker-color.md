# LampCirclePickerColor

圆形彩光色盘组件，输出 `{ h, s }`（HSV 中的 HS 分量）。

## Knowledge

### 导入

```tsx
import LampCirclePickerColor from '@ray-js/lamp-circle-picker-color';
```

### Props

| Prop               | 类型                                | 默认值                                | 必填 | 说明                              |
| ------------------ | ----------------------------------- | ------------------------------------- | ---- | --------------------------------- |
| `hs`               | `{ h: number; s: number }`          | `{h:0, s:1000}`                       | 否   | 色盘颜色值（h: 0–359, s: 0–1000） |
| `thumbRadius`      | `number`                            | `15`                                  | 否   | 拖动色圈宽度（推荐 10–25）        |
| `whiteRange`       | `number`                            | `0.15`                                | 否   | 中间白光占据的比例（0.1–0.5）     |
| `minRange`         | `number`                            | `0`                                   | 否   | 移动最小区间                      |
| `radius`           | `number`                            | `150`                                 | 否   | 色盘宽度                          |
| `useEventChannel`  | `boolean`                           | `false`                               | 否   | 是否启用事件通道                  |
| `eventChannelName` | `string`                            | `"lampCirclePickerColorEventChannel"` | 否   | 事件通道名称                      |
| `thumbBorderWidth` | `number`                            | `2`                                   | 否   | 按钮边框宽度                      |
| `thumbShadowColor` | `string`                            | `"rgba(0,0,0,.16)"`                   | 否   | 按钮阴影颜色                      |
| `thumbShadowBlur`  | `number`                            | `6`                                   | 否   | 按钮阴影模糊度                    |
| `onTouchStart`     | `(hs: {h:number;s:number}) => void` | `-`                                   | 否   | 手指按下时的回调                  |
| `onTouchMove`      | `(hs: {h:number;s:number}) => void` | `-`                                   | 否   | 手指拖动时的回调                  |
| `onTouchEnd`       | `(hs: {h:number;s:number}) => void` | `-`                                   | 否   | 手指结束时的回调                  |

### 用法

```tsx
import React, { useState } from 'react';
import LampCirclePickerColor from '@ray-js/lamp-circle-picker-color';

type HS = { h: number; s: number };

export default () => {
  const [hs, setHS] = useState<HS>({ h: 36, s: 500 });

  return (
    <LampCirclePickerColor
      hs={hs}
      thumbRadius={15}
      radius={140}
      whiteRange={0.15}
      onTouchEnd={hsRes => setHS(hsRes)}
    />
  );
};
```

## Constraints

- **Must**: 色盘组件自带 32rpx padding（不可修改），业务侧布局需预留该内边距
- **Must**: `onTouchMove` 触发频率较高，建议业务侧按需节流
- **Tip**: `whiteRange` 建议控制在 0.1–0.5 之间
- **Tip**: 开启 `useEventChannel` 后，可通过 `eventChannelName` 在其他 Rjs 组件中监听颜色变化
