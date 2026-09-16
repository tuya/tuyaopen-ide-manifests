# LampColorWheel

彩光圆形点选色环组件，点击选色后输出 `{ h, s }`。

## Knowledge

### 导入

```tsx
import LampColorWheel from '@ray-js/lamp-color-wheel';
```

### Props

| Prop               | 类型                                    | 默认值         | 必填 | 说明             |
| ------------------ | --------------------------------------- | -------------- | ---- | ---------------- |
| `hsColor`          | `{ h: number; s: number }`              | `{h:0,s:1000}` | 否   | hs 颜色          |
| `hollowRadius`     | `number`                                | `21`           | 否   | 色盘中心空洞半径 |
| `centerRingRadius` | `number`                                | `17`           | 否   | 色盘中心圆半径   |
| `ringRadius`       | `number`                                | `160`          | 否   | 色盘半径         |
| `thumbBorderWidth` | `number`                                | `5`            | 否   | 选中按钮边框宽度 |
| `thumbBorderColor` | `string`                                | `'#fff'`       | 否   | 选中按钮边框颜色 |
| `paddingWidth`     | `number`                                | `5`            | 否   | 内边距           |
| `onTouchEnd`       | `(e: { h: number; s: number }) => void` | `() => null`   | 否   | 点击结束事件     |

### 用法

```tsx
import React, { useState } from 'react';
import LampColorWheel from '@ray-js/lamp-color-wheel';

export default () => {
  const [color, setColor] = useState<{ h: number; s: number }>({ h: 0, s: 800 });

  const handleEnd = (e: { h: number; s: number }) => {
    setColor(e);
  };

  return (
    <LampColorWheel
      hsColor={color}
      hollowRadius={21}
      centerRingRadius={17}
      ringRadius={160}
      paddingWidth={20}
      onTouchEnd={handleEnd}
    />
  );
};
```

## Constraints

- **Must**: 点击结束才下发 DP（该组件只有 `onTouchEnd`，无 `onTouchMove`）
- **Must not**: 改造为高频下发
- **Tip**: 可通过 `ringRadius`/`hollowRadius`/`centerRingRadius` 调整色环尺寸与中心显示区域大小
- **Tip**: `paddingWidth` 可用于留出内边距，避免选中按钮贴边
