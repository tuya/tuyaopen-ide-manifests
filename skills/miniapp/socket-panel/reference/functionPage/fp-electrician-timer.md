# Capability: Electrician Timer Functional Page

电工品类定时功能页，appid `typtepohxfeukudmyi`。支持普通定时（云定时）与倒计时。

## Knowledge

### 注册

```ts
// global.config.ts
export const tuya = {
  functionalPages: {
    ElectricianTimer: { appid: 'typtepohxfeukudmyi' },
  },
};
```

### 可用页面

| page           | 说明                       |
| -------------- | -------------------------- |
| `home`         | 定时综合列表页（推荐入口） |
| `schedule`     | 云定时列表页               |
| `countdown`    | 倒计时列表页               |
| `setCountdown` | 倒计时设置页               |

### 跳转示例

```ts
import { navigateTo } from '@ray-js/ray';

// 定时综合列表（推荐）
navigateTo({ url: `functional://ElectricianTimer/home?deviceId=${encodeURIComponent(deviceId)}` });

// 直接跳云定时列表
navigateTo({
  url: `functional://ElectricianTimer/schedule?deviceId=${encodeURIComponent(deviceId)}`,
});

// 倒计时列表
navigateTo({
  url: `functional://ElectricianTimer/countdown?deviceId=${encodeURIComponent(deviceId)}`,
});

// 倒计时设置
navigateTo({
  url: `functional://ElectricianTimer/setCountdown?deviceId=${encodeURIComponent(deviceId)}`,
});

// 带背景图（bgImgUrl 需 encodeURIComponent）
navigateTo({
  url: `functional://ElectricianTimer/schedule?deviceId=${encodeURIComponent(
    deviceId
  )}&bgImgUrl=${encodeURIComponent(bgImgUrl)}`,
});
```

### 通用参数

| 参数                     | 类型          | 必选   | 说明                                                                |
| ------------------------ | ------------- | ------ | ------------------------------------------------------------------- |
| `deviceId`               | string        | **是** | 设备 ID                                                             |
| `switchCodes`            | string        | 否     | 支持的开关 DP，多个用英文逗号分隔；不传则自动获取                   |
| `countdownCodes`         | string        | 否     | 支持的倒计时 DP，配置时需同时配置 `switchCodes`                     |
| `supportCountdown`       | `n`/`y`       | 否     | 是否支持倒计时，默认 `n`                                            |
| `is24Hour`               | `n`/`y`       | 否     | 是否使用 24 小时制，`y` 表示是                                      |
| `category`               | string        | 否     | 云定时分组 code，默认 `sdk_schedule`                                |
| `brand`                  | string        | 否     | 主题色（6 位 Hex，如 `FFFFFF`），默认跟随宿主小程序主题             |
| `countdownSuccessAction` | `hold`/`back` | 否     | 倒计时设置完成后的行为：`hold` 停留、`back` 返回上一页，默认 `hold` |
| `bgImgUrl`               | string        | 否     | 定时页背景图 URL，需 `encodeURIComponent`                           |

### 倒计时设置页额外参数

| 参数     | 类型   | 必选 | 说明                          |
| -------- | ------ | ---- | ----------------------------- |
| `dpCode` | string | 否   | 指定倒计时 DP，不传则自动获取 |

### 依赖版本

| 基础库 / Kit | 最低版本 |
| ------------ | -------- |
| 基础库       | 2.12.18  |
| BaseKit      | 2.1.2    |
| BizKit       | 3.3.1    |
| DeviceKit    | 3.9.3    |
| MiniKit      | 3.2.1    |

## Constraints

- **Must**: 在 `global.config.ts` 注册 `ElectricianTimer` appid 后再跳转
- **Must**: 所有字符串参数使用 `encodeURIComponent`
- **Must**: 需要倒计时时，设置 `supportCountdown=y` 并同时传 `switchCodes` + `countdownCodes`
- **Must**: 需要云定时能力时，须在小程序开发者平台开通产品云定时高级能力
- **Must not**: 自行实现定时 UI
- **Must not**: 在无对应 DP 的设备上启用倒计时
