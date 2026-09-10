# LampColorCard

彩光预设颜色色卡组件，点击后输出 `{ h, s }`。

## Knowledge

### 导入

```tsx
import LampColorCard from '@ray-js/lamp-color-card';
```

### Props

| Prop                | 类型                                    | 默认值         | 必填 | 说明             |
| ------------------- | --------------------------------------- | -------------- | ---- | ---------------- |
| `hs`                | `{ h: number; s: number }`              | `{h:0,s:1000}` | 否   | hs 颜色          |
| `rectWidth`         | `number`                                | `319`          | 否   | 彩光色卡宽度     |
| `rectHeight`        | `number`                                | `133`          | 否   | 彩光色卡高度     |
| `thumbBorderWidth`  | `number`                                | `2`            | 否   | 选中按钮边框宽度 |
| `thumbBorderColor`  | `string`                                | `'#fff'`       | 否   | 选中按钮边框颜色 |
| `thumbBorderRadius` | `number`                                | `4`            | 否   | 选中按钮圆角     |
| `rectStyle`         | `string \| CSSProperties`               | `{}`           | 否   | 彩光色卡样式     |
| `containerStyle`    | `string \| CSSProperties`               | `{}`           | 否   | 容器样式         |
| `onTouchEnd`        | `(e: { h: number; s: number }) => void` | `''`           | 否   | 点击结束事件     |

### 用法

```tsx
import React from 'react';
import LampColorCard from '@ray-js/lamp-color-card';

export default () => {
  const [hsColor, setHsColor] = React.useState<{ h: number; s: number }>({ h: 0, s: 1000 });

  const handleEnd = (e: { h: number; s: number }) => {
    setHsColor(e);
  };

  return (
    <LampColorCard
      hs={hsColor}
      thumbBorderWidth={2}
      thumbBorderColor="#fff"
      thumbBorderRadius={4}
      onTouchEnd={handleEnd}
    />
  );
};
```

## Constraints

- **Must**: 该组件只有 `onTouchEnd`，在点击结束时触发
- **Tip**: 当需要自定义色卡/容器样式时，可通过 `rectStyle` 与 `containerStyle` 传入样式字符串或样式对象
- **Tip**: 可通过 `rectWidth`/`rectHeight` 调整色卡尺寸
