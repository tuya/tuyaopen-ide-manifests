# 天文定时（日出 / 日落）—— 通过 `@ray-js/ray`

天文定时**不属于** `@ray-js/electrician-timing-sdk`。没有 `electri.astronomical`，`addDpTimer` 也不能替代。请使用 `@ray-js/ray` 的专用天文 API，并完全在业务代码中维护 CRUD / 状态（通常是宿主工程的 Redux slice + utils 模块）。

本文档是这条路径的权威 API 参考，被 skill 主入口与可移植片段索引引用。

## 1. API 一览

全部从 `@ray-js/ray` 导入，返回 Promise。

| API | 用途 | 返回 |
|-----|------|------|
| `addAstronomical` | 新建日出 / 日落定时 | 新定时 `id`（Number） |
| `getAstronomicalList` | 列出某设备 / 群组的全部天文定时 | 定时记录数组 |
| `updateAstronomical` | 按 `id` 修改定时 | Boolean 成功标志 |
| `updateAstronomicalStatus` | 启用 / 停用定时 | Boolean 成功标志 |
| `removeAstronomical` | 按 `id` 删除定时 | Boolean 成功标志 |

没有 `onCloudUpdate` 对应的推送 / 订阅。任何修改后通过 `getAstronomicalList` 重新拉取。

## 2. 共用参数语义（add / update 通用，读一次即可）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `bizId` | `string` | 是 | 设备 ID 或群组 ID（对应宿主 URL query 的 `deviceId` / `groupId`）。 |
| `bizType` | `number` | 是 | `0` 单设备，`1` 群组。 |
| `astronomicalType` | `number` | 是 | `0` 日出，`1` 日落。 |
| `loops` | `string` | 是 | 7 位字符串位图 `"Mon..Sun"`，如 `"1111111"` 每天、`"0111110"` 工作日。约定与 SDK `week` 数组一致，但此处编码为字符串。 |
| `dps` | `object`（或 JSON 字符串） | 是 | DP 载荷。API 文档标注 `string`，但示例传对象字面量（如 `{ 1: true }`）。在 TS 中优先用对象，平台会自动序列化。 |
| `timezone` | `string` | 是 | IANA 偏移格式，如 `"+08:00"`。 |
| `time` | `string` | 是 | 相对天文时刻的偏移，`"HH:mm"` 24 小时制。方向由 `offsetType` 决定。 |
| `offsetType` | `number` | 是 | `-1` 早于日出 / 日落，`0` 同时，`1` 晚于。 |
| `lon` | `number` | 是 | 经度。 |
| `lat` | `number` | 是 | 纬度。 |
| `date` | `string` | 否 | 可选 `yyyyMMdd`；省略表示「按 `loops` 重复」。 |

### 调用方需注意

- **`id` 类型漂移**：文档把 `id` 在 `updateAstronomical` 列为 `Long`，但 `removeAstronomical` 表格写 `String`，`updateAstronomicalStatus` 示例使用 `'8642566'` 字符串。以 `addAstronomical` 返回的形态为基准，原样回传。持久化时按数字保留。
- **列表响应 `dps` 是字符串**，不是对象 —— `getAstronomicalList` 将 DP 序列化为 JSON 字符串（如 `"{\"1\":true}"`）。入站时需解析。
- **`nextSunRise` / `nextSunSet`**：列表响应中的展示辅助字段由云端计算；客户端不要自行推导。
- **`status` 取值**：列表响应中 `status` 可能为 `2`，表示*失效 / 软删除*。UI 不应展示 `2`。

## 3. 典型调用顺序（宿主 app）

1. 页面挂载（或 Redux slice 水合）时调 `getAstronomicalList({ bizId })`。
2. 用户编辑 → 用完整参数对象调 `addAstronomical` 或 `updateAstronomical`。
3. 切换启用 → `updateAstronomicalStatus({ id, status: 0 | 1 })`。
4. 删除 → `removeAstronomical({ id })`。
5. 修改后用 `getAstronomicalList` 重新拉取，保持权威。

`@ray-js/electrician-timing-sdk` 的 `init` / `changeConfig` / `destroy` 生命周期**独立**：天文无需 `init`，也不受 `destroy` 影响。

## 4. 可移植 helper（TypeScript）

可直接放入宿主工程（常见路径 `src/utils/astronomical.ts`）或改造为 Redux slice。参数形态与 API 文档保持一致，并对列表响应做规范化。

```ts
import {
  addAstronomical,
  getAstronomicalList,
  removeAstronomical,
  updateAstronomical,
  updateAstronomicalStatus,
} from '@ray-js/ray';

export type AstronomicalType = 0 | 1; // 0 sunrise, 1 sunset
export type OffsetType = -1 | 0 | 1;
export type BizType = 0 | 1; // 0 device, 1 group

export interface AstronomicalDraft {
  bizId: string;
  bizType: BizType;
  astronomicalType: AstronomicalType;
  loops: string; // 7-char bitmap, Mon..Sun
  dps: Record<string, unknown>;
  timezone: string; // e.g. "+08:00"
  time: string; // offset "HH:mm"
  offsetType: OffsetType;
  lon: number;
  lat: number;
  date?: string; // optional yyyyMMdd
}

export interface AstronomicalRecord extends AstronomicalDraft {
  id: number;
  status: 0 | 1 | 2;
  nextSunRise?: string;
  nextSunSet?: string;
}

export async function listAstronomical(bizId: string): Promise<AstronomicalRecord[]> {
  const raw = await getAstronomicalList({ bizId });
  return (raw ?? []).map((r: any) => ({
    ...r,
    dps: typeof r.dps === 'string' ? safeParseJson(r.dps) : r.dps,
  })) as AstronomicalRecord[];
}

export async function createAstronomical(draft: AstronomicalDraft): Promise<number> {
  return await addAstronomical(draft as any);
}

export async function modifyAstronomical(id: number, draft: AstronomicalDraft): Promise<boolean> {
  return await updateAstronomical({ id, ...draft } as any);
}

export async function toggleAstronomical(id: number, enabled: boolean): Promise<boolean> {
  return await updateAstronomicalStatus({ id: String(id), status: enabled ? 1 : 0 });
}

export async function deleteAstronomical(id: number): Promise<boolean> {
  return await removeAstronomical({ id: String(id) });
}

function safeParseJson(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return {};
  }
}
```

## 5. 与电工定时宿主的集成

天文与本 SDK 正交，但与其共享入口侧基建：

- **入口能力开关**：宿主 URL query 使用 `supportAstronomical=y|n`（见 `docs/integration-guide.md` §1）。建议在存在 `groupId` 时强制**关闭** —— 群组通常无逐设备坐标，天文默认禁用。
- **页面路径**：天文页面落地到 `src/pages/astronomical/`。状态管理与工具函数按工程惯例放置即可，无强制结构。
- **无 `ConflictPopup`**：这些 API 不接收 `useDefaultModal`，也不会触发 SDK 的冲突流程。**不要**在天文页面挂载 `@ray-js/electrician-timing-sdk` 的 `ConflictPopup`；若天文需要自身冲突语义，请在业务代码中处理。
- **在线提示**：仍可用 SDK 的 `isLANOnline` / `isLocalOnline` 控制 UI 文案（如「离线 —— 无法编辑」），它们是通用连通性 helper，并非定时专属。

## 6. 给用户的提示 / 避坑

- **不要**调用 `electri.astronomical.*` —— `@ray-js/electrician-timing-sdk` 中无此命名空间。
- **不要**用 `addDpTimer` 实现天文：它面向无日出 / 日落语义的自定义 DP 定时，无法解析地理日出日落。
- **不要**依赖 `@ray-js/electrician-timing-sdk` 的 `init` / `changeConfig` 来「拉起」天文 —— 天文 API 自成体系。
