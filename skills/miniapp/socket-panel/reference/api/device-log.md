# Capability: Device Log

设备 DP 操作日志查询，用于展示设备历史操作记录。

> 模板中不一定自带此文件，需要按以下参考实现在项目中创建。

## Knowledge

### 参考实现：`src/api/device.ts`

```ts
import { getLaunchOptionsSync, getDpReportLog, resetStatistics } from '@ray-js/ray';

export const getDpOperateLog = (dpIds: number[], offset = 0, limit = 50) => {
  const { deviceId } = getLaunchOptionsSync().query;
  return getDpReportLog({
    devId: deviceId,
    dpIds: dpIds.join(','),
    offset,
    limit,
  });
};

export const clearDeviceData = () => {
  const { deviceId } = getLaunchOptionsSync().query;
  return resetStatistics({ devId: deviceId });
};
```

### 使用方式

```ts
import { getDpOperateLog, clearDeviceData } from '@/api/device';

// 查询日志（dpId 列表, 偏移, 每页条数）
const logs = await getDpOperateLog([1, 26], 0, 50);
// logs: { total, hasNext, dps: IOperateLog[] }

// 清除统计数据
await clearDeviceData();
```

### 值转换规则

**switch_1（dp_id=1）**：

```ts
const enumValue = log.value === 'true' ? 'on' : 'off';
const text = Strings.getDpLang(idCodes[log.dpId], enumValue);
```

**fault（dp_id=26）**：

```ts
const faultValue = Number(log.value);
const binary = faultValue.toString(2);
// 按位匹配枚举值
```

### 展示规则

- `timeStamp` 为**秒级时间戳**，展示时需 `new Date(timeStamp * 1000)`
- DP 名称通过 `useDevInfo().idCodes` 映射获取

## Constraints

- **Must**: `timeStamp` 为秒级，展示时 `* 1000`
- **Must**: `switch_1` 的 `"true"` → `"on"`、`"false"` → `"off"` 再获取多语言
- **Must**: `fault` bitmap 按二进制位解析
- **Must**: 通过 `idCodes[dpId]` 获取 dpCode，不硬编码
