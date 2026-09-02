# 发布前体验检查清单

在 Deep Review 或用户要求上线前检查时使用此清单。与 `obs-release-gate` 规则配合使用。

## 硬性门禁（不达标 = 阻断发布）

- [ ] 主包体积 ≤2MB
- [ ] 无 Blocking 级体验问题
- [ ] 关键操作按钮均有 loading/禁用反馈
- [ ] 首屏阻塞网络请求 ≤1 个
- [ ] 启动阶段同步 API 调用 ≤2 次
- [ ] 关键功能路径的埋点覆盖合理（埋点位置、服务指标、事件参数按功能设计）
- [ ] 代码中注释外无硬编码中文字符串（已走 i18n）

## 强烈建议（不达标 = 标记风险但可发布）

- [ ] 首屏加载时间 ≤3s（P95）
- [ ] 关键交互反馈延迟 ≤200ms
- [ ] 长列表已虚拟化或分页（>50 项）
- [ ] 异步链路覆盖 loading/error/retry/empty 四态
- [ ] 底部操作栏适配安全区域
- [ ] 弹窗/半屏阻止滚动穿透
- [ ] 所有定时器/监听器在页面卸载时清理
- [ ] 新增代码复用项目已有请求、状态、组件、i18n、埋点模式
- [ ] 已提供 lint/typecheck/test/页面自测/MCP 等验证证据，或明确验证缺口

## 建议检查（不达标 = 记录待优化）

- [ ] 触摸目标 ≥44pt
- [ ] 文本对比度 ≥4.5:1
- [ ] 骨架屏使用容器方案
- [ ] 数据预取/缓存优先策略已启用
- [ ] Ray Smart UI 已按需加载，未整包导入或大量全局注册
- [ ] 首屏仅传可见字段和首批数据，未把接口全量响应直接下发渲染层
- [ ] 非首屏模块、二屏数据和历史记录已延后或渐进加载
- [ ] 首屏依赖的子 UI 配置已预取或与关键数据并行获取
- [ ] 无特殊原因未关闭内存缓存
- [ ] Ray 小程序包未误打入 `react-dom`
- [ ] React/Lodash/Smart UI/Ray 等公共依赖已评估基础库、CDN 或容器缓存复用方案
- [ ] 已使用体验评分工具或等效检查，并将低分项回流到规则/待办
- [ ] 私有图片签名 URL 已通过 CachedImage + 本地持久化缓存
- [ ] 召回阈值已配置（首屏 P95 >3s 报警、失败率 >5% 报警）

## 关联规则

- `obs-release-gate`
- `obs-alert-thresholds`
- `launch-package-budget`
- `launch-smart-ui-on-demand`
- `launch-render-bridge-budget`
- `launch-progressive-first-screen`
- `launch-sub-ui-config-prefetch`
- `launch-memory-cache`
- `launch-remove-react-dom`
- `launch-public-dependency-cache`
- `obs-experience-score-check`
- `net-image-sign-cache`
- `code-no-hardcoded-chinese`
- `code-pattern-consistency`
- `code-validation-evidence`
