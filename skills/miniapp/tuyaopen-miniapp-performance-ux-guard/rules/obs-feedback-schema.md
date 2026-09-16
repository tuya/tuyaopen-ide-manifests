---
id: obs-feedback-schema
priority: HIGH
category: Observability > Tracking Design
---

# 小程序功能埋点合理性

## Rule
体验相关埋点应根据当前功能点合理设计，覆盖关键用户路径的埋点位置、服务指标和事件参数，确保数据可分析、可归因。不要要求业务代码重复手填埋点 API 已自动提供的基础参数（如基础设备、版本、页面上下文等）；如果当前小程序埋点 API 没有统一补齐能力，应先封装小程序版本的 `reportExperienceEvent`，统一注入基础参数，业务侧只补业务参数、结果、耗时和链路标识。

## Bad (Ray 小程序)
```tsx
ty.reportAnalytics('slow', {
  page: 'home',
});
```
只有事件名，无上下文参数，线上数据无法定位问题发生的条件和原因。

## Good (Ray 小程序)
```tsx
reportExperienceEvent({
  event: 'generate_result',
  action: 'ai_generate',
  result: 'fail',
  duration: 3200,
  errorCode: 'TIMEOUT',
  requestId: 'req-abc-123',
  styleId: 'watercolor',
});
```
事件名语义清晰，携带操作结果、耗时、错误码、请求关联 ID 和业务参数；页面、设备、网络、小程序版本等基础参数由统一埋点封装补齐。

## Miniapp Wrapper Example
```tsx
import { getSystemInfoSync } from '@ray-js/ray';

export function reportExperienceEvent(params) {
  const app = getApp();
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  const systemInfo = getCachedSystemInfo() || getSystemInfoSync();

  ty.reportAnalytics('experience_event', {
    miniProgramId: app.globalData.miniProgramId,
    miniProgramVersion: app.globalData.version,
    pagePath: page?.route,
    deviceModel: systemInfo.model,
    networkType: app.globalData.networkType,
    ...params,
  });
}
```
小程序侧缺少统一埋点版本时，用项目级封装补齐基础参数，避免每个业务点重复拼装。

## Why
埋点是线上体验度量和问题排查的基础。缺少合理设计的埋点无法回答"哪些用户在什么条件下遇到了什么问题"，导致优化无据可依、问题无法召回。
