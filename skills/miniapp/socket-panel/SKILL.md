---
name: socket-panel-development-guidelines
description: 用于开发涂鸦电工插座/排插/智能开关面板小程序（socket/outlet/power strip panel）。涵盖：多路开关渲染（switch_1~6）、倒计时（countdown_1~6）、用电量统计（add_ele/cur_power/cur_voltage/cur_current）、功能页跳转（定时/电费）、设备日志、DP 换算规则。Use when user needs to build or modify a Tuya electrician panel miniapp.
---

# Skills: socket-panel-development-guidelines

## 概述 {#description}

本技能服务于涂鸦电工插座/排插/智能开关品类 Ray 小程序面板的 AI 辅助开发。核心知识包括多路开关动态渲染（switch_1~6）、倒计时控制（countdown_1~6 秒级转 HH:MM 展示）、用电统计（add_ele/cur_power/cur_voltage/cur_current 含换算规则与统计 API）、Complex DP 解析（cycle_time/random_time/switch_inching）、功能页跳转（电工定时/电费设置）、设备操作日志，以及断电记忆/童锁/故障告警等安全保护功能。技能通过 `reference/` 子目录对 API、功能页提供完整签名，SKILL.md 速查表仅用于选型，详细用法以 reference 为准。

## 适用场景 {#scene}

- **新建电工面板**：从零搭建插座/排插/智能开关面板，需要多路开关渲染、DP 类型定义、基础控制页面。
- **用电统计开发**：接入用电量统计 API（15min/hour/day/month 粒度），展示今日/昨日用电、历史趋势图表。
- **倒计时功能**：各路独立倒计时（countdown_1~6），秒转 HH:MM 格式化展示与触发提示。
- **功能页接入**：电工定时（普通定时+倒计时）、电费设置，含 appid 注册与路由参数编码。
- **Complex DP 开发**：cycle_time / random_time / switch_inching 解析器注册与编解码。
- **设备日志**：操作日志查询、DP 值转换（switch boolean→on/off、fault bitmap 按位解析）。
- **不适用**：非涂鸦平台设备、电工品类之外（照明、门锁等）的面板开发。

## 搭配使用 {#usage}

- **`@ray-js/stat-charts`**：用电统计图表组件，支持 15min/hour/day/month 粒度的柱形图、折线图展示。
- **`@ray-js/ray` >= 1.2.12**：统计 API（getStatisticsRang*）依赖此最低版本。

## 注意事项 {#tip}

- **DP 换算**：`add_ele` ÷ 100 = kWh、`cur_power` ÷ 10 = W、`cur_voltage` ÷ 10 = V，`cur_current` 为 mA 无需换算。漏做换算是最常见的展示错误。
- **多路开关动态渲染**：必须按实际 schema 动态过滤 `switch_1~6`，不硬编码路数；1 路插座和 6 路排插共用同一面板。
- **Complex DP 注册**：`cycle_time` / `random_time` / `switch_inching` 必须在 `protocols/index.ts` 注册解析器后才能正确读写。
- **功能页跳转**：跳转前必须在 `global.config.ts` 注册 appid；所有路由参数使用 `encodeURIComponent`。
- **定时 UI 禁止自实现**：统一使用内置功能页 `ElectricianTimer`，不自行实现定时界面。
- **维护提示**：修改 Critical Rules 或新增功能域后，须同步更新 `evals/evals.json`，确保通过率 ≥ 80% 再提交 MR。

---

用户需求: $ARGUMENTS

## 核心 DP 表

| DP code                       | 类型   | 说明             | 换算                |
| ----------------------------- | ------ | ---------------- | ------------------- |
| `switch_1` ~ `switch_6`       | bool   | 第 1~6 路开关    | —                   |
| `countdown_1` ~ `countdown_6` | value  | 各路倒计时（秒） | 转为 HH:MM          |
| `cycle_time`                  | string | 循环定时         | **Complex**         |
| `random_time`                 | string | 随机时间         | **Complex**         |
| `switch_inching`              | string | 开关点动         | **Complex**         |
| `add_ele`                     | value  | 累计电量         | ÷ 100 = kWh         |
| `cur_power`                   | value  | 实时功率         | ÷ 10 = W            |
| `cur_voltage`                 | value  | 实时电压         | ÷ 10 = V            |
| `cur_current`                 | value  | 实时电流         | mA（无需换算）      |
| `relay_status`                | enum   | 断电记忆         | `off`/`on`/`memory` |
| `child_lock`                  | bool   | 童锁             | —                   |
| `fault`                       | bitmap | 故障告警         | 按位解析            |

### 电气量换算

```ts
const kWh = add_ele / 100;
const watt = cur_power / 10;
const volt = cur_voltage / 10;
const mA = cur_current;
```

### 多路开关渲染

```ts
const SWITCH_DPS = ['switch_1', 'switch_2', 'switch_3', 'switch_4', 'switch_5', 'switch_6'];
const activeChannels = SWITCH_DPS.filter(code => schema[code] !== undefined);
```

### 倒计时显示格式

```ts
function formatNextTrigger(remainingSeconds: number): string {
  if (!remainingSeconds) return '';
  const trigger = new Date(Date.now() + remainingSeconds * 1000);
  const h = trigger.getHours().toString().padStart(2, '0');
  const m = trigger.getMinutes().toString().padStart(2, '0');
  return `下一次将在 ${h}:${m} 关闭`;
}
```

## Quick Reference

### 功能页 appid 速查

| 功能页   | config name                 | appid                |
| -------- | --------------------------- | -------------------- |
| 电工定时 | `ElectricianTimer`          | `typtepohxfeukudmyi` |
| 电费设置 | `ElectricityCostFunctional` | `tyfqg0bbutva4kcghp` |

### 用电统计 API 速查

| API                      | 粒度    | 日期格式        |
| ------------------------ | ------- | --------------- |
| `getStatisticsRang15min` | 15 分钟 | `yyyyMMdd`      |
| `getStatisticsRangHour`  | 小时    | `yyyyMMdd`      |
| `getStatisticsRangDay`   | 天      | `yyyyMMdd` 区间 |
| `getStatisticsRangMonth` | 月      | `yyyyMM` 区间   |

## Critical Rules

- **Must**: 功能页跳转前在 `global.config.ts` 注册 appid
- **Must**: 所有路由参数使用 `encodeURIComponent`
- **Must**: `cycle_time` / `random_time` / `switch_inching` 为 Complex DP，在 `protocols/index.ts` 注册解析器
- **Must**: `add_ele` ÷ 100 = kWh；`cur_power` ÷ 10 = W；`cur_voltage` ÷ 10 = V
- **Must**: 倒计时展示「下一次将在 HH:MM 关闭」
- **Must**: 多路开关按实际 schema 动态渲染，不硬编码路数
- **Must**: `timeStamp` 为秒级，展示时 `* 1000`
- **Must**: `@ray-js/ray` 版本 >= 1.2.12 才可使用统计 API
- **Must**: 清除电量用 Toast 确认，不用 Modal
- **Must not**: 自行实现定时 UI，统一使用内置功能页
- **Must not**: 在无 `add_ele` DP 时展示用电统计

## References

### 功能页

- `socket-panel-development-guidelines/reference/functionPage/fp-electrician-timer.md` — 电工定时页（普通定时 + 倒计时）
- `socket-panel-development-guidelines/reference/functionPage/fp-electrician-cost.md` — 电费设置页

### API

- `socket-panel-development-guidelines/reference/api/electric-stats.md` — 用电统计 API + StatCharts 图表组件
- `socket-panel-development-guidelines/reference/api/device-log.md` — 设备操作日志查询与展示

