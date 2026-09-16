---
id: form-keyboard-adapt
priority: MEDIUM
category: Form > Layout
---

# 键盘弹起时保证输入框可见

## Rule
键盘弹起时必须确保输入框不被遮挡，合理使用 adjust-position 或手动滚动。

## Bad
```css
.bar-input { position: fixed; bottom: 0; /* 无 adjust-position / 无键盘避让 */ }
```
底部固定输入框被键盘完全遮挡，用户看不到正在输入的内容。

## Good
```ttml
<input adjust-position="{{true}}" />
```
或使用 `ty.onKeyboardHeightChange` 监听键盘高度并手动调整容器 `padding-bottom`。

## Why
输入框被键盘遮挡是小程序中高频投诉的体验问题，尤其在底部输入栏和表单页场景。
