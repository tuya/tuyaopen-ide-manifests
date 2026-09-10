---
id: launch-public-dependency-cache
priority: MEDIUM-HIGH
category: Launch > Resources
---

# 公共依赖资源应支持复用缓存

## Rule
多个小程序复用的基础依赖（如 React、Lodash、Smart UI、Ray 引擎等）应优先使用框架、基础库或 CDN 的公共资源复用缓存能力，避免在每个业务包重复下载。

## Bad
```text
Each miniapp bundles its own React, Lodash, Smart UI, and Ray runtime copies.
```
相同公共依赖在多个小程序中重复打包，用户每打开一个小程序都重新下载。

## Good
```text
Common dependencies are externalized or handled by base library/container cache with versioned CDN paths.
```
公共依赖通过外部依赖声明、基础库内置或版本化 CDN 缓存复用。

## Why
公共资源复用能让用户打开多个小程序时共享本地缓存，减少重复下载和初始化成本。版本化 CDN 或基础库版本管理可保证资源稳定性。
