---
id: a11y-image-alt
priority: MEDIUM
category: Accessibility > Content
---

# Meaningful Images Need Alt; Decorative Images Are Hidden

## Rule
有意义的图片必须提供 alt/aria-label 描述，装饰性图片标记 aria-hidden。

## Bad
```html
<image src="{{url}}" />
```
屏幕阅读器无法获取图片内容。

## Good
```html
<image src="{{url}}" aria-label="用户头像" />
<image src="{{bg}}" aria-hidden="true" />
```
有意义内容用 aria-label；纯装饰图用 aria-hidden 避免朗读干扰。

## Why
无障碍用户依赖替代文本理解图片内容。缺少 alt 描述使内容不可达，违反 WCAG 1.1.1。
