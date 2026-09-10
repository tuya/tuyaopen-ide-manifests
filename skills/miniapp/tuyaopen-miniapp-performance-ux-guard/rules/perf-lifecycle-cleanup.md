---
id: perf-lifecycle-cleanup
priority: HIGH
category: Performance > Lifecycle
---

# Lifecycle Cleanup

## Rule
在 onUnload/onHide/componentDetached 中必须清理定时器、监听器、轮询和订阅，防止内存泄漏。

## Bad
```js
onLoad() {
  this.timer = setInterval(poll, 3000);
}
```
onUnload 中无 clearInterval，页面销毁后轮询继续执行。

## Good
```js
onLoad() {
  this.timer = setInterval(poll, 3000);
}
onUnload() {
  clearInterval(this.timer);
  this.timer = null;
}
```
生命周期结束时清理定时器，避免泄漏与空转。

## Why
未清理的定时器和监听器会在页面销毁后继续执行，造成内存泄漏、CPU 空转和不可预期的状态更新。多次进出页面后问题会累积放大。
