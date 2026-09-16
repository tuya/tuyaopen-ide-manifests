# Capability: Cloud Config

云端设备属性存储 API。面板侧所有持久化配置（预设、DIY 场景索引等）**必须**走本封装，**严禁**直接调用 `@ray-js/ray` 的 `getDeviceProperty` / `setDeviceProperty`。

> 模板中不一定自带这两份文件，按本文档在项目中创建即可。

## Knowledge

### 封装两层结构

```
src/api/cloudConfig.ts      ← 业务层：saveCloudConfig / getCloudConfig（对外）
src/api/devProperty.ts      ← 底层：saveDevPropertyByCode / getDevPropertyByCode（对 @ray-js/ray 的封装）
```

两者关系：`cloudConfig` 只负责"**业务语义 + 类型**"，序列化/设备 ID 解析交给 `devProperty`。

### 参考实现：`src/api/devProperty.ts`（底层，必须先创建）

```ts
import { getDevProperty, saveDevProperty } from '@ray-js/ray';
import { getDevInfo } from '@/devices';

type DevPropertyItem = {
  code?: string;
  value?: unknown;
};

const getBiz = () => {
  const { devId } = (getDevInfo() || {}) as { devId?: string };
  if (!devId) throw new Error('Missing devId');
  return { devId, bizType: 0 as const };
};

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const getDevPropertyByCode = async <T>(code: string): Promise<T | undefined> => {
  const { devId, bizType } = getBiz();
  const response = await getDevProperty({ devId, bizType, code } as any);
  const list = (response as DevPropertyItem[]) || [];
  const item = list.find(i => i?.code === code);
  if (!item) return undefined;
  const parsed = typeof item.value === 'string' ? safeJsonParse(item.value) : item.value;
  return parsed as T | undefined;
};

export const saveDevPropertyByCode = async (code: string, value: unknown): Promise<void> => {
  const { devId, bizType } = getBiz();
  const propertyList = JSON.stringify([{ code, value: JSON.stringify(value) }]);
  await saveDevProperty({ devId, bizType, propertyList } as any);
};
```

### 参考实现：`src/api/cloudConfig.ts`（业务层）

```ts
import { getDevPropertyByCode, saveDevPropertyByCode } from './devProperty';

/**
 * 保存配置（自动 JSON 序列化）
 */
export const saveCloudConfig = async (code: string, data: unknown): Promise<void> => {
  await saveDevPropertyByCode(code, data);
};

/**
 * 按 code 获取单个设备属性数据（自动 JSON 反序列化）
 * 若 code 为空或为 'rhythm_choose_mode'，返回 undefined
 */
export const getCloudConfig = <T = unknown>(code: string): Promise<T | undefined> => {
  if (!code || code === 'rhythm_choose_mode') {
    return Promise.resolve(undefined);
  }
  return getDevPropertyByCode<T>(code);
};
```

### 使用方式

```ts
import { saveCloudConfig, getCloudConfig } from '@/api/cloudConfig';

type HSV = { h: number; s: number; v: number };

// 写入（自动 JSON.stringify）
await saveCloudConfig('colourPresets', [
  { h: 0, s: 1000, v: 1000 },
  { h: 120, s: 1000, v: 1000 },
] satisfies HSV[]);

// 读取（自动 JSON.parse）
const presets = (await getCloudConfig<HSV[]>('colourPresets')) ?? [];
```

### 常用存储 code

| code                   | 说明                         | 品类 |
| ---------------------- | ---------------------------- | ---- |
| `colourPresets`        | 彩光预设列表（HSV 数组）     | 照明 |
| `whitePresets`         | 白光预设列表（亮度色温数组） | 照明 |
| `cloudDiyScenes`       | DIY 场景索引                 | 照明 |
| `cloudDiyScenes_${id}` | DIY 场景单条数据             | 照明 |

## Constraints

- **Must**: 数据会自动 JSON 序列化/反序列化，业务层直接传/拿对象即可。
- **Must**: 底层使用 `getDevProperty` / `saveDevProperty` from `@ray-js/ray`。
- **Must**: 先创建 `src/api/devProperty.ts`，再创建 `src/api/cloudConfig.ts`；DIY 场景也复用同一个 `devProperty.ts`（详见 `diy-scenes-api.md`）。
- **Must not**: **直接**从 `@ray-js/ray` 引入 `getDeviceProperty` / `setDeviceProperty` 来读写云端持久化属性（是另一套 KV API，与 `devProperty` 不互通；若硬用会出现字段不一致、DIY 场景失效等问题）。
- **Must not**: 对 `@ray-js/ray` 使用 default import（`import ty from '@ray-js/ray'` 会构建失败，没有 default export）。
- **Must not**: 直接调用底层 ATOP API；统一走本模块封装。
