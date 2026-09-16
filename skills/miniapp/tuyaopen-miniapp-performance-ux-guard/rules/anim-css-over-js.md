---
id: anim-css-over-js
priority: MEDIUM
category: Animation > Engine
---

# Prefer CSS Animation Over JS Timers

## Rule
优先使用 CSS animation/transition 实现动画，避免 JS 定时器驱动。

## Bad
```js
setInterval(() => {
  this.setData({ opacity: nextOpacity });
}, 16);
```
JS 线程与渲染线程频繁通信，每帧跨线程 setData。

## Good
```css
.fade { transition: opacity 0.3s ease; }
/* 或小程序 createAnimation：动画导出后在渲染层播放 */
```
CSS transition/animation 或小程序 createAnimation API，动画在渲染层执行，不阻塞逻辑层。

## Why
CSS 动画在渲染层（GPU 合成线程）直接执行，不需跨线程通信，帧率更稳定。JS 驱动动画每帧触发 setData 导致卡顿。
