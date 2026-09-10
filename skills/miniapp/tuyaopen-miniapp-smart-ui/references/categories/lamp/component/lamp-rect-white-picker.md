# LampRectWhitePicker

矩形色温色盘组件，输出 temp（色温归一化值 0-1000）。

## Knowledge

### 导入

```tsx
import LampRectWhitePicker from '@ray-js/lamp-rect-white-picker';
```

### Props

| Prop                | 类型                     | 默认值                            | 必填   | 说明                                   |
| ------------------- | ------------------------ | --------------------------------- | ------ | -------------------------------------- |
| `canvasId`          | `string`                 | —                                 | **是** | 色盘 id；同页面多个色盘时需保证唯一    |
| `temp`              | `number`                 | `1000`                            | 否     | 色温归一化值（0 - 1000）               |
| `rectWidth`         | `number`                 | —                                 | 否     | 色盘宽度                               |
| `rectHeight`        | `number`                 | —                                 | 否     | 色盘高度                               |
| `thumbRadius`       | `number`                 | `12`                              | 否     | 拖动色圈宽度                           |
| `borderRadius`      | `number`                 | `0`                               | 否     | 圆角值（优先级低于 borderRadiusStyle） |
| `borderRadiusStyle` | `string`                 | `-`                               | 否     | 圆角样式（优先级高于 borderRadius）    |
| `isShowTip`         | `boolean`                | `true`                            | 否     | 是否显示当前色温文案提示               |
| `closed`            | `boolean`                | `false`                           | 否     | 展示关闭状态（仍可操作）               |
| `useEventChannel`   | `boolean`                | `false`                           | 否     | 是否启用事件通道                       |
| `eventChannelName`  | `string`                 | `lampRectPickerColorEventChannel` | 否     | 事件通道名称                           |
| `brightValue`       | `number`                 | `null`                            | 否     | 亮度值（用于 eventChannel 发送）       |
| `onTouchStart`      | `(temp: number) => void` | `''`                              | 否     | 手指按下回调                           |
| `onTouchMove`       | `(temp: number) => void` | `''`                              | 否     | 手指拖动回调（高频，建议节流）         |
| `onTouchEnd`        | `(temp: number) => void` | `''`                              | 否     | 手指结束回调                           |

### 用法

```tsx
import React, { useState } from 'react';
import { View } from '@ray-js/ray';
import LampRectWhitePicker from '@ray-js/lamp-rect-white-picker';

const Main = () => {
  const [temp, setTemp] = useState(500);

  return (
    <View style={{ width: '100%' }}>
      <LampRectWhitePicker
        canvasId="white_picker_main"
        temp={temp}
        thumbRadius={12}
        borderRadius={12}
        isShowTip
        onTouchMove={setTemp}
        onTouchEnd={setTemp}
      />
    </View>
  );
};

export default Main;
```

## Constraints

- **Must**: `canvasId` 必须设置且同页面唯一
- **Must**: 父容器需有明确宽度
- **Must**: `onTouchMove` 只更新本地状态，不下发 DP；`onTouchEnd` 才下发
- **Must**: 使用 `rectWidth`/`rectHeight` 时需要按父容器可用宽度计算，确保组件不会超出当前盒子导致溢出/遮挡
- **Must not**: 不写死 `rectWidth`/`rectHeight` 时，组件会自适应撑满父盒子宽高
