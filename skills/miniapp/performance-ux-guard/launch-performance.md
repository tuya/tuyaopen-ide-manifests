# Launch Performance Workflow

## Quick Start

围绕代码包下载、代码注入、首页渲染、首屏数据、首屏组件和容器能力做优化。先量化瓶颈，再改代码；没有数据时先输出可验证假设。

## Wiki Baseline

评审或优化时覆盖 19 项启动优化：

1. 分包加载
2. 避免非必要全局组件/插件注入
3. 控制包内资源体积，重资源上 CDN
4. 清理无用代码/资源
5. Smart UI 按需加载
6. Ray 通信数据量优化
7. Ray 引擎内置基础库
8. 按需注入
9. 减少启动同步 API
10. 避免启动复杂运算
11. 精简首屏数据与组件，渐进渲染
12. 数据预取
13. 缓存请求数据
14. 容器骨架屏
15. 体验评分工具
16. 去除 Ray 项目错误依赖 `react-dom`
17. 面板子 UI 配置前置拉取
18. 小程序预加载
19. 内存缓存

另补充：公共依赖资源复用缓存（React/Lodash/Smart UI/Ray 等）。

## Workflow

1. 读启动路径：入口、首页、app 配置、首屏 service、全局组件、资源、缓存。
2. 判断瓶颈类型：包体、注入、同步阻塞、首屏数据、渲染复杂度、缓存、容器能力。
3. 按需读取规则：`rules/launch-*.md`、`rules/perf-serial-requests.md`、`rules/perf-navigation-prefetch.md`、`rules/perf-heavy-compute-in-render.md`、`rules/perf-setdata-*.md`。
4. 对照 `references/wiki-optimizations.md` 输出 19 项覆盖率，并参考 `references/miniapp-best-practices.md` 检查 `ray doctor`、构建依赖分析、Smart UI 按需导入、CDN、分包和常见体积问题。
5. 优先修复 Blocking/High：主包 >2MB、同步 API >2、启动重计算、全局注入、首屏等待非关键数据、Smart UI 整包、误打 `react-dom`。
6. 修改后给出证据或验证计划：包体变化、`ray doctor`/构建分析结果、首屏请求数量、同步 API 数量、缓存/预取命中路径、体验评分结果。

## Quality Budget

- 主包：<=2MB
- 首屏阻塞请求：<=1
- 启动同步 API：<=2
- 首屏只下发可见字段和首批数据
- >50 项列表必须分页、虚拟化或渐进渲染

## Output

```markdown
## Baseline
- Package size: known / unknown
- First-screen requests: X
- Sync APIs during startup: X

## Launch Optimization Coverage
- Covered: 14/19
- Missing: Smart UI 按需加载、体验评分、内存缓存

## Findings
1. [High] `launch-sync-api` 启动阶段 3 次同步 API
2. [High] `launch-render-bridge-budget` 首屏下发全量配置

## Changes / Plan
- ...

## Verification
- ...
```

## Boundaries

- 启动优化必须保持功能正确性和数据一致性
- 公共依赖复用缓存涉及基础库/容器策略时，只给出接入建议，不擅自改平台策略
- Wiki 中标注“测试中”的能力需注明风险和适用条件
