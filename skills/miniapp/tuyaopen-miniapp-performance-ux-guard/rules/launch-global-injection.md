---
id: launch-global-injection
priority: HIGH
category: Launch > Init
---

# 避免全局注入非必要组件

## Rule
避免在 app.json 中全局注入非必要的自定义组件或插件；原生写法和多页面复杂业务优先使用页面级按需注入。

## Bad
```json
{
  "usingComponents": {
    "a": "/components/a/index",
    "b": "/components/b/index",
    "c": "/components/c/index",
    "d": "/components/d/index",
    "e": "/components/e/index",
    "f": "/components/f/index",
    "g": "/components/g/index",
    "h": "/components/h/index",
    "i": "/components/i/index",
    "j": "/components/j/index",
    "k": "/components/k/index"
  }
}
```
全局注册了 10+ 组件，其中多数仅在个别页面使用。

## Good
```json
{
  "usingComponents": {
    "global-nav": "/components/global-nav/index"
  }
}
```
仅全局注册真正全局使用的组件，其余在页面级按需注册。

## Why
全局注入的组件在每个页面都会被初始化，增加启动和页面切换的额外开销。按需注入能让首屏只承担当前页面需要的组件成本。
