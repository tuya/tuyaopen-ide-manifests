---
id: layout-custom-navbar
priority: MEDIUM
category: Layout > Navigation
---

# 自定义导航栏高度动态计算

## Rule
自定义导航栏必须正确计算高度（状态栏高度 + 胶囊按钮区域），不可硬编码。

## Bad
```css
.navbar { height: 88rpx; }
```
不同设备状态栏高度不同，导致遮挡或留白。

## Good
```js
const sys = ty.getSystemInfoSync();
const menu = ty.getMenuButtonBoundingClientRect();
const navHeight = menu.top + menu.height + (menu.top - sys.statusBarHeight);
```
通过 `statusBarHeight` 与胶囊按钮位置动态计算导航栏高度。

## Why
不同设备（如刘海屏、折叠屏）状态栏高度差异大，硬编码无法适配。动态计算确保导航栏在所有设备正确显示。
