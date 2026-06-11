---
id: launch-remove-react-dom
priority: HIGH
category: Launch > Package
---

# Ray 项目不得误打包 react-dom

## Rule
Ray 小程序应使用已修复依赖链的 Ray/CLI 版本，禁止把 Web 侧 `react-dom` 误打进业务包。

## Bad
```text
dist package contains react-dom runtime chunks
```
`react-dom` 不参与小程序运行，却会额外增加 100KB+ 包体积。

## Good
```text
Ray/CLI upgraded; bundle analysis confirms react-dom is absent from miniapp package.
```
通过版本升级和包分析确认 `react-dom` 未进入业务包。

## Why
Wiki 启动性能基线指出新版 Ray 已去除错误依赖 `react-dom` 的问题，可让业务包减少 100KB+。包体越小，代码包下载与注入越快。
