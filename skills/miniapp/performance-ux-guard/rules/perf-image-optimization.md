---
id: perf-image-optimization
priority: HIGH
category: Performance > Resources
---

# 图片尺寸与格式优化

## Rule
图片必须控制尺寸、使用适当格式，禁止首屏大图阻塞与 base64 内嵌大图

## Bad
```ttml
<image src="{{rawUrl}}" />
```
使用原始大图 URL 且无尺寸约束，浪费带宽，阻塞首屏

## Good
```ttml
<image src="{{cdnUrl}}?imageView2/2/w/375" mode="widthFix" lazy-load />
```
CDN 裁剪 + 懒加载

## Why
未优化图片是首屏加载最大瓶颈之一。使用 CDN 裁剪可减少 60-80% 传输体积，lazy-load 避免非可视区图片阻塞首屏。
