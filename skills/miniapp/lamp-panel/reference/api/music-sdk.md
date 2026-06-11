# Capability: Music SDK

音乐律动功能：音频采集 → HSV/亮度数据 → 灯光实时控制。

> 模板中不一定自带这些文件，需要按以下参考实现在项目中创建。

## Knowledge

### 参考实现：`src/utils/music-sdk.ts`

```ts
import { setKeepScreenOn } from '@ray-js/ray';
import _throttle from 'lodash/throttle';
import { utils } from '@ray-js/panel-sdk';

const { rgb2hsb, calcPosition } = utils;

let manager: any = null;
export let isListening = false;

type TMusicOption = {
  mode?: 0 | 1; // 0=跳变, 1=渐变（默认 1）
  colorList?: { hue: number; saturation: number; value: number }[];
  dBRange?: [number, number]; // 分贝范围，影响亮度
};

const start = () => {
  if (!manager) {
    try {
      manager = (ty as any)?.media?.getRGBAudioManager?.();
    } catch {
      return;
    }
  }
  if (!manager) return;
  isListening = true;
  manager.stopRGBRecord();
  manager.startRGBRecord();
  setKeepScreenOn({ keepScreenOn: true });
};

export const offMusic2RgbChange = () => {
  if (!manager) return;
  isListening = false;
  if (manager.offAudioRgbChange) manager.offAudioRgbChange();
  manager.stopRGBRecord();
  setKeepScreenOn({ keepScreenOn: false });
};

export const onMusic2RgbChange = (
  callback: (musicData: {
    mode: number;
    hue: number;
    saturation: number;
    value: number;
    bright: number;
    temperature: number;
    extra: any;
  }) => void,
  musicOption?: TMusicOption
) => {
  if (isListening) return;
  if (!manager) {
    try {
      manager = (ty as any)?.media?.getRGBAudioManager?.();
    } catch {
      return;
    }
  }
  if (!manager) return;

  const handleAudioRgbChange = _throttle((data: string) => {
    const { R, G, B, C: temp, L: bright, db, dB } = JSON.parse(data) || {};
    const _db = dB || db || 0;
    let hue = 0,
      saturation = 1000,
      value = 1000;
    const { mode = 1, colorList, dBRange = [40, 80] } = musicOption || {};

    if (colorList) {
      const randomColor = colorList[Math.floor(Math.random() * colorList.length)];
      if (!randomColor) return;
      hue = randomColor.hue;
      saturation = randomColor.saturation;
      let brightness = randomColor.value;
      if (_db <= dBRange[0]) brightness = 0;
      else if (_db >= dBRange[1]) brightness = 1000;
      else brightness = Math.round(calcPosition(_db, dBRange[0], dBRange[1], 0, 1000));
      value = brightness;
    } else {
      [hue, saturation, value] = rgb2hsb(R, G, B).map((v: number, i: number) =>
        i > 0 ? v * 10 : v
      );
    }

    callback({
      mode,
      hue: Math.round(hue),
      saturation: Math.round(saturation),
      value: Math.round(value),
      bright: Math.round(bright * 10),
      temperature: Math.round(temp * 10),
      extra: { R, G, B, C: temp, L: bright, db, dB },
    });
  }, 300);

  manager.onAudioRgbChange(({ body }: any) => handleAudioRgbChange(body));
  start();
};
```

### 参考实现：`src/constant/music.ts`（预设模式）

```ts
import { hsv2rgbString } from '@/utils/color';

const list = [
  {
    id: 1,
    mode: 1,
    icon: '/music_1.png', // 音乐律动
    colorArea: [
      { area: [0, 2], hue: 350, saturation: 1000, value: 1000 },
      { area: [3, 5], hue: 50, saturation: 1000, value: 1000 },
      { area: [6, 9], hue: 160, saturation: 1000, value: 1000 },
    ],
  },
  {
    id: 2,
    mode: 0,
    icon: '/music_2.png', // 游戏
    colorArea: [
      { area: [0, 2], hue: 350, saturation: 1000, value: 1000 },
      { area: [3, 5], hue: 50, saturation: 1000, value: 1000 },
      { area: [6, 9], hue: 160, saturation: 1000, value: 1000 },
    ],
  },
  {
    id: 3,
    mode: 1,
    icon: '/music_3.png', // 浪漫
    colorArea: [
      { area: [0, 2], hue: 20, saturation: 1000, value: 1000 },
      { area: [3, 4], hue: 0, saturation: 1000, value: 1000 },
      { area: [5, 6], hue: 350, saturation: 1000, value: 1000 },
      { area: [7, 9], hue: 300, saturation: 1000, value: 1000 },
    ],
  },
];

export const APP_MUSIC_DATA_LIST = list.map(item => ({
  ...item,
  colorArr: item.colorArea.map(color =>
    hsv2rgbString(color.hue, color.saturation / 10, color.value / 10)
  ),
}));
```

### 使用方式

```ts
import { onMusic2RgbChange, offMusic2RgbChange } from '@/utils/music-sdk';
import { APP_MUSIC_DATA_LIST } from '@/constant/music';

// 开始监听
onMusic2RgbChange(
  (data) => {
    // data: { mode, hue, saturation, value, bright, temperature, extra }
    // 下发 music_data DP
  },
  { mode: 1, colorList: [...], dBRange: [40, 80] }
);

// 停止监听
offMusic2RgbChange();
```

### music_data DP 下发格式

```ts
// 支持彩光时
{ mode, hue, saturation, value, brightness: 0, temperature: 0 }

// 不支持彩光时
{ mode, hue: 0, saturation: 0, value: 0, brightness, temperature }
```

## Constraints

- **Must**: 下发 `music_data` 需**节流 300ms**（SDK 内已实现）
- **Must**: 播放前设置 `work_mode='music'`
- **Must**: `APP_MUSIC_DATA_LIST` 中 `icon` 属性直接应用到 `LampMusicCard` 的 `icon`
- **Must**: 停止播放时调用 `offMusic2RgbChange()` 释放资源
- **Must not**: 自行实现音频采集逻辑
