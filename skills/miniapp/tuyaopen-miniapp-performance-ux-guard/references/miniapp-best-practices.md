# Miniapp Best Practices（开发最佳实践）

本参考用于普通开发、UI 还原和上线前检查。内容来自《Ray 小程序体积体验优化方案》等最佳实践沉淀，并整理为 skill 可执行规则。

## Environment Baseline

- Node.js 建议使用 `18.20.8` 或以上。
- 使用 `nvm` 管理 Node 版本，避免本机版本漂移。
- 使用项目约定包管理器安装依赖，不混用 `npm` / `yarn` / `pnpm`。
- 安装 Tuya MiniApp IDE / DevTools，用于预览、调试、上传和体验评分。

## Ray UI Development

- Ray 面板小程序优先使用 `@ray-js/smart-ui` 和项目已有公共组件。
- 原生智能小程序可使用 `@tuya-miniapp/smart-ui`。
- 编码前先检查 `src/components/`、页面相邻模块、样式变量、请求/i18n/埋点封装。
- 设计稿还原不应只追求静态像素，必须同时覆盖 loading、error、empty、disabled、safe area、触摸热区和 i18n。

## Package and Startup Optimization

小程序是全量加载代码，体积会直接影响下载、解析和首屏体验。优化方向遵循三类：

1. 减小整体打包体积。
2. `Code Splitting`：按需加载，降低页面首次加载体积，例如按路由、可见性或功能模块延后加载。
3. `Bundle Splitting`：按模块变更频率分层打包，利用缓存减少重复下载。

### Recommended Workflow

- 优先使用小程序快速优化工具处理图片批量压缩、包依赖和体积可视化等问题。
- 在项目根目录执行 `ray doctor`（`@ray-js/cli >= 1.8.0-beta.12`）做静态分析，发现 Smart UI 未按需导入、CommonJS 模块、不推荐依赖等问题。
- 查看构建依赖分析，定位大包、重复依赖和异常依赖链。
- 使用 `@ray-js/smart-ui` 时配置按需导入，不要整包引入；如果三方包间接整包依赖 Smart UI，需要推动依赖作者修复。
- 图片资源优先压缩或上 CDN，避免在项目内直接引入大静态资源。只有明确要求首屏立即展示且网络请求不可接受时，才考虑小体积包内资源。
- 优化后主包仍超过 2MB 时，启用小程序分包。

### Common Package Issues

- `iconfont.css` 因错误依赖链进入多个页面包：升级 Ray / CLI，并使用按需引入。
- Smart UI 未按需加载：未引用组件也被打包。
- Smart UI icon base64 体积大：按需引入或替换为更轻资源。
- `lodash` 与 `lodash-es` 重复：优先使用 ESM 版本，`lodash` 替换为 `lodash-es`，`moment` 替换为 `dayjs`。
- CommonJS 导入影响 tree-shaking 和压缩：改用 ESModule。
- `ray-core` 相关 JSON 或大配置进入启动路径：检查是否可裁剪、延后或分包。

## Experience Score Checks

实现或 review 时至少关注：

- 避免未捕获 JS 异常：异步入口要有 `try/catch` 或统一错误处理。
- 所有网络资源使用 HTTPS。
- 包内图片建议控制在 100KB 以内，较大图片走压缩、CDN 或远程资源。
- 图片域名需要满足小程序域名白名单和多区合规要求。
- 面板业务 DP 上报频率需控制，避免高频上报影响性能和体验。
- 首屏不等待非关键数据；二屏模块、历史记录、运营配置等可延后或渐进加载。

## Validation Baseline

- 有项目校验脚本时，优先运行与本次变更范围匹配的脚本。
- 没有脚本或脚本不覆盖时，至少使用 IDE diagnostics、页面自测、关键路径截图/日志说明补齐证据。
- 设计稿/UI 还原类任务完成后，应执行 UI 自证：截图对比、关键状态覆盖、控制台错误检查、主要交互闭环。

## Output Requirements

最终交付需说明：

- 复用了哪些项目组件 / Smart UI 组件。
- 哪些地方新建组件，为什么现有组件不满足。
- 执行了哪些验证；未执行的验证需要说明原因。
- 如果依赖的外部能力（如知识库 / MCP / DevTools）在当前环境不可用，明确标记为 `Not Available`，不要伪造验证结论。
