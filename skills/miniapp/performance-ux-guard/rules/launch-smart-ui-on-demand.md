---
id: launch-smart-ui-on-demand
priority: HIGH
category: Launch > Package
---

# Ray Smart UI 必须按需加载

## Rule
Ray 项目使用 `@ray-js/smart-ui` 时必须按需引入组件，禁止整包导入或全局注册大量 Smart UI 组件。

## Bad
```ts
import * as SmartUI from "@ray-js/smart-ui";
```
整包导入会把未使用组件也打进主包，增加下载和初始化成本。

## Good
```ts
import { Button, Dialog } from "@ray-js/smart-ui";
```
只引入当前页面或组件实际使用的 Smart UI 能力，非首屏组件延后到对应分包或页面级使用。

## Why
Smart UI 组件能力丰富，整包或全局加载会放大主包体积。按需加载可降低启动下载量与组件初始化开销。
