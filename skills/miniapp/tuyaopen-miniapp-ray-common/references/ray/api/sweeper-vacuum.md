# 扫地机 (sweeper-vacuum)


## 激光扫地机

#### 获取清扫记录列表

`getCleaningRecords`

**引入**

> `@ray-js/ray^1.5.36` 且 基础库版 `2.21.0` 以上版本可使用

```js
import { getCleaningRecords } from '@ray-js/ray';
```

**参数**

**GetCleaningRecordsParams**

获取清扫记录列表查询条件。

**参数属性 GetRecipeCollectionListParams**

| 属性      | 类型     | 默认值 | 必填 | 说明               |
| --------- | -------- | ------ | ---- | ------------------ |
| devId     | `string` |        | 是   | 设备Id             |
| startTime | `string` |        | 是   | 开始时间           |
| endTime   | `string` |        | 是   | 结束时间           |
| limit     | `number` |        | 是   | 返回的数据长度限制 |
| offset    | `number` |        | 是   | 偏移量             |
| fileType  | `number` |        | 否   | 默认'pic'          |

**返回**

**GetCleaningRecordsResponse**

获取清扫记录列表返回值。

| 属性       | 类型               | 说明           |
| ---------- | ------------------ | -------------- |
| datas      | `CleaningRecord[]` | 清扫记录列表   |
| totalCount | `number`           | 清扫记录总长度 |

**CleaningRecord**

| 属性     | 类型     | 说明                     |
| -------- | -------- | ------------------------ |
| id       | `number` | 清扫记录的唯一ID         |
| time     | `number` | 清扫时间                 |
| file     | `string` | 清扫记录文件地址         |
| bucket   | `string` | 清扫记录文件所在的bucket |
| extend   | `string` | 清扫信息                 |
| devId    | `string` | 设备Id                   |
| fileType | `string` | 文件类型                 |

**函数定义示例**

```typescript
/**
 * 获取清扫记录列表
 * @param {GetCleaningRecordsParams} params - 获取清扫记录列表请求参数
 * @returns {Promise<GetCleaningRecordsResponse>} - 获取清扫记录列表响应的 Promise 对象
 */
export const getCleaningRecords: (
  params: GetCleaningRecordsParams
) => Promise<GetCleaningRecordsResponse>;
```

---

#### 删除清扫记录

`deleteCleaningRecord`

**引入**

> `@ray-js/ray^1.5.36` 且基础库版本 `2.21.0` 以上版本可使用

```js
import { deleteCleaningRecord } from '@ray-js/ray';
```

**参数**

**DeleteCleaningRecordParams**

删除清扫记录的请求参数。

| 属性    | 类型       | 默认值 | 必填 | 说明                 |
| ------- | ---------- | ------ | ---- | -------------------- |
| devId   | `string`   |        | 是   | 设备 Id              |
| fileIds | `number[]` |        | 是   | 要删除的记录 Id 数组 |

**返回**

**DeleteCleaningRecordResponse**

删除清扫记录的响应值，表示删除操作是否成功。

| 类型      | 说明             |
| --------- | ---------------- |
| `boolean` | 删除操作是否成功 |

**函数定义示例**

```typescript
/**
 * 删除清扫记录
 * @param {DeleteCleaningRecordParams} params - 删除清扫记录请求参数
 * @returns {Promise<DeleteCleaningRecordResponse>} - 删除清扫记录结果的 Promise 对象
 */
export const deleteCleaningRecord: (
  params: DeleteCleaningRecordParams
) => Promise<DeleteCleaningRecordResponse>;
```

---
#### 获取扫地机的语音包列表

`getVoiceList`

**引入**

> `@ray-js/ray^1.5.36` 且基础库版本 `2.21.0` 以上版本可使用

```js
import { getVoiceList } from '@ray-js/ray';
```

**参数**

**GetVoiceListParams**

获取扫地机语音包列表的请求参数。

| 属性     | 类型     | 默认值 | 必填 | 说明                                                              |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------- |
| devId    | `string` |        | 是   | 设备 Id                                                           |
| deviceId | `string` |        | 否   | 设备 Id（兼容字段）                                               |
| offset   | `number` |        | 是   | 分页偏移量，一般配置的语言包不多，可以不使用分页查询，传 `0` 即可 |
| limit    | `number` |        | 是   | 每页大小，建议传入 `100`                                          |

**返回**

**GetVoiceListResponse**

获取扫地机语音包列表的响应值。

| 属性       | 类型          | 说明           |
| ---------- | ------------- | -------------- |
| datas      | `VoiceData[]` | 语音包数据数组 |
| pageNo     | `number`      | 当前页码       |
| totalCount | `number`      | 数据总数       |

**VoiceData**

| 属性        | 类型         | 说明         |
| ----------- | ------------ | ------------ |
| auditionUrl | `string`     | 试听链接     |
| desc        | `string`     | 描述（可选） |
| extendData  | `ExtendData` | 扩展数据     |
| id          | `number`     | 语音包 ID    |
| imgUrl      | `string`     | 图片链接     |
| name        | `string`     | 名称         |
| officialUrl | `string`     | 官方链接     |
| productId   | `string`     | 产品 ID      |
| region      | `string[]`   | 区域代码数组 |

**ExtendData**

| 属性     | 类型     | 说明                                                                |
| -------- | -------- | ------------------------------------------------------------------- |
| extendId | `number` | 扩展 ID，用于与设备上报的语言包 ID 进行对比，判断语音包是否正在使用 |
| version  | `string` | 版本号                                                              |

**函数定义示例**

```typescript
/**
 * 获取扫地机的语音包列表
 * @param {GetVoiceListParams} params - 获取扫地机的语音包列表请求参数
 * @returns {Promise<GetVoiceListResponse>} - 获取扫地机语音包列表结果的 Promise 对象
 */
export const getVoiceList: (
  params: GetVoiceListParams
) => Promise<GetVoiceListResponse>;
```

---
#### 获取扫地机的历史地图

`getMultipleMapFiles`

**引入**

> `@ray-js/ray^1.5.36` 且基础库版本 `2.21.0` 以上版本可使用

```js
import {getMultipleMapFiles} from '@ray-js/ray';
```

**参数**

**GetMultipleMapFilesParams**

获取扫地机历史地图的请求参数。

| 属性  | 类型     | 默认值 | 必填 | 说明    |
| ----- | -------- | ------ | ---- | ------- |
| devId | `string` |        | 是   | 设备 Id |

**返回**

**GetMultipleMapFilesResponse**

获取扫地机历史地图的响应值。

| 属性       | 类型            | 说明         |
| ---------- | --------------- | ------------ |
| datas      | `MapFileData[]` | 历史地图列表 |
| totalCount | `number`        | 数据总数     |

**MapFileData**

| 属性     | 类型     | 说明                |
| -------- | -------- | ------------------- |
| bucket   | `string` | 存储文件的存储桶    |
| extend   | `string` | 文件的附加信息      |
| time     | `number` | 文件的时间戳        |
| id       | `number` | 文件的唯一标识符    |
| file     | `string` | 文件路径或地址      |
| devId    | `string` | 与文件关联的设备 ID |
| fileType | `string` | 文件类型            |

**函数定义示例**

```typescript
/**
 * 获取扫地机的历史地图
 * @param {GetMultipleMapFilesParams} params - 获取扫地机的历史地图请求参数
 * @returns {Promise<GetMultipleMapFilesResponse>} - 获取扫地机历史地图结果的 Promise 对象
 */
export const getMultipleMapFiles = (params: GetMultipleMapFilesParams) => Promise<GetMultipleMapFilesResponse>;
```

---

#### 获取云存储配置

`getSweeperStorageConfig`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

**参数**

**GetSweeperStorageConfigParams**

获取云存储配置

| 属性  | 类型     | 默认值 | 必填 | 说明    |
| ----- | -------- | ------ | ---- | ------- |
| devId | `string` |        | 是   | 设备 Id |

**返回**

**GetMultipleMapFilesResponse**

获取云存储配置返回值。

| 属性       | 类型     | 说明     |
| ---------- | -------- | -------- |
| ak         | `string` | 访问密钥 |
| bucket     | `string` | 存储桶   |
| sk         | `string` | 安全密钥 |
| token      | `string` | 令牌     |
| endpoint   | `string` | 端点     |
| expiration | `string` | 过期时间 |
| lifeCycle  | `number` | 生命周期 |
| region     | `string` | 区域     |

**函数定义示例**

```typescript
/**
 * 获取云存储配置
 * @param {GetSweeperStorageConfigParams} params - 获取云存储配置请求参数
 * @returns {Promise<GetSweeperStorageConfigResponse>} - 获取云存储配置结果的 Promise 对象
 */
export const getSweeperStorageConfig = (params: GetSweeperStorageConfigParams) => Promise<GetSweeperStorageConfigResponse>;
```

#### 重命名扫地机的历史地图

`renameHistoryMap`

**引入**

> `@ray-js/ray^1.7,10` 且基础库版本 `2.27.2` 以上版本可使用

```js
import {renameHistoryMap} from '@ray-js/ray';
```

**参数**

**RenameHistoryMapParams**

重命名扫地机的历史地图请求参数。

| 属性     | 类型     | 说明         |
| -------- | -------- | ------------ |
| devId    | `string` | 设备 Id      |
| id       | `number` | 地图 Id      |
| fileName | `string` | 新的文件名称 |

**返回**

**RenameHistoryMapResponse**

boolean 类型的值，表示是否成功

重命名扫地机的历史地图响应值。

**函数定义示例**

```typescript
export const renameHistoryMap = (params: RenameHistoryMapParams) => Promise<RenameHistoryMapResponse>;
```

## 惯导扫地机

#### 获取惯导扫地机的最新清扫地图

`getGyroLatestCleanMap`

**引入**

> `@ray-js/ray^1.7.14` 且基础库版本 `2.29.0` 以上版本可使用

```js
import { getGyroLatestCleanMap } from '@ray-js/ray';
```

**参数**

**GetGyroLatestCleanMapParams**

获取惯导扫地机的最新清扫地图的请求参数。

| 属性  | 类型     | 默认值 | 必填 | 说明     |
| ----- | -------- | ------ | ---- | -------- |
| devId | `string` |        | 是   | 设备 ID  |
| start | `number` |        | 是   | startRow |
| size  | `number` |        | 是   | 分页大小 |

**返回**

**GetGyroLatestCleanMapResponse**

获取惯导扫地机的最新清扫地图的响应结果。

| 属性        | 类型       | 说明         |
| ----------- | ---------- | ------------ |
| dataList    | `string[]` | 地图数据     |
| startRow    | `number`   | startRow     |
| devId       | `string`   | startRow     |
| mapId       | `number`   | 地图 ID      |
| startRow    | `number`   | startRow     |
| startTime   | `number`   | 开始时间     |
| endTime     | `number`   | 结束时间     |
| subRecordId | `number`   | 记录 ID      |
| hasNext     | `boolean`  | 是否有下一页 |

**函数定义示例**

```typescript
/**
 * 获取惯导扫地机的最新清扫地图
 * @param {GetGyroLatestCleanMapParams} params - 获取惯导扫地机的最新清扫地图请求参数
 * @returns {Promise<GetGyroLatestCleanMapResponse>} - 获取惯导扫地机的最新清扫地图结果的 Promise 对象
 */
export const getGyroLatestCleanMap = (params: GetGyroLatestCleanMapParams) => Promise<GetGyroLatestCleanMapResponse>;
```
#### 获取惯导扫地机的清扫记录列表

`getGyroCleanRecords`

**引入**

> `@ray-js/ray^1.7.14` 且基础库版本 `2.29.0` 以上版本可使用

```js
import { getGyroCleanRecords } from '@ray-js/ray';
```

**参数**

**GetGyroCleanRecordsParams**

获取惯导扫地机的清扫记录列表的请求参数。

| 属性   | 类型       | 默认值 | 必填 | 说明               |
| ------ | ---------- | ------ | ---- | ------------------ |
| devId  | `number`   |        | 是   | 设备 ID            |
| dpIds  | `number[]` |        | 是   | 清扫记录dp点的集合 |
| offset | `number`   |        | 是   | 偏移量             |
| limit  | `number`   |        | 是   | 分页大小           |

**返回**

**GetGyroCleanRecordsResponse**

获取惯导扫地机的清扫记录列表的响应结果。

| 属性       | 类型     | 说明         |
| ---------- | -------- | ------------ |
| datas      | `Data[]` | 地图数据     |
| totalCount | `number` | 清扫记录总数 |

**Data**

| 属性      | 类型     | 说明             |
| --------- | -------- | ---------------- |
| dpId      | `string` | dpId             |
| gid       | `string` | 家庭 ID          |
| gmtCreate | `number` | 清扫记录生成时间 |
| recordId  | `number` | 清扫记录 ID      |
| uuid      | `string` | 设备 UUID        |
| value     | `string` | 清扫记录数据     |

**函数定义示例**

```typescript
/**
 * 获取惯导扫地机的清扫记录列表
 * @param {GetGyroCleanRecordsParams} params - 获取惯导扫地机的清扫记录列表请求参数
 * @returns {Promise<GetGyroCleanRecordsResponse>} - 获取惯导扫地机的清扫记录列表结果的 Promise 对象
 */
export const getGyroCleanRecords = (params: GetGyroCleanRecordsParams) => Promise<GetGyroCleanRecordsResponse>;
```
#### 获取惯导扫地机的清扫记录地图

`getGyroCleanRecordDetail`

**引入**

> `@ray-js/ray^1.7.14` 且基础库版本 `2.29.0` 以上版本可使用

```js
import { getGyroCleanRecordDetail } from '@ray-js/ray';
```

**参数**

**GetGyroCleanRecordDetailParams**

获取惯导扫地机的清扫记录地图的请求参数。

| 属性        | 类型     | 默认值 | 必填 | 说明        |
| ----------- | -------- | ------ | ---- | ----------- |
| devId       | `string` |        | 是   | 设备 ID     |
| start       | `number` |        | 是   | startRow    |
| size        | `number` |        | 是   | 分页大小    |
| subRecordId | `number` |        | 是   | 清扫记录 ID |

**返回**

**GetGyroCleanRecordDetailResponse**

获取惯导扫地机的清扫记录地图的响应结果。

| 属性        | 类型       | 说明         |
| ----------- | ---------- | ------------ |
| dataList    | `string[]` | 地图数据     |
| startRow    | `number`   | startRow     |
| devId       | `string`   | startRow     |
| mapId       | `number`   | 地图 ID      |
| startRow    | `number`   | startRow     |
| startTime   | `number`   | 开始时间     |
| endTime     | `number`   | 结束时间     |
| subRecordId | `number`   | 记录 ID      |
| hasNext     | `boolean`  | 是否有下一页 |

**函数定义示例**

```typescript
/**
 * 获取惯导扫地机的清扫记录地图
 * @param {GetGyroCleanRecordDetailParams} params - 获取惯导扫地机的清扫记录地图请求参数
 * @returns {Promise<GetGyroCleanRecordDetailResponse>} - 获取惯导扫地机的清扫记录地图结果的 Promise 对象
 */
export const getGyroCleanRecordDetail = (params: GetGyroCleanRecordDetailParams) => Promise<GetGyroCleanRecordDetailResponse>;
```
#### 删除惯导扫地机的清扫记录

`deleteGyroCleanRecord`

**引入**

> `@ray-js/ray^1.7.14` 且基础库版本 `2.29.0` 以上版本可使用

```js
import { deleteGyroCleanRecord } from '@ray-js/ray';
```

**参数**

**DeleteGyroCleanRecordParams**

删除惯导扫地机的清扫记录的请求参数。

| 属性  | 类型     | 默认值 | 必填 | 说明                                 |
| ----- | -------- | ------ | ---- | ------------------------------------ |
| devId | `string` |        | 是   | 设备 ID                              |
| uuid  | `number` |        | 是   | 清扫记录 ID (列表接口返回的recordId) |

**返回**

**DeleteGyroCleanRecordResponse**

删除惯导扫地机的清扫记录的响应结果。

`boolean`

**函数定义示例**

```typescript
/**
 * 删除惯导扫地机的清扫记录
 * @param {DeleteGyroCleanRecordParams} params - 删除惯导扫地机的清扫记录请求参数
 * @returns {Promise<DeleteGyroCleanRecordResponse>} - 删除惯导扫地机的清扫记录结果的 Promise 对象
 */
export const deleteGyroCleanRecord = (params: DeleteGyroCleanRecordParams) => Promise<DeleteGyroCleanRecordResponse>;
```
