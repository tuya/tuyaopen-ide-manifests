# LampHuePicker

环形色相拖拽色盘，输出 hue 值（0–359）。

## Knowledge

### 导入

```tsx
import LampHuePicker from '@ray-js/lamp-hue-picker';
```

### Props

| Prop                | 类型                    | 默认值                        | 必填   | 说明                                               |
| ------------------- | ----------------------- | ----------------------------- | ------ | -------------------------------------------------- |
| `value`             | `number`                | `-`                           | **是** | 当前 hue 值                                        |
| `isShowAngleTip`    | `boolean`               | `true`                        | 否     | 是否展示角度提示文案                               |
| `angleTipText`      | `string`                | `-`                           | 否     | 角度提示文案（仅 `isShowAngleTip` 为 true 时有效） |
| `angleTipTextStyle` | `CSSProperties`         | `-`                           | 否     | 角度提示文案样式                                   |
| `isShowColorTip`    | `boolean`               | `true`                        | 否     | 是否展示颜色提示文案                               |
| `colorTipText`      | `string`                | `-`                           | 否     | 颜色提示文案（仅 `isShowColorTip` 为 true 时有效） |
| `colorTipTextStyle` | `CSSProperties`         | `-`                           | 否     | 颜色提示文案样式                                   |
| `innerRingRadius`   | `number`                | `80`                          | 否     | 色环内部半径                                       |
| `radius`            | `number`                | `140`                         | 否     | 色盘半径                                           |
| `useEventChannel`   | `boolean`               | `false`                       | 否     | 是否启用事件通道（多组件高频数据传输优化）         |
| `eventChannelName`  | `string`                | `"lampHuePickerEventChannel"` | 否     | 事件通道名称                                       |
| `onTouchStart`      | `(hue: number) => void` | `() => null`                  | 否     | 手指按下时的回调                                   |
| `onTouchMove`       | `(hue: number) => void` | `() => null`                  | 否     | 手指拖动时的回调                                   |
| `onTouchEnd`        | `(hue: number) => void` | `() => null`                  | 否     | 手指结束时的回调                                   |

### 用法

```tsx
import React, { useState } from 'react';
import LampHuePicker from '@ray-js/lamp-hue-picker';

export default () => {
  const [hue, setHue] = useState(20);

  return <LampHuePicker value={hue} onTouchMove={v => setHue(v)} onTouchEnd={v => setHue(v)} />;
};
```

## Constraints

- **Must**: `onTouchMove` 触发频率较高，建议业务侧按需节流
- **Must**: 当只需要最终值时优先使用 `onTouchEnd`
- **Tip**: 开启 `useEventChannel` 后，可通过 `eventChannelName` 在其他 Rjs 组件中监听 hue 变化
