---
id: layout-safe-area
priority: MEDIUM
category: Layout > Adaptation
---

# 全面屏底部安全区适配

## Rule
全面屏设备必须适配安全区域，底部操作栏需加 safe-area-inset-bottom。

## Bad
```css
.footer { position: fixed; bottom: 0; }
```
在 iPhone 等全面屏设备被 Home Indicator 遮挡。

## Good
```css
.footer {
  padding-bottom: calc(env(safe-area-inset-bottom) + 16rpx);
}
```
或使用 `<view class="safe-area-bottom" />` 占位。

## Why
不适配安全区域导致底部按钮被遮挡或误触，全面屏设备占有率已超 80%。
