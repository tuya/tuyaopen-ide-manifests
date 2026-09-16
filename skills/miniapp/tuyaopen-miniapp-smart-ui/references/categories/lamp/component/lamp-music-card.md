# LampMusicCard

照明音乐律动组件，展示多个音乐模式卡片，支持实时颜色动画。

## Knowledge

### 导入

```tsx
import LampMusicCard from '@ray-js/lamp-music-card';
import { LampMusicBar, musicColorArr2 } from '@ray-js/lamp-music-card';
```

### LampMusicCard Props

| Prop                | 类型                                                   | 默认值              | 必填 | 说明                                                              |
| ------------------- | ------------------------------------------------------ | ------------------- | ---- | ----------------------------------------------------------------- |
| `instanceId`        | `string`                                               | `null`              | 否   | 实例 id                                                           |
| `data`              | `{ title: string; icon: string; colorArr?: string[] }` | `null`              | 否   | 卡片数据                                                          |
| `active`            | `boolean`                                              | `false`             | 否   | 是否正在执行                                                      |
| `theme`             | `'dark' \| 'light'`                                    | `'dark'`            | 否   | 主题                                                              |
| `style`             | `CSSProperties`                                        | `{}`                | 否   | 整体样式                                                          |
| `className`         | `string`                                               | `''`                | 否   | 组件类名                                                          |
| `contentStyle`      | `CSSProperties`                                        | `{}`                | 否   | 内容样式                                                          |
| `titleStyle`        | `CSSProperties`                                        | `{}`                | 否   | 标题样式                                                          |
| `iconColor`         | `string`                                               | `{}`                | 否   | icon 颜色                                                         |
| `iconCircleBgColor` | `string`                                               | `-`                 | 否   | icon 背景颜色                                                     |
| `animationDuration` | `number`                                               | `9000`              | 否   | 动画时间(ms)                                                      |
| `renderCustom`      | `() => Element`                                        | `() => JSX.Element` | 否   | 自定义卡片内容                                                    |
| `renderFoldIcon`    | `(unfold: boolean) => Element`                         | `() => JSX.Element` | 否   | 渲染折叠 icon                                                     |
| `onPlay`            | `(active: boolean) => void`                            | `() => void`        | 否   | 操作回调函数，active=true 表示"开始播放"，active=false 表示"暂停" |

### LampMusicBar Props

| Prop                | 类型       | 默认值    | 必填 | 说明         |
| ------------------- | ---------- | --------- | ---- | ------------ |
| `instanceId`        | `string`   | `null`    | 否   | 实例 id      |
| `colorList`         | `string[]` | `null`    | 否   | 颜色列表     |
| `bgColor`           | `string`   | `#201e1e` | 否   | 背景颜色     |
| `animationDuration` | `number`   | `900`     | 否   | 动画时间(ms) |

### 基础用法

```tsx
import React, { useState } from 'react';
import LampMusicCard from '@ray-js/lamp-music-card';

const BasicDemo = ({ JazzImage, musicColorArr1 }) => {
  const [active, setActive] = useState(false);
  const data = {
    title: '音乐卡片',
    icon: JazzImage,
    colorArr: musicColorArr1,
  };

  const onPlay = (nextActive: boolean) => {
    setActive(nextActive);
    console.log('onPlay', nextActive);
  };

  return <LampMusicCard data={data} active={active} onPlay={onPlay} />;
};
```

### 进阶用法：自定义组件内部内容

```tsx
import React, { useState } from 'react';
import { Text, View } from '@ray-js/ray';
import LampMusicCard from '@ray-js/lamp-music-card';

const AdvancedDemo = ({ JazzImage, musicColorArr1 }) => {
  const [active, setActive] = useState(false);
  const data = {
    title: '音乐卡片',
    icon: JazzImage,
    colorArr: musicColorArr1,
  };

  return (
    <LampMusicCard
      data={data}
      style={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      iconColor="#ffffff"
      active={active}
      onPlay={setActive}
      renderCustom={() => {
        return (
          <View
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '4px',
              background: '#333',
              display: 'flex',
              paddingLeft: '20px',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff' }}>这里是自定义内容</Text>
          </View>
        );
      }}
    />
  );
};
```

### 实时律动颜色（LampMusicBar + instanceId）

```tsx
import React, { useEffect } from 'react';
import { usePageInstance } from '@ray-js/ray';
import { LampMusicBar } from '@ray-js/lamp-music-card';
import { utils } from '@ray-js/panel-sdk';
const { hsv2rgbString } = utils;

const MusicBarRealtimeColorDemo = ({ onMusic2RgbChange, offMusic2RgbChange }) => {
  const pageInstance = usePageInstance();

  useEffect(() => {
    const node = pageInstance.selectComponent(`#music_bar_1`);

    const handle = (data: { hue: number; saturation: number; value: number; db: number }) => {
      const { hue, saturation, db } = data;
      const color = hsv2rgbString(hue, Math.round(saturation / 10), Math.round(1000 / 10));
      node.setColor(color, db > 70 ? 0.5 : 0.9);
    };

    onMusic2RgbChange(handle, {});
    return () => {
      offMusic2RgbChange();
    };
  }, []);

  return <LampMusicBar instanceId="music_bar_1" bgColor="#eee" />;
};
```

## Constraints

- **Must**: `active` 由业务侧 state 控制
- **Must**: 实时颜色通过 `instanceId` + `selectComponent` + `setColor` 驱动
- **Must not**: 在 `onPlay` 里重渲整个列表
- **Tip**: 如果需要外部实时驱动音乐条颜色变化，可给 `LampMusicBar` 设置 `instanceId`，并通过 `pageInstance.selectComponent` 获取节点后调用其方法
- **Tip**: `colorList` 可传入自定义颜色序列用于律动效果展示
