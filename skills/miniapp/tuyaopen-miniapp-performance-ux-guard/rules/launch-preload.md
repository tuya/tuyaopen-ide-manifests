---
id: launch-preload
priority: MEDIUM
category: Launch > Package
---

# 预加载子包减少等待

## Rule
利用小程序预加载能力（preDownloadMiniApp 等）提前下载子包

## Bad
```js
// 用户点击后才 navigateTo 子包页面，子包此时才开始下载
onEntryTap() {
  ty.navigateTo({ url: '/package-foo/pages/bar/index' });
}
```
用户点击入口后才开始下载子包 — 用户需等待下载+解析。

## Good
```js
onShowPrevPage() {
  ty.preDownloadMiniApp?.({ subPackages: ['package-foo'] });
}
```
在合适时机（如进入前一个页面时）预下载目标子包。

## Why
预加载使子包在用户真正打开时已就绪，消除下载等待时间。
