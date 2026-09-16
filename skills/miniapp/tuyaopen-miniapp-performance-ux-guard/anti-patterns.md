# Miniapp Anti-Patterns（必标记清单）

> **优先级声明**：本清单为最高优先级。当 `rules/*.md` 或 `templates/*.md` 中的描述与本清单冲突时，以本清单为准。

以下模式一经发现必须标记，不论上下文。AI 生成代码时应主动避免，审查时应立即 flag。

## Performance

- `this.setData(this.data)` 或整对象覆盖式 setData（全量序列化）
- 单次 `setData` 数据量 >256KB（跨线程传输瓶颈）
- `onLaunch`/`onLoad` 中 `getStorageSync`/`getSystemInfoSync` 连续调用 >2 次
- 无依赖关系的网络请求串行 `await`（应 `Promise.all`）
- Ray 列表一次性渲染 >50 项且无虚拟列表/分页
- `ScrollView` 的 `onScroll` / 原生 `bindscroll` 回调中直接更新大状态且无节流
- 首屏 base64 内嵌大图（>10KB）
- 包内图片/字体/大 JSON 未上 CDN（增大包体）
- `app.json` usingComponents 注册 >5 个非全局使用的组件
- Ray 项目整包导入 `@ray-js/smart-ui` 或全局注册大量 Smart UI 组件
- Ray 小程序业务包中误打入 `react-dom`
- 多个小程序复用的 React/Lodash/Smart UI/Ray 等公共依赖在每个业务包重复打包，未使用基础库/CDN/容器缓存复用能力
- 启动阶段把接口全量响应、大列表或未裁剪配置一次性传给渲染层
- 渲染路径内执行 `.filter().map().sort()` 链式重计算
- 主包体积 >2MB
- 启动阶段（onLaunch/onLoad）执行大数组排序、复杂解析等重计算
- 首屏等待二屏模块、历史记录、运营配置等非关键数据全部完成后才渲染
- 无明确原因关闭内存缓存，导致每次进入页面重复请求首屏配置/数据
- 点击跳转下一页时，参数已知却让下一页 mount 后才发起强依赖请求（应在点击同时并行发起，让 `navigate` 与 `fetch` 并行执行）

## Lifecycle & Memory

- 未清理的定时器（`setInterval`/`setTimeout` 无对应 `clearInterval`/`clearTimeout`）
- 页面 `onUnload` 中缺少监听器移除（`off` 对应 `on`）
- 轮询逻辑在页面卸载后仍在执行
- 事件订阅在组件 `detached` 后未取消

## Interaction

- 按钮 `bindtap` 处理器无防重复提交（无 loading/disabled/throttle）
- 异步操作仅处理 success，无 loading 态、无 catch、无失败提示
- 网络请求无 `timeout` 设置
- 错误提示只显示错误码或 `"请求失败"`，无用户可理解信息
- 弹窗/半屏未阻止背景滚动穿透
- 上传/压缩等耗时操作无进度反馈

## Observability & Privacy

- 体验埋点缺少核心业务字段（必填：action/result；强烈推荐：duration/errorCode/requestId/sessionId；page/networkType 等基础字段由小程序埋点封装补齐）
- 埋点/日志中出现明文 userId、手机号、精确位置、密码、token
- 反馈事件无 sessionId/requestId 关联标识，无法与后端链路打通
- 线上体验指标无异常阈值和报警规则
- 上报 `{ event: 'slow' }` 类无归因维度的裸埋点

## Accessibility

- 可点击元素尺寸 <88rpx（44pt）且无扩展热区
- 功能性图片无 `aria-label` / `alt`
- 文本对比度 <4.5:1（正文）或 <3:1（大文本）
- `<view bindtap>` 模拟交互控件但缺少 `aria-role`

## Layout

- 底部操作栏无 `safe-area-inset-bottom` 适配
- 自定义导航栏高度硬编码（未动态计算状态栏+胶囊）
- 输入框被键盘遮挡且未处理 `adjust-position`

## Animation

- 使用 `setInterval`/`setTimeout` 驱动逐帧动画（应用 CSS animation / createAnimation）
- 动画运行期间高频更新视觉状态导致重布局
- `transition: all` 而非指定具体属性
- 低端机未降级复杂动画效果

## Content

- Loading 文案使用 `...` 而非 `…`（U+2026）
- 空数据时渲染空白区域，无空状态引导

## Component & Architecture

- Smart UI 已有组件但自研了功能相同的组件（如自写 Dialog 替代 `@ray-js/smart-ui` Dialog）
- 弹窗/抽屉/底部面板/选择器可由 Smart UI 或项目现有组件承载，却在页面文件中临时自研一套视觉壳子
- 因“设计稿长得不一样”直接放弃 `Dialog` / `Overlay` / `ActionSheet`，未先尝试包装组件库组件
- `src/components/` 中已有可复用组件但页面内重新实现了相同功能（重复造轮子）
- 两个以上页面使用相同 UI 模式但各自实现，未提取公共组件
- 接到设计稿需求直接开写，未先获取 DSL 分析结构
- 大需求（2+ 页面）未做组件拆分直接实现，导致代码耦合
- 组件 Props 接口定义过于宽泛（`any` 类型或无类型约束）
- 简单新增参数、slot 或样式变量即可向下兼容扩展时，直接 fork 重写已有组件

## Network & Image

- 私有签名图片直接使用 `<Image src={signedUrl}>` 且未通过 CachedImage 缓存签名 URL，导致每次轮询/刷新重复下载同一张图
- 签名 URL 缓存仅存内存（Map），未持久化到 ty.setStorage，第二次打开小程序仍需全量下载

## Theming & Style Variables

- 设计稿的 `rgba()` 值能在 `references/app-css-variables.md` 反查表里匹配到框架变量，代码里仍硬编码 `rgba()` / `#xxx` 字面量，导致 dark mode 不跟随
- 为了"显示效果不变"在元素上写死 `color: #000` / `background: #fff`，绕过框架的主题切换机制
- 自己在组件内重新定义 `:root[data-theme=dark]` 覆盖，不复用框架已沉淀的设计 Token
- 字号 / 间距 / 圆角能匹配 `--app-T*` / `--app-P*` / `--app-C*` 但代码里仍写 `16px` / `12px` 等魔数

## Code Quality

- 未阅读相邻实现就新建一套项目已有的请求、状态、组件、i18n 或埋点封装
- 修改完成后没有任何验证证据，也没有说明未验证原因
- `console.log` 留存在生产代码中（应使用条件编译或日志工具）
- 硬编码 magic number 作为定时器间隔或阈值
- 无用代码/废弃组件/历史依赖未清理
- 代码中（注释除外）出现硬编码中文字符串，未走 i18n 多语言机制
- Wiki/体验评分工具暴露的低分启动项未映射到对应规则或待办
