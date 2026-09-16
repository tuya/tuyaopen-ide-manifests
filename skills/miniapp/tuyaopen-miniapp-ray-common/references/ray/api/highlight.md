# IPC 精彩时刻 (highlight)


## 视觉魔方编辑

#### aiVisualNeedCopyQuery

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

根据 stockId 查询其对应的视觉魔方是否有正在同步的配置

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `string` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 ID |

##### 返回值

类型: `Promise<AiVisualNeedCopyQueryResult>`

scenesType、visionBoxId、needCopyEvent（见 AiVisualNeedCopyQueryResult）

###### AiVisualNeedCopyQueryResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `scenesType` | `0 \| 1` | 是 | 场景类型 |
| `visionBoxId` | `number` | 否 | 视觉魔方 id（可选） |
| `needCopyEvent` | `boolean` | 是 | 是否需要同步复制事件 |

##### 示例代码

###### 请求示例

```typescript
import { aiVisualNeedCopyQuery } from '@tuya-miniapp/cloud-api';

aiVisualNeedCopyQuery({ stockId: 'stock-1', gid: '194137' })
  .then((r) => console.log(r))
  .catch(console.error);
```

###### 返回示例

```json
{ "scenesType": 0, "visionBoxId": 1, "needCopyEvent": false }
```
#### deleteAiVisualMessage

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

删除消息，用于批量删除分类消息，也可用于批量删除消息

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `msgType` | `number` | 是 | 消息类型 |
| `ids` | `string` | 否 | 待删除消息 id 列表（字符串形式） |
| `msgSrcIds` | `string` | 否 | 消息来源 id 列表 |

##### 返回值

类型: `Promise<Object>`

result、success
| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `result` | `string` | 是 |  |
| `success` | `boolean` | 是 |  |

##### 示例代码

###### 请求示例

```typescript
import { deleteAiVisualMessage } from '@tuya-miniapp/cloud-api';

deleteAiVisualMessage({ msgType: 4, ids: '1,2' })
  .then((res) => console.log(res))
  .catch(console.error);
```

###### 返回示例

```json
{ "result": "ok", "success": true }
```
#### getAiVisualBoxInfo

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

查询视觉魔方信息

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `string` | 是 | 库存 id |
| `visionBoxId` | `string` | 否 | 视觉魔方 id（可选） |
| `gid` | `string` | 是 | 家庭 gid |

##### 返回值

类型: `Promise<AiVisualBox>`

视觉魔方详情（AiVisualBox：在 AiVisualBoxInfoContent 上增加 visionBoxId、serviceStockId）

###### AiVisualBox

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `visionBoxId` | `string` | 是 | 视觉魔方 id |
| `serviceStockId` | `string` | 是 | 关联服务库存 id |
| `visionBoxName` | `string` | 是 | 视觉魔方名称 |
| `visionBoxState` | `0 \| 1` | 是 | 视觉魔方状态 |
| `generateDescState` | `0 \| 1` | 是 | 图生文开关 |
| `reportTypeList` | `"1" \\| "2"[]` | 是 | 支持的报告类型列表 |
| `reportLangType` | `string` | 是 | 报告语言类型 |
| `visionBoxEventList` | `VisionBoxEvent[]` | 是 | 视觉魔方事件列表 |
| `sceneType` | `0 \| 1` | 是 | 场景类型（安防 / 相册等） |

###### 引用对象

###### `interface` VisionBoxEvent

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `eventCode` | `string` | 是 | 事件编码 |
| `eventValue` | `string` | 是 | 事件取值 |
| `eventType` | `0 \| 1` | 是 | 事件类型（预置 / 自定义） |

###### `enum` VisionEventType

| 枚举值 | 描述 |
| --- | --- |
| `0` | 预置事件 |
| `1` | 自定义事件 |

##### 示例代码

###### 请求示例

```typescript
import { getAiVisualBoxInfo } from '@tuya-miniapp/cloud-api';

getAiVisualBoxInfo({ gid: '194137', stockId: 'stock-1', visionBoxId: 'vb-1' })
  .then((box) => console.log(box))
  .catch(console.error);
```

###### 返回示例

```json
{
  "visionBoxId": "vb-1",
  "visionBoxName": "客厅魔方",
  "serviceStockId": "stock-1",
  "visionBoxState": 1,
  "generateDescState": 0,
  "reportTypeList": [1],
  "reportLangType": "zh",
  "visionBoxEventList": [],
  "sceneType": 0
}
```
#### getAiVisualMessageKey

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

获取 ipc 业务数据密钥（用于消息图片等）

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `GetAiVisualMessageKey[]` | 是 | GetAiVisualMessageKey 对象数组 |

###### GetAiVisualMessageKey

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `businessNo` | `string` | 是 | - | 业务字段 |
| `deviceId` | `string` | 是 | - | 设备 id |
| `time` | `number` | 是 | - | 需查询数据的起始时间 |
| `homeId` | `string` | 是 | - | 家庭 id |

##### 返回值

类型: `Promise<GetAiVisualMessageKeyRes[]>`

每条含 businessNo、businessKey（见 GetAiVisualMessageKeyRes）

##### 示例代码

###### 请求示例

```typescript
import { getAiVisualMessageKey } from '@tuya-miniapp/cloud-api';

getAiVisualMessageKey([
  { businessNo: 'bn-1', deviceId: 'vdevo1', time: 1700000000000, homeId: '194137' },
])
  .then((res) => console.log(res))
  .catch(console.error);
```

###### 返回示例

```json
[{ "businessNo": "bn-1", "businessKey": "******" }]
```
#### getAiVisualReportList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

查询智能视觉魔方报告列表

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭 gid |
| `visionBoxId` | `string` | 是 | 视觉魔方 id |
| `offset` | `number` | 是 | 分页偏移量 |
| `limit` | `number` | 是 | 分页条数 |

##### 返回值

类型: `Promise<VisionBoxReport[]>`

VisionBoxReport 数组（报告类型、标题、状态等见 minituya 返回表及类型字段）

###### 引用对象

###### `enum` ReportType

| 枚举值 | 描述 |
| --- | --- |
| `1` | 日报 |
| `2` | 周报 |

###### `interface` RelatedFileList

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bucket` | `string` | 是 | 存储桶 |
| `filePath` | `string` | 是 | 文件路径 |
| `signUrl` | `string` | 是 | 签名访问地址 |
| `uuid` | `string` | 是 | 文件 uuid |

##### 示例代码

###### 请求示例

```typescript
import { getAiVisualReportList } from '@tuya-miniapp/cloud-api';

getAiVisualReportList({
  gid: '194137',
  visionBoxId: 'vb-1',
  offset: 0,
  limit: 10,
})
  .then((list) => console.log(list))
  .catch(console.error);
```

###### 返回示例

```json
[
  {
    "visionBoxId": "vb-1",
    "modelName": "model-a",
    "reportId": "r1",
    "reportType": 1,
    "reportTitleName": "日报",
    "summaryAndSuggestion": "",
    "detailTitle": "详情",
    "totalNumTitle": "事件总数",
    "reportState": 1,
    "reportStateName": "已完成"
  }
]
```
#### getMessageList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

消息列表查询

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `sourceIds` | `string[]` | 是 | 设备 id 列表 |
| `limit` | `number` | 是 | 请求数量 |
| `offset` | `number` | 是 | 请求的偏移量（分页） |

##### 返回值

类型: `Promise<GetMessageListRes>`

分页消息列表（pageNo、datas、totalCount、class）

###### GetMessageListRes

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `pageNo` | `number` | 是 | 页码 |
| `datas` | `VisionBoxMessage[]` | 是 | 视觉魔方消息数据列表 |
| `totalCount` | `number` | 是 | 总数 |
| `class` | `string` | 是 | 分类 |

###### 引用对象

###### `interface` VisionBoxMessage

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `msgTypeContent` | `string` | 是 | 消息类型内容 |
| `msgContent` | `string` | 是 | 消息内容 |
| `time` | `number` | 是 | 时间戳 |
| `msgTitle` | `string` | 是 | 消息标题 |
| `dateTime` | `string` | 是 | 日期时间字符串 |
| `attachPics` | `string` | 是 | 附件图片 |
| `id` | `number` | 是 | 消息主键 id |
| `idStr` | `string` | 是 | 消息 id 字符串形式 |
| `homeId` | `number` | 是 | 家庭 id |
| `msgSrcId` | `string` | 是 | 消息来源 id |
| `businessKey` | `string` | 是 | 业务密钥字段 |

##### 示例代码

###### 请求示例

```typescript
import { getMessageList } from '@tuya-miniapp/cloud-api';

getMessageList({ sourceIds: ['vdevo1'], limit: 20, offset: 0 })
  .then((res) => console.log(res))
  .catch(console.error);
```

###### 返回示例

```json
{
  "pageNo": 1,
  "datas": [
    {
      "msgTypeContent": "4",
      "msgContent": "{}",
      "time": 1700000000000,
      "msgTitle": "示例消息",
      "dateTime": "2024-01-01 12:00:00",
      "attachPics": "",
      "id": 1,
      "idStr": "1",
      "homeId": 194137,
      "msgSrcId": "src-1",
      "businessKey": "******"
    }
  ],
  "totalCount": 1,
  "class": "4"
}
```
#### saveAiVisualBoxInfo

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

保存视觉魔方信息

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭 gid |
| `stockId` | `string` | 是 | 库存 id |
| `visionBoxId` | `string` | 否 | 视觉魔方 id（可选） |
| `visionBoxInfoContent` | `AiVisualBoxInfoContent` | 是 | 魔方业务配置（minituya「VisionBoxInfoContent」/ 类型 AiVisualBoxInfoContent）：visionBoxName 名称；visionBoxState 启停；generateDescState 图生文；reportTypeList、reportLangType 报告类型与语言；visionBoxEventList 检测事件；sceneType 场景。与 AiVisualBox 中同名段一致；visionBoxId、serviceStockId 在顶层或其它入参中传递，故不在此对象内。 |

###### AiVisualBoxInfoContent

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `visionBoxName` | `string` | 是 | - | 视觉魔方名称 |
| `visionBoxState` | `0 \| 1` | 是 | - | 视觉魔方状态 |
| `generateDescState` | `0 \| 1` | 是 | - | 图生文开关 |
| `reportTypeList` | `"1" \\| "2"[]` | 是 | - | 支持的报告类型列表 |
| `reportLangType` | `string` | 是 | - | 报告语言类型 |
| `visionBoxEventList` | `VisionBoxEvent[]` | 是 | - | 视觉魔方事件列表 |
| `sceneType` | `0 \| 1` | 是 | - | 场景类型（安防 / 相册等） |

##### 返回值

类型: `Promise<number \| string>`

业务结果 result，类型见

###### 引用对象

###### `interface` VisionBoxEvent

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `eventCode` | `string` | 是 | 事件编码 |
| `eventValue` | `string` | 是 | 事件取值 |
| `eventType` | `0 \| 1` | 是 | 事件类型（预置 / 自定义） |

###### `enum` VisionEventType

| 枚举值 | 描述 |
| --- | --- |
| `0` | 预置事件 |
| `1` | 自定义事件 |

##### 示例代码

###### 请求示例

```typescript
import { saveAiVisualBoxInfo } from '@tuya-miniapp/cloud-api';

saveAiVisualBoxInfo({
  gid: '194137',
  stockId: 'stock-1',
  visionBoxId: 'vb-1',
  visionBoxInfoContent: {
    visionBoxName: '客厅魔方',
    visionBoxState: 1,
    generateDescState: 0,
    reportTypeList: [1],
    reportLangType: 'zh',
    visionBoxEventList: [],
    sceneType: 0,
  },
})
  .then((r) => console.log(r))
  .catch(console.error);
```

###### 返回示例

```json
1111
```

## 视觉魔方数据获取

#### getPresetEvent

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

查询智能视觉魔方列表预置事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭 gid |
| `businessType` | `"aigcProtect" \| "aiTimePhotoAlbumDetect" \| "aiSmartFreeEvent"` | 是 | 业务类型（minituya `getPresetEvent` 文档为 `eventValue`/`stockId` 等字段；与本封装字段不完全一致，以 `BusinessType` 为准） |

##### 返回值

类型: `Promise<PresetEvent[]>`

预置事件配置列表（见 PresetEvent）

##### 示例代码

###### 请求示例

```typescript
import { getPresetEvent } from '@tuya-miniapp/cloud-api';

getPresetEvent({ gid: '194137', businessType: 'aiSmartFreeEvent' })
  .then((list) => console.log(list))
  .catch(console.error);
```

###### 返回示例

```json
[
  {
    "configCode": "person",
    "configCodeIcon": "https://images.example.com/icon.png",
    "configCodeDesc": "人形检测"
  }
]
```
#### getVisualBoxList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

查询智能视觉魔方列表（关联服务）

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭 gid |

##### 返回值

类型: `Promise<VisionBoxDto[]>`

VisionBoxDto 数组

###### 引用对象

###### `enum` SceneType

| 枚举值 | 描述 |
| --- | --- |
| `0` | 安防场景 |
| `1` | 相册场景 |

##### 示例代码

###### 请求示例

```typescript
import { getVisualBoxList } from '@tuya-miniapp/cloud-api';

getVisualBoxList({ gid: '194137' })
  .then((list) => console.log(list))
  .catch(console.error);
```

###### 返回示例

```json
[
  {
    "visionBoxId": "vb-1",
    "visionBoxName": "客厅魔方",
    "gmtCreate": "2024-01-01 10:00:00",
    "serviceStockId": "stock-1",
    "serviceName": "智能视觉",
    "enableState": 1,
    "expiredTime": 1735660800000,
    "scenesType": 0
  }
]
```
#### visualBoxEventCheck

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

视觉魔方自定义语义校验

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `eventValue` | `string` | 是 | 事件语义取值 |
| `gid` | `string` | 是 | 家庭 gid |
| `stockId` | `string` | 是 | 库存 id |

##### 返回值

类型: `Promise<CustomVisionEventCheckRet>`

available 与可选 recommend

###### CustomVisionEventCheckRet

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `available` | `boolean` | 是 | 是否可用 |
| `recommend` | `string[]` | 否 | 推荐配置列表（可选） |

##### 示例代码

###### 请求示例

```typescript
import { visualBoxEventCheck } from '@tuya-miniapp/cloud-api';

visualBoxEventCheck({
  gid: '194137',
  stockId: 'stock-1',
  eventValue: '黑白猫',
})
  .then((r) => console.log(r))
  .catch(console.error);
```

###### 返回示例

```json
{ "available": true, "recommend": ["person", "pet"] }
```

## 精彩时刻

#### albumFileDelete

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

删除时光相册录像文件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `number` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 id |
| `timeAlbumId` | `number` | 是 | 相册 id |
| `albumRecordIds` | `string` | 是 | 文件 id 列表，多个使用英文逗号分隔，如 10001,10002 |

##### 返回值

类型: `Promise<IAlbumFileDeleteRes>`

删除结果

###### IAlbumFileDeleteRes

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `result` | `boolean` | 是 | 是否删除成功 |

##### 示例代码

###### 请求示例

```typescript
import { albumFileDelete } from '@tuya-miniapp/cloud-api';

albumFileDelete({
  stockId: 1,
  gid: '194137',
  timeAlbumId: 100,
  albumRecordIds: '10001,10002',
})
  .then((r) => console.log(r))
  .catch(console.error);
```

###### 返回示例

```json
{ "result": true }
```
#### albumSettingEdit

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

时光相册配置编辑 api

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `albumId` | `string` | 是 | 相册 id |
| `stockId` | `string` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 id |
| `albumName` | `string` | 是 | 相册名称 |
| `enableStatus` | `0 \| 1` | 是 | 启用状态 |
| `timedCaptureConfig` | `string[]` | 是 | 定时拍摄配置 |
| `smartCaptureConfig` | `VisionBoxEvent[]` | 是 | 智能拍摄配置 |

###### VisionBoxEvent

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `eventCode` | `string` | 是 | - | 事件编码 |
| `eventValue` | `string` | 是 | - | 事件取值 |
| `eventType` | `"0" \\| "1"` | 是 | - | 事件类型（预置 / 自定义） |

##### 返回值

类型: `Promise<boolean>`

是否编辑成功

##### 示例代码

###### 请求示例

```typescript
import { albumSettingEdit } from '@tuya-miniapp/cloud-api';

albumSettingEdit({
  albumId: 'album-1',
  stockId: '1',
  gid: '194137',
  albumName: '宝宝房',
  enableStatus: 1,
  timedCaptureConfig: ['12:00'],
  smartCaptureConfig: [{ eventCode: 'person', eventValue: '1', eventType: 0 }],
})
  .then((ok) => console.log(ok))
  .catch(console.error);
```

###### 返回示例

```json
true
```
#### albumSettingSave

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

时光相册配置保存 api

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `string` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 id |
| `albumName` | `string` | 是 | 相册名称 |
| `enableStatus` | `0 \| 1` | 是 | 启用状态 |
| `timedCaptureConfig` | `string[]` | 是 | 定时拍摄配置 |
| `smartCaptureConfig` | `VisionBoxEvent[]` | 是 | 智能拍摄配置 |

###### VisionBoxEvent

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `eventCode` | `string` | 是 | - | 事件编码 |
| `eventValue` | `string` | 是 | - | 事件取值 |
| `eventType` | `"0" \\| "1"` | 是 | - | 事件类型（预置 / 自定义） |

##### 返回值

类型: `Promise<boolean>`

是否保存成功

##### 示例代码

###### 请求示例

```typescript
import { albumSettingSave } from '@tuya-miniapp/cloud-api';

albumSettingSave({
  stockId: '1',
  gid: '194137',
  albumName: '宝宝房',
  enableStatus: 1,
  timedCaptureConfig: ['12:00'],
  smartCaptureConfig: [{ eventCode: 'person', eventValue: '1', eventType: 0 }],
})
  .then((ok) => console.log(ok))
  .catch(console.error);
```

###### 返回示例

```json
true
```
#### albumVideoDateCount

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

时光相册智能视频日期统计数据获取

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `number` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 id |
| `timeAlbumId` | `number` | 是 | 相册 id |
| `type` | `string` | 否 | 对应返回值的 type（可选） |

##### 返回值

类型: `Promise<IAlbumVideoDateCountRes[]>`

分段统计数组（type、description、startTime、endTime、coverInfo）

###### 引用对象

###### `interface` IFileUrl

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileUrl` | `string` | 是 | 文件路径 |
| `fileName` | `string` | 否 | 文件名称（自定义添加，非接口返回） |

##### 示例代码

###### 请求示例

```typescript
import { albumVideoDateCount } from '@tuya-miniapp/cloud-api';

albumVideoDateCount({ stockId: 1, gid: '194137', timeAlbumId: 100 })
  .then((rows) => console.log(rows))
  .catch(console.error);
```

###### 返回示例

```json
[
  {
    "type": "today",
    "description": "今日",
    "startTime": 1700000000000,
    "endTime": 1700086400000,
    "coverInfo": { "fileUrl": "https://images.example.com/cover.jpg" }
  }
]
```
#### albumVideoFileDetail

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

时光相册录像文件详情获取

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `number` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 id |
| `timeAlbumId` | `number` | 是 | 相册 id |
| `timeAlbumRecordId` | `number` | 是 | 时光相册文件记录 ID（来源 m.ipc.time.album.video.file.list 返回的 id） |

##### 返回值

类型: `Promise<IAlbumVideoFileList>`

单条录像详情（结构同列表项，见 IAlbumVideoFileDetailRes）

###### IAlbumVideoFileList

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | 记录主键 id |
| `captureTime` | `number` | 否 | 抓图时间（可选） |
| `type` | `0 \| 1 \| 2` | 否 | 记录类型：0-图片；1-视频；2-图片和视频（可选） |
| `coverInfo` | `IFileUrl` | 否 | 封面资源信息（可选） |
| `mediaInfo` | `IFileUrl` | 否 | 媒体资源信息（可选） |

###### IFileUrl

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `fileUrl` | `string` | 是 | - | 文件路径 |
| `fileName` | `string` | 否 | - | 文件名称（自定义添加，非接口返回） |

##### 示例代码

###### 请求示例

```typescript
import { albumVideoFileDetail } from '@tuya-miniapp/cloud-api';

albumVideoFileDetail({
  stockId: 1,
  gid: '194137',
  timeAlbumId: 100,
  timeAlbumRecordId: 10001,
})
  .then((row) => console.log(row))
  .catch(console.error);
```

###### 返回示例

```json
{
  "id": 10001,
  "captureTime": 1700000000000,
  "type": 1,
  "coverInfo": { "fileUrl": "https://images.example.com/thumb.jpg" },
  "mediaInfo": { "fileUrl": "https://videos.example.com/clip.mp4" }
}
```
#### albumVideoFileList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

时光相册录像文件列表获取

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `number` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 id |
| `timeAlbumId` | `number` | 是 | 相册 id |
| `beginTime` | `number` | 否 | 查询开始时间（可选） |
| `endTime` | `number` | 否 | 查询结束时间（可选） |
| `pageNum` | `number` | 否 | 页码（可选） |
| `pageSize` | `number` | 否 | 每页条数（可选） |
| `queryIdFlag` | `boolean` | 否 | 查询 ID 标识，默认 false；为 true 时结果集只返回 id |

##### 返回值

类型: `Promise<IAlbumVideoFileListRes>`

total 与 list

###### IAlbumVideoFileListRes

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `total` | `number` | 是 | 总条数 |
| `list` | `IAlbumVideoFileList[]` | 是 | 文件列表 |

###### 引用对象

###### `interface` IAlbumVideoFileList

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | 记录主键 id |
| `captureTime` | `number` | 否 | 抓图时间（可选） |
| `type` | `0 \| 1 \| 2` | 否 | 记录类型：0-图片；1-视频；2-图片和视频（可选） |
| `coverInfo` | `IFileUrl` | 否 | 封面资源信息（可选） |
| `mediaInfo` | `IFileUrl` | 否 | 媒体资源信息（可选） |

###### `interface` IFileUrl

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileUrl` | `string` | 是 | 文件路径 |
| `fileName` | `string` | 否 | 文件名称（自定义添加，非接口返回） |

###### `type` IFileUrl

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `fileUrl` | `string` | 是 | 文件路径 |
| `fileName` | `string` | 否 | 文件名称（自定义添加，非接口返回） |

##### 示例代码

###### 请求示例

```typescript
import { albumVideoFileList } from '@tuya-miniapp/cloud-api';

albumVideoFileList({
  stockId: 1,
  gid: '194137',
  timeAlbumId: 100,
  pageNum: 1,
  pageSize: 20,
})
  .then((res) => console.log(res))
  .catch(console.error);
```

###### 返回示例

```json
{
  "total": 1,
  "list": [
    {
      "id": 10001,
      "captureTime": 1700000000000,
      "type": 1,
      "coverInfo": { "fileUrl": "https://images.example.com/thumb.jpg" },
      "mediaInfo": { "fileUrl": "https://videos.example.com/clip.mp4" }
    }
  ]
}
```
#### getAlbumSetting

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

时光相册配置获取 api

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `stockId` | `string` | 是 | 库存 id |
| `gid` | `string` | 是 | 家庭 id |

##### 返回值

类型: `Promise<TimeAlbumSettingDto>`

相册配置（TimeAlbumSettingDto：在 TimeAlbumSettingPayload 上含主键 id；minituya 返回表排版有误，以类型为准）

###### TimeAlbumSettingDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 主键 ID |
| `albumName` | `string` | 是 | 相册名称 |
| `enableStatus` | `0 \| 1` | 是 | 启用状态 |
| `timedCaptureConfig` | `string[]` | 是 | 定时拍摄配置 |
| `smartCaptureConfig` | `VisionBoxEvent[]` | 是 | 智能拍摄配置 |

###### 引用对象

###### `interface` VisionBoxEvent

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `eventCode` | `string` | 是 | 事件编码 |
| `eventValue` | `string` | 是 | 事件取值 |
| `eventType` | `0 \| 1` | 是 | 事件类型（预置 / 自定义） |

###### `enum` VisionEventType

| 枚举值 | 描述 |
| --- | --- |
| `0` | 预置事件 |
| `1` | 自定义事件 |

##### 示例代码

###### 请求示例

```typescript
import { getAlbumSetting } from '@tuya-miniapp/cloud-api';

getAlbumSetting({ stockId: '1', gid: '194137' })
  .then((cfg) => console.log(cfg))
  .catch(console.error);
```

###### 返回示例

```json
{
  "id": "album-1",
  "albumName": "宝宝房",
  "enableStatus": 1,
  "timedCaptureConfig": ["12:00"],
  "smartCaptureConfig": [
    { "eventCode": "person", "eventValue": "1", "eventType": 0 }
  ]
}
```

## 通用接口能力

#### getStorageSecret

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

以家庭维度获取文件解密密钥

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 家庭 id |

##### 返回值

类型: `Promise<string>`

密钥信息（字符串）

##### 示例代码

###### 请求示例

```typescript
import { getStorageSecret } from '@tuya-miniapp/cloud-api';

getStorageSecret({ gid: '194137' })
  .then((secret) => console.log(secret))
  .catch(console.error);
```

###### 返回示例

```json
"base64-secret-placeholder"
```
#### getStorageSecretByDeviceId

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

以设备维度获取文件解密密钥

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 id |

##### 返回值

类型: `Promise<string>`

密钥信息（字符串）

##### 示例代码

###### 请求示例

```typescript
import { getStorageSecretByDeviceId } from '@tuya-miniapp/cloud-api';

getStorageSecretByDeviceId({ devId: 'vdevo176127325226099' })
  .then((secret) => console.log(secret))
  .catch(console.error);
```

###### 返回示例

```json
"base64-secret-placeholder"
```

## 设备服务设置

#### bindDevice

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

绑定或解绑设备

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `homeId` | `string` | 是 | 家庭 id |
| `stockId` | `string` | 是 | 库存 id |
| `bindUuidList` | `string[]` | 否 | 待绑定设备 uuid 列表（可选） |
| `unBindUuidList` | `string[]` | 否 | 待解绑设备 uuid 列表（可选） |

##### 返回值

类型: `Promise<boolean>`

布尔表示是否成功（云端封装）

##### 示例代码

###### 请求示例

```typescript
import { bindDevice } from '@tuya-miniapp/cloud-api';

bindDevice({
  homeId: '194137',
  stockId: 'stock-1',
  bindUuidList: ['vdevo1'],
})
  .then((ok) => console.log(ok))
  .catch(console.error);
```

###### 返回示例

```json
true
```
#### getCameraList

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

获取家庭摄像头设备列表

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `homeId` | `string` | 是 | 家庭 id |
| `stockId` | `string` | 否 | 库存 id（可选） |
| `pids` | `string` | 否 | 产品 id 列表（可选，文档为产品筛选条件） |
| `ownerType` | `0 \| 1` | 否 | 归属维度：0 设备级，1 账号级 |
| `serviceCode` | `string` | 否 | 服务 code（可选） |
| `commodityCode` | `string` | 否 | 商品编码（可选） |
| `categoryCode` | `string` | 是 | 业务分类 code（必填） |

##### 返回值

类型: `Promise<ResBindDeviceDto>`

totalDevices、bindDeviceNum、list（见 ResBindDeviceDto）

###### ResBindDeviceDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `totalDevices` | `number` | 是 | 设备总数 |
| `bindDeviceNum` | `number` | 是 | 已绑定设备数量 |
| `list` | `BindDeviceInfo[]` | 是 | 设备数据列表 |

###### 引用对象

###### `type` BindDeviceInfo

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isBindCurrentService` | `boolean` | 是 | 是否绑定当前服务 |

###### `interface` DeviceInfo

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `productId` | `string` | 是 | 产品 id |
| `planList` | `PlanInfoDto[]` | 否 | 设备服务计划列表 |
| `isUseFreeService` | `0 \| 1` | 是 | 是否已购买订阅首期免费商品（0-未购买、1-已购买） |
| `isUseCommonUserTrail` | `0 \| 1` | 是 | 是否购买过普通试用-账号级别免费商品（0-未购买、1-已购买） |
| `isUseCommonDeviceTrail` | `0 \| 1` | 是 | 是否购买过普通试用-设备级别免费商品（0-未购买、1-已购买） |
| `isTried` | `0 \| 1` | 否 | 是否已试用商品（0-未试用、1-已试用） |
| `hasServiceOrder` | `boolean` | 否 | 是否存在服务单 |
| `icon` | `string` | 是 | 设备图标 |
| `name` | `string` | 是 | 设备名称 |
| `ownerId` | `string` | 是 | 所属家庭 ID |
| `uuid` | `string` | 是 | 设备唯一 ID |
| `roomName` | `string` | 是 | 房间名称 |
| `deviceId` | `string` | 是 | 设备 deviceId |
| `isBind` | `1 \| 2 \| 3` | 是 | 绑定状态（已绑定 / 不支持 / 未绑定） |
| `status` | `boolean` | 是 | 设备状态 |
| `aiSmartFreeDev` | `boolean` | 是 | 当前设备是否处于 aiSmart 能力白名单中 |

###### `interface` PlanInfoDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `commodityCode` | `string` | 是 | 商品编码 |
| `commodityName` | `string` | 是 | 商品名称 |
| `env` | `number` | 是 | 环境标识 |
| `instanceId` | `string` | 是 | 实例 id（通常为设备 id） |
| `isSubscribe` | `0 \| 1` | 是 | 是否订阅商品（0 / 1） |
| `orderNo` | `number` | 是 | 排序序号 |
| `planStatus` | `1` | 是 | 套餐状态（如使用中） |
| `serviceBeginTime` | `number` | 是 | 服务开始时间 |
| `serviceEndTime` | `number` | 是 | 服务结束时间 |
| `stockId` | `string` | 是 | 库存 id |
| `isCanceled` | `0 \| 1` | 是 | 是否已退订（0 / 1） |
| `isAdditional` | `0 \| 1` | 是 | 是否加购/附加��0 / 1） |

###### `type` PlanInfoDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `commodityCode` | `string` | 是 | 商品编码 |
| `commodityName` | `string` | 是 | 商品名称 |
| `env` | `number` | 是 | 环境标识 |
| `instanceId` | `string` | 是 | 实例 id（通常为设备 id） |
| `isSubscribe` | `0 \| 1` | 是 | 是否订阅商品（0 / 1） |
| `orderNo` | `number` | 是 | 排序序号 |
| `planStatus` | `1` | 是 | 套餐状态（如使用中） |
| `serviceBeginTime` | `number` | 是 | 服务开始时间 |
| `serviceEndTime` | `number` | 是 | 服务结束时间 |
| `stockId` | `string` | 是 | 库存 id |
| `isCanceled` | `0 \| 1` | 是 | 是否已退订（0 / 1） |
| `isAdditional` | `0 \| 1` | 是 | 是否加购/附加（0 / 1） |

##### 示例代码

###### 请求示例

```typescript
import { getCameraList } from '@tuya-miniapp/cloud-api';

getCameraList({ homeId: '194137', categoryCode: 'ipc' })
  .then((res) => console.log(res))
  .catch(console.error);
```

###### 返回示例

```json
{
  "totalDevices": 1,
  "bindDeviceNum": 1,
  "list": [
    {
      "uuid": "vdevo176127325226099",
      "name": "摄像头 1",
      "online": true,
      "iconUrl": "https://images.example.com/icon.png",
      "isBindCurrentService": true
    }
  ]
}
```
#### getDeviceDetailsById

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

查看单个设备设备详情

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `homeId` | `string` | 是 | 家庭 id |
| `uuid` | `string` | 是 | 设备 uuid |
| `categoryCode` | `string` | 是 | 业务分类 code |

##### 返回值

类型: `Promise<DeviceDetails>`

设备详情（见 DeviceDetails）

###### DeviceDetails

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `haveAvailableService` | `0 \| 1` | 是 | 是否有可用服务（0 未开通、1 已开通） |
| `activeStockIdList` | `string[]` | 是 | 激活生效的服务 stockId 列表 |
| `productId` | `string` | 是 | 产品 id |
| `planList` | `PlanInfoDto[]` | 否 | 设备服务计划列表 |
| `isUseFreeService` | `0 \| 1` | 是 | 是否已购买订阅首期免费商品（0-未购买、1-已购买） |
| `isUseCommonUserTrail` | `0 \| 1` | 是 | 是否购买过普通试用-账号级别免费商品（0-未购买、1-已购买） |
| `isUseCommonDeviceTrail` | `0 \| 1` | 是 | 是否购买过普通试用-设备级别免费商品（0-未购买、1-已购买） |
| `isTried` | `0 \| 1` | 否 | 是否已试用商品（0-未试用、1-已试用） |
| `hasServiceOrder` | `boolean` | 否 | 是否存在服务单 |
| `icon` | `string` | 是 | 设备图标 |
| `name` | `string` | 是 | 设备名��� |
| `ownerId` | `string` | 是 | 所属家庭 ID |
| `uuid` | `string` | 是 | 设备唯一 ID |
| `roomName` | `string` | 是 | 房间名称 |
| `deviceId` | `string` | 是 | 设备 deviceId |
| `isBind` | `1 \| 2 \| 3` | 是 | 绑定状态（已绑定 / 不支持 / 未绑定） |
| `status` | `boolean` | 是 | 设备状态 |
| `aiSmartFreeDev` | `boolean` | 是 | 当前设备是否处于 aiSmart 能力白名单中 |

###### 引用对象

###### `interface` PlanInfoDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `commodityCode` | `string` | 是 | 商品编码 |
| `commodityName` | `string` | 是 | 商品名称 |
| `env` | `number` | 是 | 环境标识 |
| `instanceId` | `string` | 是 | 实例 id（通常为设备 id） |
| `isSubscribe` | `0 \| 1` | 是 | 是否订阅商品（0 / 1） |
| `orderNo` | `number` | 是 | 排序序号 |
| `planStatus` | `1` | 是 | 套餐状态（如使用中） |
| `serviceBeginTime` | `number` | 是 | 服务开始时间 |
| `serviceEndTime` | `number` | 是 | 服务结束时间 |
| `stockId` | `string` | 是 | 库存 id |
| `isCanceled` | `0 \| 1` | 是 | 是否已退订（0 / 1） |
| `isAdditional` | `0 \| 1` | 是 | 是否加购/附加��0 / 1） |

##### 示例代码

###### 请求示例

```typescript
import { getDeviceDetailsById } from '@tuya-miniapp/cloud-api';

getDeviceDetailsById({
  homeId: '194137',
  uuid: 'vdevo176127325226099',
  categoryCode: 'ipc',
})
  .then((detail) => {
    console.log(detail);
  })
  .catch((err) => {
    console.error(err);
  });
```

###### 返回示例

```json
{
  "uuid": "vdevo176127325226099",
  "name": "示例摄像头",
  "iconUrl": "https://images.example.com/icon.png",
  "online": true
}
```

## 设备服务信息编辑

#### customEventCheck

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

自定义事件校验

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `eventValue` | `string` | 是 | 自定义事件取值 |
| `devId` | `string` | 是 | 设备 id |
| `serviceBusinessType` | `"aiSmartFreeEvent" \| "aiSmartFreeEventImage2Text"` | 是 | 智能事件业务类型 |

##### 返回值

类型: `Promise<CustomEventCheckResult>`

available 与可选 recommend

###### CustomEventCheckResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `available` | `boolean` | 是 | 是否可用 |
| `recommend` | `string[]` | 否 | 推荐事件编码列表（可选） |

##### 示例代码

###### 请求示例

```typescript
import { customEventCheck } from '@tuya-miniapp/cloud-api';

customEventCheck({
  eventValue: '看书的人',
  devId: 'vdevo1',
  serviceBusinessType: 'aiSmartFreeEvent',
})
  .then((r) => console.log(r))
  .catch(console.error);
```

###### 返回示例

```json
{ "available": true, "recommend": ["preset_event_1"] }
```
#### getDeviceConfig

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

获取设备服务配置项

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 id |
| `serviceBusinessType` | `"aiSmartFreeEvent" \| "aiSmartFreeEventImage2Text"` | 是 | 智能事件业务类型 |

##### 返回值

类型: `Promise<GetDeviceConfigResult & Object>`

配置查询结果，并附带请求上下文中的 uuid（见实现返回类型）

###### 引用对象

###### `interface` DeviceServiceConfigItemDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `configId` | `number` | 是 | 配置项 id |
| `configCode` | `string` | 是 | 配置编码 |
| `configType` | `0 \| 1` | 是 | 配置类型（预置 / 自定义） |
| `configValue` | `string` | 是 | 配置取值 |
| `configCodeIcon` | `string` | 否 | 配置图标（可选） |
| `configState` | `0 \| 1 \| 2` | 是 | 配置状态 |

###### `enum` VisionEventType

| 枚举值 | 描述 |
| --- | --- |
| `0` | 预置事件 |
| `1` | 自定义事件 |

##### 示例代码

###### 请求示例

```typescript
import { getDeviceConfig } from '@tuya-miniapp/cloud-api';

getDeviceConfig({ devId: 'vdevo1', serviceBusinessType: 'aiSmartFreeEvent' })
  .then((r) => console.log(r))
  .catch(console.error);
```

###### 返回示例

```json
{
  "uuid": "vdevo176127325226099",
  "hadService": true,
  "switchState": 1,
  "configItemList": [
    {
      "configId": 1,
      "configCode": "cloudStorage",
      "configType": 0,
      "configValue": "1",
      "configState": 1
    }
  ]
}
```
#### getSmartEventSwitchState

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

查询智能事件开关

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 id |
| `serviceBusinessType` | `"aiSmartFreeEvent" \| "aiSmartFreeEventImage2Text"` | 是 | 智能事件业务类型 |

##### 返回值

类型: `Promise<GetSmartEventSwitchStateResult>`

hadService、switchState、extContent

###### GetSmartEventSwitchStateResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `hadService` | `boolean` | 是 | 是否已开通相关服务 |
| `switchState` | `0 \| 1` | 是 | 开关状态（0 / 1） |
| `extContent` | `string` | 是 | 扩展内容（JSON 字符串） |

##### 示例代码

###### 请求示例

```typescript
import { getSmartEventSwitchState } from '@tuya-miniapp/cloud-api';

getSmartEventSwitchState({
  devId: 'vdevo1',
  serviceBusinessType: 'aiSmartFreeEvent',
})
  .then((r) => console.log(r))
  .catch(console.error);
```

###### 返回示例

```json
{ "hadService": true, "switchState": 1, "extContent": "{}" }
```
#### updateDeviceConfig

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

设备服务配置项修改

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 id |
| `configId` | `number` | 否 | 配置项 id（可选） |
| `configCode` | `string` | 是 | 配置编码 |
| `configValue` | `string` | 否 | 配置取值（可选） |
| `configType` | `0 \| 1` | 是 | 配置类型 |
| `enableState` | `0 \| 1 \| 2` | 是 | ���用状态（与 configState 对应） |
| `serviceBusinessType` | `"aiSmartFreeEvent" \| "aiSmartFreeEventImage2Text"` | 是 | 智能事件业务类型 |

##### 返回值

类型: `Promise<number>`

更新后的 configId

##### 示例代码

###### 请求示例

```typescript
import { updateDeviceConfig } from '@tuya-miniapp/cloud-api';

updateDeviceConfig({
  devId: 'vdevo1',
  serviceBusinessType: 'aiSmartFreeEvent',
  configCode: 'person',
  configType: 0,
  enableState: 1,
})
  .then((id) => console.log(id))
  .catch(console.error);
```

###### 返回示例

```json
1
```
#### updateSmartEventSwitchState

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

更新智能事件开关

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 id |
| `switchState` | `0 \| 1` | 是 | 开关状态（0 / 1） |
| `serviceBusinessType` | `"aiSmartFreeEvent" \| "aiSmartFreeEventImage2Text"` | 是 | 智能事件业务类型 |
| `extContent` | `string` | 是 | 扩展内容（JSON 字符串） |

##### 返回值

类型: `Promise<boolean>`

是否更新成功

##### 示例代码

###### 请求示例

```typescript
import { updateSmartEventSwitchState } from '@tuya-miniapp/cloud-api';

updateSmartEventSwitchState({
  devId: 'vdevo1',
  serviceBusinessType: 'aiSmartFreeEvent',
  switchState: 1,
  extContent: '{}',
})
  .then((ok) => console.log(ok))
  .catch(console.error);
```

###### 返回示例

```json
true
```

## 服务信息详情

#### getServiceDetail

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

##### 描述

服务详情信息

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `homeId` | `string` | 是 | 家庭 id |
| `stockId` | `string` | 是 | 库存 id |

##### 返回值

类型: `Promise<ServiceDetailDto>`

服务详情（见 ServiceDetailDto，字段多于 minituya 简表处以类型为准）

###### ServiceDetailDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `subscribeId` | `string` | 否 | 订阅 ID |
| `planId` | `string` | 否 | 未来支付计划 ID |
| `instanceList` | `DeviceInfo[]` | 否 | 云存储已绑定设备列表 |
| `supportCancel` | `0 \| 1` | 否 | 是否支持退订 0 不支持; 1 支持 |
| `isPublish` | `0 \| 1` | 是 | 服务对应的商品的上架状态 |
| `additionalUuid` | `string` | 是 | 根机服务绑定的 uuid |
| `hasAigcProtectService` | `boolean` | 否 | 是否允许智能魔方能力的服务 |
| `categoryCode` | `string` | 是 | 服务大类 |
| `cloudService` | `CloudService` | 否 | 云服务绑定/用量概览（可选） |
| `cover` | `string` | 是 | 封面 |
| `commodityName` | `string` | 是 | 套餐名 |
| `stockId` | `string` | 是 | 购买库存 ID |
| `commodityCode` | `string` | 是 | 套餐编码 |
| `duration` | `number` | 是 | 服务周期 |
| `durationDesc` | `string` | 是 | 服务周期的字符串表示 |
| `serviceBeginTime` | `number` | 否 | 服务开始时间 |
| `serviceEndTime` | `number` | 否 | 服务到期时间 |
| `isSubscribe` | `0 \| 1` | 是 | 是否为订阅商品 |
| `isFuturePayments` | `0 \| 1` | 是 | 是否未来支付 |
| `isCanceled` | `0 \| 1` | 否 | 是否已退订 0 未退订; 1 已退订 |
| `stockStatus` | `1 \| 2` | 是 | 启用状态 1 未启用 2 启用中 |
| `isAdditional` | `0 \| 1` | 否 | 是否随机服务 |

###### CloudService

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `bindDeviceNum` | `number` | 是 | - | 绑定设备数量 |
| `totalDevices` | `number` | 是 | - | 总数量 |

###### 引用对象

###### `interface` DeviceInfo

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `productId` | `string` | 是 | 产品 id |
| `planList` | `PlanInfoDto[]` | 否 | 设备服务计划列表 |
| `isUseFreeService` | `0 \| 1` | 是 | 是否已购买订阅首期免费商品（0-未购买、1-已购买） |
| `isUseCommonUserTrail` | `0 \| 1` | 是 | 是否购买过普通试用-账号级别免费商品（0-未购买、1-已购买） |
| `isUseCommonDeviceTrail` | `0 \| 1` | 是 | 是否购买过普通试用-设备级别免费商品（0-未购买、1-已购买） |
| `isTried` | `0 \| 1` | 否 | 是否已试用商品（0-未试用、1-已试用） |
| `hasServiceOrder` | `boolean` | 否 | 是否存在服务单 |
| `icon` | `string` | 是 | 设备图标 |
| `name` | `string` | 是 | 设备名称 |
| `ownerId` | `string` | 是 | 所属家庭 ID |
| `uuid` | `string` | 是 | 设备唯一 ID |
| `roomName` | `string` | 是 | 房间名称 |
| `deviceId` | `string` | 是 | 设备 deviceId |
| `isBind` | `1 \| 2 \| 3` | 是 | 绑定状态（已绑定 / 不支持 / 未绑定） |
| `status` | `boolean` | 是 | 设备状态 |
| `aiSmartFreeDev` | `boolean` | 是 | 当前设备是否处于 aiSmart 能力白名单中 |

###### `interface` PlanInfoDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `commodityCode` | `string` | 是 | 商品编码 |
| `commodityName` | `string` | 是 | 商品名称 |
| `env` | `number` | 是 | 环境标识 |
| `instanceId` | `string` | 是 | 实例 id（通常为设备 id） |
| `isSubscribe` | `0 \| 1` | 是 | 是否订阅商品（0 / 1） |
| `orderNo` | `number` | 是 | 排序序号 |
| `planStatus` | `1` | 是 | 套餐状态（如使用中） |
| `serviceBeginTime` | `number` | 是 | 服务开始时间 |
| `serviceEndTime` | `number` | 是 | 服务结束时间 |
| `stockId` | `string` | 是 | 库存 id |
| `isCanceled` | `0 \| 1` | 是 | 是否已退订（0 / 1） |
| `isAdditional` | `0 \| 1` | 是 | 是否加购/附加��0 / 1） |

###### `type` PlanInfoDto

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `commodityCode` | `string` | 是 | 商品编码 |
| `commodityName` | `string` | 是 | 商品名称 |
| `env` | `number` | 是 | 环境标识 |
| `instanceId` | `string` | 是 | 实例 id（通常为设备 id） |
| `isSubscribe` | `0 \| 1` | 是 | 是否订阅商品（0 / 1） |
| `orderNo` | `number` | 是 | 排序序号 |
| `planStatus` | `1` | 是 | 套餐状态（如使用中） |
| `serviceBeginTime` | `number` | 是 | 服务开始时间 |
| `serviceEndTime` | `number` | 是 | 服务结束时间 |
| `stockId` | `string` | 是 | 库存 id |
| `isCanceled` | `0 \| 1` | 是 | 是否已退订（0 / 1） |
| `isAdditional` | `0 \| 1` | 是 | 是否加购/附加（0 / 1） |

##### 示例代码

###### 请求示例

```typescript
import { getServiceDetail } from '@tuya-miniapp/cloud-api';

getServiceDetail({ homeId: '194137', stockId: 'stock-1' })
  .then((d) => console.log(d))
  .catch(console.error);
```

###### 返回示例

```json
{
  "cover": "https://images.example.com/cover.jpg",
  "commodityName": "云存储月包",
  "stockId": "stock-1",
  "commodityCode": "CLOUD_30D",
  "duration": 30,
  "durationDesc": "30 天",
  "stockStatus": 2,
  "isSubscribe": 1,
  "isFuturePayments": 0,
  "additionalUuid": "uuid-root",
  "categoryCode": "ipc",
  "isPublish": 1,
  "cloudService": { "bindDeviceNum": 1, "totalDevices": 2 }
}
```
