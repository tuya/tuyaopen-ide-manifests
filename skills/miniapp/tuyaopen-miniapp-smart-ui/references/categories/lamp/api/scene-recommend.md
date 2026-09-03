# Capability: Scene Recommend

云端推荐场景库数据拉取与归一化。

> 模板中不一定自带此文件，需要按以下参考实现在项目中创建。

## Knowledge

### 底层 API

使用 `@ray-js/ray` 的 Light Libraries API：

1. `getLightLibrariesDataTypes` — 获取场景库数据类型
2. `checkLightLibrariesVersionsUpgradable` — 检查是否可升级
3. `upgradeToLatestLightLibrariesVersions` — 升级到最新版本
4. `getLightLibrariesData` — 拉取场景数据

### 参考实现：`src/api/getSceneData.ts`

```ts
import {
  checkLightLibrariesVersionsUpgradable,
  getLightLibrariesData,
  getLightLibrariesDataTypes,
  upgradeToLatestLightLibrariesVersions,
} from '@ray-js/ray';

// --- 类型定义 ---

export interface CloudScene {
  dpCode: string;
  sceneId: number;
  sceneName: string;
  sceneData: string;
  plateId?: number;
  plateRosettaKey?: string;
  sceneIconDisplayType?: number | string;
  sort?: number;
  lightNums?: number[];
  sceneDesc?: string;
  sceneIconDisplaySize?: string;
  sceneNameRosettaKey?: string;
  selectCellBackground?: string;
}

export interface CloudScenePlate {
  plateId: number;
  plateName?: string;
  plateIcon?: string;
  plateIconDisplayType?: number;
  plateIconDisplaySize?: string;
  plateRosettaKey?: string;
  scenes: CloudScene[];
}

export interface CloudSceneData {
  scenes: CloudScene[]; // 扁平场景列表（已排序）
  plates: CloudScenePlate[]; // 按板块分组
}

export type LightLibraryDataType = 0 | 1 | 2;

// --- 内部工具 ---

type DevInfoLike = { groupId?: string; devId?: string };
const SCENE_LIBRARY_TYPE = 'SCENE_LIB' as const;

function toSafeNumber(v: unknown): number | undefined {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}

function getLightBizInfo(devInfo: DevInfoLike) {
  const bizId = devInfo?.groupId || devInfo?.devId;
  if (!bizId) throw new Error('Missing bizId');
  return { bizId, bizType: 0 as const };
}

function getLibraryBasePayload(devInfo: DevInfoLike) {
  return { ...getLightBizInfo(devInfo), libType: SCENE_LIBRARY_TYPE };
}

// --- 归一化 ---

interface CloudSceneApiItem {
  dpCode: string;
  sceneId: number;
  sceneName: string;
  sceneData: string;
  plateId?: number;
  plateRosettaKey?: string;
  sceneIconDisplayType?: number | string;
  sort?: number;
  lightNums?: number[];
  sceneDesc?: string;
  sceneIconDisplaySize?: string;
  sceneNameRosettaKey?: string;
  selectCellBackground?: string;
  [k: string]: unknown;
}

function isCloudSceneApiItem(item: unknown): item is CloudSceneApiItem {
  if (!item || typeof item !== 'object') return false;
  const m = item as any;
  return (
    typeof m.dpCode === 'string' &&
    typeof m.sceneName === 'string' &&
    typeof m.sceneData === 'string' &&
    typeof m.sceneId === 'number'
  );
}

function sortScene(a: any, b: any) {
  const sa = toSafeNumber(a?.sort) ?? 0,
    sb = toSafeNumber(b?.sort) ?? 0;
  if (sa !== sb) return sa - sb;
  const pa = toSafeNumber(a?.plateId) ?? 0,
    pb = toSafeNumber(b?.plateId) ?? 0;
  if (pa !== pb) return pa - pb;
  return (toSafeNumber(a?.sceneId) ?? 0) - (toSafeNumber(b?.sceneId) ?? 0);
}

export function normalizeCloudSceneData(rawInput: unknown): CloudSceneData {
  const raw = Array.isArray(rawInput) ? rawInput : [];
  const all: CloudSceneApiItem[] = [];
  const plateMeta: Record<string, any> = {};

  raw.forEach(plate => {
    const plateId = toSafeNumber(plate?.plateId);
    if (plateId)
      plateMeta[String(plateId)] = {
        plateName: plate?.plateName,
        plateIcon: plate?.plateIcon,
        plateIconDisplayType: plate?.plateIconDisplayType,
        plateIconDisplaySize: plate?.plateIconDisplaySize,
      };
    (Array.isArray(plate?.data) ? plate.data : []).forEach((group: any) => {
      const list = (Array.isArray(group?.items) ? group.items : [])
        .filter(Boolean)
        .map((it: any) => ({
          ...it,
          plateId: plateId ?? it.plateId,
          sceneIconDisplayType: it.sceneIconDisplayType ?? group?.iconDisplayType,
          sceneIconDisplaySize: it.sceneIconDisplaySize ?? group?.iconDisplaySize,
        }))
        .filter(isCloudSceneApiItem)
        .sort(sortScene);
      all.push(...list);
    });
  });

  const scenes: CloudScene[] = all.sort(sortScene).map(it => ({
    dpCode: it.dpCode,
    sceneId: it.sceneId,
    sceneName: it.sceneName,
    sceneData: it.sceneData,
    plateId: it.plateId,
    plateRosettaKey: it.plateRosettaKey,
    sceneIconDisplayType: it.sceneIconDisplayType,
    sort: it.sort,
    lightNums: it.lightNums,
    sceneDesc: it.sceneDesc,
    sceneIconDisplaySize: it.sceneIconDisplaySize,
    sceneNameRosettaKey: it.sceneNameRosettaKey,
    selectCellBackground: it.selectCellBackground,
  }));

  const plateTmp: Record<string, any> = {};
  scenes.forEach(sc => {
    const pid = toSafeNumber(sc.plateId);
    if (!pid) return;
    const k = String(pid);
    if (!plateTmp[k])
      plateTmp[k] = {
        plateId: pid,
        plateRosettaKey: sc.plateRosettaKey,
        scenes: [],
        sort: Infinity,
      };
    plateTmp[k].scenes.push(sc);
    const s = toSafeNumber(sc.sort) ?? 0;
    if (s < plateTmp[k].sort) plateTmp[k].sort = s;
  });

  const plates: CloudScenePlate[] = Object.values(plateTmp)
    .map((p: any) => ({
      plateId: p.plateId,
      plateName: plateMeta[String(p.plateId)]?.plateName,
      plateIcon: plateMeta[String(p.plateId)]?.plateIcon,
      plateIconDisplayType: plateMeta[String(p.plateId)]?.plateIconDisplayType,
      plateIconDisplaySize: plateMeta[String(p.plateId)]?.plateIconDisplaySize,
      plateRosettaKey: p.plateRosettaKey,
      scenes: p.scenes.sort(sortScene),
      sort: p.sort,
    }))
    .sort((a: any, b: any) => (a.sort !== b.sort ? a.sort - b.sort : a.plateId - b.plateId))
    .map(({ sort, ...rest }: any) => rest);

  return { scenes, plates };
}

// --- 对外接口 ---

export const getSceneData = async (
  devInfo: DevInfoLike,
  options?: { libDataType?: LightLibraryDataType; autoUpgrade?: boolean }
): Promise<CloudSceneData> => {
  const { libDataType = 0, autoUpgrade = true } = options || {};
  const base = { ...getLibraryBasePayload(devInfo), libDataType };

  if (autoUpgrade) {
    try {
      const upgradable = await checkLightLibrariesVersionsUpgradable(base as any);
      if (upgradable) await upgradeToLatestLightLibrariesVersions(base as any);
    } catch {
      /* 升级失败不阻塞拉取 */
    }
  }

  const raw = await getLightLibrariesData(base as any);
  return normalizeCloudSceneData(raw);
};
```

### 使用方式

```ts
import { getSceneData } from '@/api/getSceneData';
import { getDevInfo } from '@/devices';

const devInfo = getDevInfo();
const { scenes, plates } = await getSceneData(devInfo);
// scenes: CloudScene[]  — 扁平场景列表（已排序）
// plates: CloudScenePlate[]  — 按板块分组的场景
```

**options**:

- `libDataType`: 场景库数据类型（默认 `0`）
- `autoUpgrade`: 是否自动升级到最新版本（默认 `true`）

## Constraints

- **Must**: 推荐场景数据必须来自本 API，**前端不得伪造场景数据作为兜底**
- **Must**: 推荐只展示前八个
- **Must**: 若拉取为空或失败，按对应语言展示空态/引导，并提供「重试/刷新」入口
- **Must not**: 直接调用底层 Light Libraries API，使用 `getSceneData()` 封装
