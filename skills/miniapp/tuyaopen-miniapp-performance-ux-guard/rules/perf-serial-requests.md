---
id: perf-serial-requests
priority: CRITICAL
category: Performance > Data Fetching
---

# 并行发起无依赖网络请求

## Rule
无依赖关系的网络请求必须并行发起，禁止串行 await

## Bad
```js
const user = await getUser();
const config = await getConfig();
```
两个无依赖请求串行等待

## Good
```js
const [user, config] = await Promise.all([getUser(), getConfig()]);
```
并行发起

## Why
串行请求使总耗时为各请求之和；并行后为最长单个请求耗时，首屏可节省数百毫秒。
