---
id: net-concurrent-limit
priority: MEDIUM
category: Network > Control
---

# 网络并发应有上限

## Rule
并发网络请求应有上限控制，避免同时发起过多请求导致排队。

## Bad
```js
// 页面 onLoad 同时 ty.request × 10+
Promise.all(urls.map((u) => ty.request({ url: u })));
```
超过小程序并发上限时整体排队，关键请求被拖慢。

## Good
```js
// 请求队列或 p-limit 等，同时进行中 ≤ 5～6
```
关键路径优先、其余排队，整体吞吐更可控。

## Why
小程序对并发请求有上限（通常 10 个），超出会排队。控制并发保证关键请求优先完成。
