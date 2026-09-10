---
id: net-cache-first
priority: MEDIUM
category: Network > Strategy
---

# 非实时数据应缓存优先（SWR）

## Rule
非实时性数据请求应采用缓存优先策略（Stale-While-Revalidate）。

## Bad
```js
onShow() {
  ty.request({ url: configUrl }); // 每次进入都全量拉配置
}
```
无缓存时重复请求，浪费带宽且首屏慢。

## Good
```js
const cached = getStorageSync('config');
if (cached) this.setData({ config: cached });
ty.request({ url: configUrl }).then((res) => {
  setStorageSync('config', res.data);
  this.setData({ config: res.data });
});
```
先展示缓存，后台刷新后更新存储与视图。

## Why
SWR 策略兼顾速度与新鲜度。用户立即看到内容（虽可能略旧），随后静默更新。
