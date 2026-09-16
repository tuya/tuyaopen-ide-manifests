# LampRectPickerColor

矩形彩光色盘组件，输出 HS（色相+饱和度）。

## Knowledge

### 导入

```tsx
import LampRectPickerColor from '@ray-js/lamp-rect-picker-color';
```

### Props

| Prop                | 类型                                    | 默认值                            | 必填 | 说明                                   |
| ------------------- | --------------------------------------- | --------------------------------- | ---- | -------------------------------------- |
| `hs`                | `{ h: number; s: number }`              | `{h:0,s:1000}`                    | 否   | 色盘颜色值（HSV 中的 HS）              |
| `rectWidth`         | `number`                                | —                                 | 否   | 色盘宽度                               |
| `rectHeight`        | `number`                                | —                                 | 否   | 色盘高度                               |
| `thumbRadius`       | `number`                                | `12`                              | 否   | 拖动色圈宽度                           |
| `borderRadius`      | `number`                                | `0`                               | 否   | 圆角值（优先级低于 borderRadiusStyle） |
| `borderRadiusStyle` | `string`                                | `-`                               | 否   | 圆角样式（优先级高于 borderRadius）    |
| `isShowColorTip`    | `boolean`                               | `false`                           | 否   | 是否显示当前颜色文案                   |
| `closed`            | `boolean`                               | `false`                           | 否   | 展示关闭状态（仍可操作）               |
| `closeHiddenThumb`  | `boolean`                               | `false`                           | 否   | 关闭时是否隐藏拖动色圈                 |
| `useEventChannel`   | `boolean`                               | `false`                           | 否   | 是否启用事件通道                       |
| `eventChannelName`  | `string`                                | `lampRectPickerColorEventChannel` | 否   | 事件通道名称                           |
| `brightValue`       | `number`                                | `''`                              | 否   | 亮度值（在 eventChannelName 中使用）   |
| `onTouchStart`      | `(e: { h: number; s: number }) => void` | `''`                              | 否   | 手指按下回调                           |
| `onTouchMove`       | `(e: { h: number; s: number }) => void` | `''`                              | 否   | 手指拖动回调（高频，建议节流）         |
| `onTouchEnd`        | `(e: { h: number; s: number }) => void` | `''`                              | 否   | 手指结束回调                           |

### 用法

```tsx
import React, { useState } from 'react';
import { View } from '@ray-js/ray';
import LampRectPickerColor from '@ray-js/lamp-rect-picker-color';

type HS = { h: number; s: number };

const Main = () => {
  const [hs, setHS] = useState<HS>({ h: 0, s: 1000 });

  return (
    <View style={{ width: '100%' }}>
      <LampRectPickerColor
        hs={hs}
        thumbRadius={12}
        borderRadius={12}
        isShowColorTip
        onTouchMove={setHS}
        onTouchEnd={setHS}
      />
    </View>
  );
};

export default Main;
```

## Constraints

- **Must**: 父容器需有明确宽度
- **Must**: `onTouchMove` 只更新本地状态，不下发 DP；`onTouchEnd` 才下发
- **Must**: 使用 `rectWidth`/`rectHeight` 时需要按父容器可用宽度计算，确保组件不会超出当前盒子导致溢出/遮挡
- **Must not**: 不写死 `rectWidth`/`rectHeight` 时，组件会自适应撑满父盒子宽高
