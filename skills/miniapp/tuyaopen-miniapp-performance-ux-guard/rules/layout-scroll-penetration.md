---
id: layout-scroll-penetration
priority: MEDIUM
category: Layout > Scroll
---

# 弹窗内阻止背景滚动穿透

## Rule
弹窗/半屏组件必须阻止背景滚动穿透。

## Bad
```ttml
<view class="mask" bindtap="close">
  <view class="sheet">...</view>
</view>
```
弹窗打开后手指滑动时背景页面跟着滚动，用户体感异常。

## Good
```ttml
<view class="mask" catchtouchmove="noop">
  <view class="sheet" catchtouchmove>...</view>
</view>
```
遮罩层使用 `catchtouchmove` 阻止穿透，或配合 `page-meta` 设置页面 `overflow: hidden`。

## Why
滚动穿透是小程序中最常见的体验 bug 之一，破坏弹窗的沉浸感和操作准确性。
