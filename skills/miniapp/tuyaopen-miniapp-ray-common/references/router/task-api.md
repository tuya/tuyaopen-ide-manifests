# Ray API / 设备能力路线卡

## 什么时候进入

- 用户要调用 Ray API、设备能力、上传下载、连接通信、监听事件、路由接口
- 用户直接提到 API 名、能力名、设备链路或功能模块名

## 推荐路径

1. 先读 `references/ray/INDEX.md`，在 `Section = api` 的行里用 Key / Title 锁定能力面（如 `p2p`、`device-connect`）
2. 进入 `references/ray/api/<key>/`，在该目录（及子目录）内按文件名定位目标 API 文档
3. 命中后只读 1～2 个具体 `*.md` / `*.mdx`

## 常见子区

- 路由：`route`、`navigate`
- 网络：`network`
- 文件：`file`
- 设备信息：`device-info`
- 设备连接：`device-connect`
- 蓝牙：`bluetooth`
- P2P：`p2p`
- AI：`ai`

## 处理原则

- 优先用目录与描述缩小范围，再读取具体文档
- 不要直接扫整个 `references/ray/api/`
- 若用户给的是精确 API 名，仍先用 `INDEX.md` 锁定 `api/<key>/`，再在目录内查文件名

## 没命中时怎么办

- 明确说明“未在文档中找到”
- 可以给出保守替代路径，例如建议检查相邻能力目录
- 不要补全不存在的参数、返回值、回调字段

## 离开前检查

- API 名称、参数、返回值、事件是否都来自当前读取文档
- 是否误用了 `wx.*`、`my.*`
- 是否需要补读 `references/rules/output-contract.md`
