# 小程序启动性能与体验反馈优化清单（Tuya 实践沉淀）

本文档为团队在小程序启动性能与体验反馈渠道两个主题上沉淀的优化清单与方法论。

## A. 体验反馈渠道方法（准入 + 召回 + 度量）

### 1) 双阶段治理

- `准入阶段`：上线前执行体验检查清单，阻断高风险体验问题进入线上
- `召回阶段`：线上数据回收与问题复盘，按同一优化策略回流到准入规则

### 2) 指标闭环

将“主观反馈”与“客观指标”绑定，至少覆盖：

- 召回数与召回率（可接受误差）
- 页面与链路维度（页面名、关键步骤、错误码）
- 设备/网络维度（机型、系统版本、网络类型）

### 3) 通用指标汇总

- 统一采集关键体验指标并形成看板
- 对线上埋点做闭环：发现问题 -> 定位 -> 修复 -> 回归验证

## B. 启动性能优化方法（优先级高）

以下条目建议默认纳入 skill 的“首屏与启动”检查：

1. 分包加载（包体较大项目优先）
2. 避免非必要全局组件/插件注入（`app.json` 全局注入谨慎）
3. 控制包内资源体积，重资源上 CDN
4. 清理无用代码/无用资源
5. smart-ui 按需加载（Ray 项目）
6. 通信数据量优化（Ray 项目）
7. 使用基础库内置引擎能力（可用时）
8. 按需注入（原生写法/多页面复杂业务）
9. 启动阶段减少同步 API 调用（避免阻塞 JS 线程）
10. 启动过程避免复杂计算，重逻辑延后
11. 精简首屏数据与首屏组件，采用渐进渲染
12. 数据预取（首屏强依赖数据场景）
13. 请求数据缓存（优先本地缓存后网络更新）
14. 使用容器骨架屏，不在业务层重复自绘骨架
15. 使用体验评分工具做周期体检
16. 去除 Ray 项目错误依赖 `react-dom`，减少 100KB+ 包体积
17. 子 UI 配置前置拉取（减少首屏等待）
18. 小程序预加载（`preDownloadMiniApp` 等）
19. 内存缓存默认开启（无特殊场景不建议关闭）

### 20) 公共资源复用缓存思路

- 将 React、React-DOM、Lodash、Smart UI、Ray 等公共依赖从业务代码包中分离
- 通过外部依赖声明、基础库内置或版本化 CDN 路径复用缓存
- 容器/客户端可拦截公共库 CDN 请求并优先命中本地缓存
- 多小程序复用相同公共依赖，避免重复下载

## C. Skill integration rules

### 触发词增强

新增触发词：`启动性能`、`分包`、`预加载`、`骨架屏`、`数据预取`、`缓存`、`准入`、`召回`、`体验度量`、`埋点闭环`

### 审查必查项

1. 是否有启动阶段阻塞（同步 API、重计算、全局注入）
2. 是否具备首屏优化（分包、资源 CDN、渐进渲染、预取/缓存）
3. 是否具备反馈闭环（准入 gate + 线上召回 + 指标可归因）

### Wiki 条目到规则映射

| Wiki 优化条目 | Skill 规则 |
|---|---|
| 分包加载 | `launch-subpackage` |
| 避免非必要全局组件/插件注入、按需注入 | `launch-global-injection` |
| 控制包内资源体积，重资源上 CDN | `launch-resource-cdn`, `launch-package-budget` |
| 清理无用代码/无用资源、减少历史依赖 | `launch-dead-code-cleanup` |
| Smart UI 按需加载 | `launch-smart-ui-on-demand` |
| 通信数据量优化 | `launch-render-bridge-budget`, `perf-setdata-granularity` |
| 使用基础库内置引擎能力 | `launch-engine-capability` |
| 启动阶段减少同步 API 调用 | `launch-sync-api` |
| 启动过程避免复杂计算 | `launch-startup-heavy-compute` |
| 精简首屏数据与组件、渐进渲染 | `launch-progressive-first-screen`, `list-incremental-render` |
| 数据预取 | `launch-data-prefetch` |
| 请求数据缓存 | `launch-cache-strategy` |
| 容器骨架屏 | `launch-skeleton-screen` |
| 体验评分工具周期体检 | `obs-experience-score-check` |
| 去除错误依赖 react-dom | `launch-remove-react-dom` |
| 子 UI 配置前置拉取 | `launch-sub-ui-config-prefetch` |
| 小程序预加载 | `launch-preload` |
| 内存缓存默认开启 | `launch-memory-cache` |
| 公共资源复用缓存 | `launch-public-dependency-cache` |

### 输出增强项

在最终输出中增加：

- `Launch Optimization Coverage`：19 项中命中与缺失条目
- `Feedback Loop Readiness`：准入、召回、度量三个维度的完备度
