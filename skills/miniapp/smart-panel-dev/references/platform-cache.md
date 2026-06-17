# 项目本地缓存：`.tuyaopen/platform/`

每个 Tuya 项目根目录下都有 `.tuyaopen/platform/` 一个目录，IDE 通过
**tuya-devplat-cli** 把云端产品和面板信息拉到本地，方便离线参考。每个 PID
对应一对 json：

```
.tuyaopen/platform/
├── product-<pid>.json   ← 产品详情 + DP schema（云端）
└── panel-<pid>.json     ← 面板绑定信息 + 可绑小程序列表 + 面板 DP 清单
```

**做面板开发时优先从这里读取产品/绑定/DP 上下文**，再跟用户对齐——别凭空猜
PID、面板名、绑定状态。

## `product-<pid>.json`

| 顶层字段 | 含义 |
|---|---|
| `pid` | 产品 ID（跟文件名后缀一致） |
| `source` | 数据来源，永远是 `tuya-devplat-cli` |
| `fetchedAt` | 最后一次拉取时间（ISO 8601） |
| `detail.data` | 产品详情（名称、品类、能力、外观图等） |
| `dpSchema.data` | **云端 DP schema**（功能点定义，编码 / 名称 / 类型 / 取值范围） |

> 注意：`src/devices/schema.ts` 是 IDE 由 `dpSchema.data` 生成的 **TypeScript 类型**真值源，
> 而 `product-<pid>.json.dpSchema.data` 是 **JSON 原始数据**——
> 想知道某 DP 的 enum 取值、是否只读、单位等元信息，看这里。

## `panel-<pid>.json`

| 顶层字段 | 含义 |
|---|---|
| `boundPanel.data` | **当前已绑面板的元数据**（最关键，多数场景从这里读起） |
| `batopPanelList` | 用户名下可绑的**小程序面板列表**（来自 Batop API） |
| `panelList.data.dataList` | 平台官方面板候选清单（公版/自定义/定制） |
| `productPanelList.data` | 面板分组及计数（公版 14 / 自定义 5 / 定制 0 ...） |
| `panelDpList.data` | 面板**实际声明用到**的 DP 列表（开发权限校验） |
| `panelInfo.data` | 面板基本信息（缓存的详情副本） |
| `deviceId` | 调试用虚拟设备 ID（如果创建过） |

### `boundPanel.data` 重点字段

| 字段 | 含义 |
|---|---|
| `panelId` | 面板 ID（`000003aask` 这种官方编码） |
| `bizId` | 业务 ID，对应 miniapp 的 `miniProgramId` |
| `name` | 面板显示名（如「三路开关面板」） |
| `productId` | 产品 ID（= `pid`） |
| `uiId` | UI 标识 |
| `url` | 面板预览 URL |
| `type` | 面板类型（`smart` / `app` 等） |
| `isDevelopUi` | 是否是开发中的 UI |
| `clientType` | 客户端类型代号 |
| `enableEdit` / `enableReplace` | 是否允许编辑 / 替换 |
| `sdkUIPublishPhase` | SDK UI 发布阶段 |

### `batopPanelList[i]`（每个候选小程序）

```json
{
  "miniProgramId": "tyhox7acccxgnwcgkw",   // 小程序唯一 ID（= bizId）
  "name": "三路开关面板",                   // 小程序显示名
  "productId": "",                          // 关联产品（可能空）
  "type": "app"                             // app / smart-mini / ...
}
```

## 怎么用

- **新接手项目** → 先 `ls .tuyaopen/platform/`，看有几个 PID、哪个是当前项目，立即对齐
- **写 DP 相关代码前** → 翻 `product-<pid>.json.dpSchema.data` 拿到准确的 DP 定义；
  本地 `src/devices/schema.ts` 缺东西时 cross-check 这里
- **小程序绑定相关需求** → 读 `panel-<pid>.json.boundPanel.data` 看当前绑了什么，
  读 `batopPanelList` 看可选项
- **怀疑数据过期** → 看 `fetchedAt`，让用户在 IDE 里"刷新产品信息"
  （IDE 触发 `tuya-devplat-cli` 重拉）
- **PID 找不到时** → 检查 `<project>/tuya.project.json` 或
  `<project>/source/miniapp/project.tuya.json`，里面的 `productId` 字段决定项目用哪个 PID

## 红线

- 不要直接改这两个文件——它们是 CLI 同步出来的，下次刷新会被覆盖
- 不要在面板代码里硬编码 `panelId` / `bizId`——这些是绑定关系的副产品，运行时由 SDK 自动注入

## 快速诊断「这是不是 Ray 面板项目」（30 秒）

```bash
# 必有这两个文件：
ls project.tuya.json src/devices/schema.ts

# 必有 Ray 工具链：
cat package.json | grep -E '@ray-js/(ray|panel-sdk|cli)'
```

如果以上任一缺失 → **不是 Ray 面板小程序**，本 skill 不适用。

> `dp.config.json` 在旧版模板中存在，新模板已移除。
> `src/devices/schema.ts` 是 IDE 直接生成的 DP 唯一来源。
