---
id: launch-memory-cache
priority: MEDIUM-HIGH
category: Launch > Cache
---

# 内存缓存默认保持开启

## Rule
无明确内存风险或数据一致性要求时，小程序首屏关键数据、配置和静态映射应保留内存缓存，禁止随意关闭或每次重新请求。

## Bad
```js
const disableMemoryCache = true;

Page({
  onShow() {
    return fetchHomeConfig();
  },
});
```
每次进入页面都重新取配置，浪费网络和启动链路时间。

## Good
```js
const memoryCache = new Map();

export async function getHomeConfig() {
  if (memoryCache.has("homeConfig")) {
    return memoryCache.get("homeConfig");
  }
  const config = await fetchHomeConfig();
  memoryCache.set("homeConfig", config);
  return config;
}
```
首屏关键配置优先走内存缓存，必要时配合 TTL 或版本号刷新。

## Why
内存缓存能避免页面回退、二次进入和多模块复用时重复请求。关闭缓存会放大弱网和低端机上的启动等待。
