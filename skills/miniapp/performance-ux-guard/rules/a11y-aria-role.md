---
id: a11y-aria-role
priority: LOW-MEDIUM
category: Accessibility > Semantics
---

# ARIA Roles for Custom Interactive Elements

## Rule
自定义交互元素应设置正确的 aria-role，使辅助技术可识别元素用途。

## Bad
```html
<view bindtap="onToggle">开关</view>
```
辅助技术无法识别这是一个开关控件。

## Good
```html
<view
  bindtap="onToggle"
  aria-role="switch"
  aria-checked="{{checked}}"
>开关</view>
```
明确角色与 checked 状态，读屏可正确播报。

## Why
小程序中大量使用 view 模拟交互控件，缺少角色标注使辅助技术用户无法理解元素功能。
