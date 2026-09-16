---
id: launch-startup-heavy-compute
priority: HIGH
category: Launch > Init
---

# Heavy Compute on Startup

## Rule
启动阶段（onLaunch/onLoad 首次执行）禁止执行复杂计算、大数据处理或长循环，重逻辑必须延后。

## Bad
```js
onLaunch() {
  heavyConfigParse(rawConfig);
  bigList.sort(complexCompare);
}
```
在 onLaunch 中做配置解析、大数组排序等 — 阻塞 JS 线程数十到数百毫秒。

## Good
```js
onLaunch() {
  routeInit();
  authInit();
  setTimeout(() => heavyWork(), 0);
}
```
启动仅做最小初始化，重逻辑用 setTimeout(0) 或 requestAnimationFrame 延后到首屏后。

## Why
启动阶段的 JS 线程阻塞直接推迟首屏渲染。将非首屏必需的重逻辑延后，可让用户更早看到可交互界面。
