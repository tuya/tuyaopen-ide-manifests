# Capability: Color Utils

照明面板颜色转换工具集。

> 模板中不一定自带此文件，需要按以下参考实现在项目中创建。

## Knowledge

### 参考实现：`src/utils/color.ts`

```ts
function limit(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function rgb2hsv(r = 0, g = 0, b = 0) {
  r = limit(r, 0, 255) / 255;
  g = limit(g, 0, 255) / 255;
  b = limit(b, 0, 255) / 255;
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const C = M - m;
  let h: number;
  if (C === 0) h = 0;
  else if (M === r) h = ((g - b) / C) % 6;
  else if (M === g) h = (b - r) / C + 2;
  else h = (r - g) / C + 4;
  h *= 60;
  if (h < 0) h += 360;
  const v = M;
  const s = C === 0 ? 0 : C / v;
  return [h, s * 100, v * 100];
}

export function hsv2rgb(h = 0, s = 0, v = 0, a?: number) {
  h = ((h % 360) + 360) % 360;
  s = limit(s, 0, 100);
  v = limit(v, 0, 100);
  const br = Math.round((v / 100) * 255);
  if (s === 0) return a !== undefined ? [br, br, br, limit(a, 0, 1)] : [br, br, br];
  const f = h % 60;
  const p = Math.round(((v * (100 - s)) / 10000) * 255);
  const q = Math.round(((v * (6000 - s * f)) / 600000) * 255);
  const t = Math.round(((v * (6000 - s * (60 - f))) / 600000) * 255);
  let rgb: number[];
  switch (Math.floor(h / 60)) {
    case 0:
      rgb = [br, t, p];
      break;
    case 1:
      rgb = [q, br, p];
      break;
    case 2:
      rgb = [p, br, t];
      break;
    case 3:
      rgb = [p, q, br];
      break;
    case 4:
      rgb = [t, p, br];
      break;
    default:
      rgb = [br, p, q];
      break;
  }
  if (a !== undefined) rgb.push(limit(a, 0, 1));
  return rgb;
}

function toRgbString(rgb: number[], a?: number) {
  const output = rgb.map(item => Math.round(item));
  let alpha = a;
  if (output.length === 4) alpha = output.pop()!;
  if (alpha !== undefined) {
    const ca = alpha > 1 ? 1 : alpha < 0 ? 0 : alpha;
    return `rgba(${output[0]}, ${output[1]}, ${output[2]}, ${ca})`;
  }
  return `rgb(${output[0]}, ${output[1]}, ${output[2]})`;
}

/**
 * HSV → RGB 字符串
 * h: 0-360, s: 0-100（DP 中 0-1000 需 /10）, v: 0-100（DP 中 0-1000 需 /10）
 */
export function hsv2rgbString(h = 0, s = 0, v = 0, a?: number) {
  return toRgbString(hsv2rgb(h, s, v, a), a);
}

/**
 * 色温(K) → RGB 近似（曲线拟合）
 */
function kelvin2rgb(kelvin: number): [number, number, number] {
  const t = kelvin / 100;
  let r: number, g: number, b: number;
  r = t < 66 ? 255 : limit(351.977 + 0.114 * (t - 55) - 40.254 * Math.log(t - 55), 0, 255);
  g =
    t < 66
      ? limit(-155.255 - 0.446 * (t - 2) + 104.492 * Math.log(t - 2), 0, 255)
      : limit(325.449 + 0.079 * (t - 50) - 28.085 * Math.log(t - 50), 0, 255);
  b =
    t >= 66
      ? 255
      : t <= 20
      ? 0
      : limit(-254.769 + 0.827 * (t - 10) + 115.68 * Math.log(t - 10), 0, 255);
  return [r, g, b];
}

function bright2Opacity(brightness: number, option = { min: 0.2, max: 1 }) {
  const clamped = limit(brightness, 10, 1000);
  return Math.round((option.min + ((clamped - 10) / 990) * (option.max - option.min)) * 100) / 100;
}

/**
 * 白光色块预览
 * brightness: 10-1000, temperature: 0-1000 (0=暖, 1000=冷)
 * 映射到 4000K-8000K，用 brightness 控制透明度
 */
export function brightKelvin2rgba(
  brightness: number,
  temperature: number,
  option: { temperatureMin?: number; temperatureMax?: number } = {}
) {
  const { temperatureMin = 4000, temperatureMax = 8000 } = option;
  const kelvinPct = limit(temperature / 10, 0, 100);
  const temp = temperatureMin + ((temperatureMax - temperatureMin) * kelvinPct) / 100;
  const hsv = rgb2hsv(...kelvin2rgb(temp));
  hsv[2] = limit(1000 / 10, 0, 100); // 满亮度底色
  const color = hsv2rgbString(hsv[0], hsv[1], hsv[2]);
  const alpha = bright2Opacity(brightness);
  return color.replace(/\)$/, `, ${alpha})`);
}
```

### 使用方式

```ts
import { hsv2rgbString, brightKelvin2rgba, hsv2rgb, rgb2hsv } from '@/utils/color';

// 彩光渲染（DP saturation/value 范围 0-1000，需 /10）
const color = hsv2rgbString(h, s / 10, v / 10, 1);
// => "rgba(255, 128, 0, 1)"

// 白光渲染（brightness: 10-1000, temperature: 0-1000）
const whiteColor = brightKelvin2rgba(brightness, temperature);
// => "rgba(255, 214, 170, 0.65)"

// RGB ↔ HSV 互转
const [r, g, b] = hsv2rgb(h, s, v);
const [h2, s2, v2] = rgb2hsv(255, 128, 0);
```

## Constraints

- **Must**: 彩光渲染统一使用 `hsv2rgbString`
- **Must**: 白光渲染统一使用 `brightKelvin2rgba`
- **Must**: DP 中 saturation/value 范围是 0-1000，传入时需 `/10` 转为 0-100
- **Must not**: 使用 HSL 拼色替代 `hsv2rgbString`
- **Must not**: 使用经验公式替代 `brightKelvin2rgba`
