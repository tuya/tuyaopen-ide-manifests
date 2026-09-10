---
id: a11y-color-contrast
priority: MEDIUM
category: Accessibility > Visual
---

# Text and Background Color Contrast (WCAG AA)

## Rule
文本与背景色对比度必须满足 WCAG AA 标准（正文 ≥4.5:1，大文本 ≥3:1）。

## Bad
```css
color: #999;
background: #fff;
```
对比度约 2.85:1，低于正文 AA 要求。

## Good
```css
color: #595959;
background: #fff;
```
对比度约 7:1，满足 AA 并提升可读性。

## Why
低对比度在户外强光、老年用户、色弱用户场景下可读性极差。确保对比度达标是基本无障碍要求。
