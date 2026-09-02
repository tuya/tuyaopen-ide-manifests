---
id: launch-sub-ui-config-prefetch
priority: MEDIUM-HIGH
category: Launch > Data
---

# 子 UI 配置应前置拉取

## Rule
首屏依赖的子 UI 配置、动态样式配置和运营配置应在进入页面前预取或随首页关键数据合并下发，避免页面渲染后再等待配置。

## Bad
```js
Page({
  async onLoad() {
    const home = await fetchHome();
    this.setData({ home });
    const uiConfig = await fetchSubUiConfig();
    this.setData({ uiConfig });
  },
});
```
页面先渲染默认 UI，再等待配置二次刷新，容易出现闪动和首屏等待。

## Good
```js
// 路由跳转或应用启动阶段预取
prefetch("homeUiConfig", fetchSubUiConfig);

Page({
  async onLoad() {
    const [home, uiConfig] = await Promise.all([
      fetchHome(),
      readPrefetch("homeUiConfig"),
    ]);
    this.setData({ home, uiConfig });
  },
});
```
子 UI 配置与首屏关键数据并行准备，首屏只渲染一次稳定结构。

## Why
动态 UI 配置如果后置获取，会增加首屏等待或造成界面闪烁。前置拉取能减少关键渲染链路上的串行依赖。
